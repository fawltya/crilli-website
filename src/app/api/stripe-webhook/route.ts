import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createInkthreadableOrder } from '@/lib/inkthreadable'
import { sendTransactionalEmail } from '@/lib/sender'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })

    if (event.type === 'checkout.session.completed') {
      console.log('[Webhook] Processing checkout.session.completed event')
      const session = event.data.object as Stripe.Checkout.Session

      console.log('[Webhook] Full Stripe session object:', JSON.stringify(session, null, 2))

      const metadata = session.metadata || {}
      console.log('[Webhook] Session metadata:', JSON.stringify(metadata, null, 2))

      const orderId = metadata.orderId || session.metadata?.orderId
      if (!orderId) {
        console.error('[Webhook] No order ID found in session metadata')
        console.error('[Webhook] Full session object:', JSON.stringify(session, null, 2))
        return NextResponse.json({ error: 'Order ID missing' }, { status: 400 })
      }

      console.log('[Webhook] Fetching order from Payload:', orderId)

      let order
      try {
        order = await payload.findByID({
          collection: 'orders',
          id: parseInt(orderId.toString(), 10),
          depth: 5,
        })
      } catch (findError) {
        console.error('[Webhook] Error fetching order:', findError)
        throw findError
      }

      if (!order) {
        console.error('[Webhook] Order not found:', orderId)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      console.log('[Webhook] Order found:', order.id)

      // Access shipping details - property name may vary by API version
      // Type assertion needed as Stripe types may not include all properties
      const sessionWithShipping = session as Stripe.Checkout.Session & { 
        shipping?: any;
        shipping_details?: any;
      }
      const shippingDetails = sessionWithShipping.shipping || sessionWithShipping.shipping_details || null
      const customerEmail: string | undefined = (session.customer_email || session.customer_details?.email) ?? undefined

      console.log('[Webhook] Shipping details:', JSON.stringify(shippingDetails, null, 2))
      console.log('[Webhook] Customer email:', customerEmail)

      try {
        const inkthreadableEnabled = process.env.INKTHREADABLE_ENABLED === 'true'
        if (!inkthreadableEnabled) {
          console.warn('[Webhook] ⚠️  Inkthreadable order creation is DISABLED')
          console.warn('[Webhook] ⚠️  Set INKTHREADABLE_ENABLED=true in .env to enable real orders')
        }
        
        console.log('[Webhook] Creating order at Inkthreadable...')
        const inkthreadableOrder = await createInkthreadableOrder({
          order,
          shippingDetails,
          customerEmail,
        })

        console.log('[Webhook] Inkthreadable order created:', JSON.stringify(inkthreadableOrder, null, 2))

        await payload.update({
          collection: 'orders',
          id: parseInt(orderId.toString(), 10),
          data: {
            inkthreadableOrderId: inkthreadableOrder.id || inkthreadableOrder.orderId,
            status: 'processing',
          },
        })

        console.log('[Webhook] Order updated in Payload with status: processing')

        try {
          console.log('[Webhook] Sending order confirmation email...')
          await sendTransactionalEmail({
            recipientEmail: customerEmail || order.customerEmail || '',
          })
          console.log('[Webhook] Order confirmation email sent successfully')
        } catch (emailError) {
          console.error('[Webhook] Failed to send order confirmation email:', emailError)
        }

        return NextResponse.json({
          success: true,
          message: 'Order processed successfully',
          inkthreadableOrderId: inkthreadableOrder.id || inkthreadableOrder.orderId,
        })
      } catch (inkthreadableError) {
        console.error('[Webhook] Failed to create order at Inkthreadable:', inkthreadableError)
        if (inkthreadableError instanceof Error) {
          console.error('[Webhook] Error message:', inkthreadableError.message)
          console.error('[Webhook] Error stack:', inkthreadableError.stack)
        }
        
        try {
          await payload.update({
            collection: 'orders',
            id: parseInt(orderId.toString(), 10),
            data: {
              status: 'cancelled',
            },
          })
        } catch (updateError) {
          console.error('[Webhook] Failed to update order status:', updateError)
        }

        return NextResponse.json(
          { 
            error: 'Failed to create order at Inkthreadable',
            details: inkthreadableError instanceof Error ? inkthreadableError.message : 'Unknown error'
          },
          { status: 500 },
        )
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const metadata = paymentIntent.metadata || {}

      const orderId = metadata.orderId
      if (orderId) {
        const order = await payload.findByID({
          collection: 'orders',
          id: typeof orderId === 'string' ? parseInt(orderId, 10) : orderId,
          depth: 2,
        })

        if (order) {
          await payload.update({
            collection: 'orders',
            id: typeof orderId === 'string' ? parseInt(orderId, 10) : orderId,
            data: {
              status: 'completed',
            },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Webhook processing error:', error)
    if (error instanceof Error) {
      console.error('[Webhook] Error message:', error.message)
      console.error('[Webhook] Error stack:', error.stack)
    }
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    )
  }
}

