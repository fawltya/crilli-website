import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Cart, Order } from '@/payload-types'
import { buildMediaSrc } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const { cartId, cartSecret, shippingAddress } = body

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 })
    }

    if (!cartSecret || typeof cartSecret !== 'string') {
      return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 })
    }

    const cartIdNum = typeof cartId === 'string' ? parseInt(cartId, 10) : Number(cartId)
    if (!Number.isFinite(cartIdNum)) {
      return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 })
    }

    const cartResult = await payload.find({
      collection: 'carts',
      where: {
        and: [{ id: { equals: cartIdNum } }, { secret: { equals: cartSecret } }],
      },
      limit: 1,
      depth: 3,
      overrideAccess: true,
    })

    const cart = cartResult.docs[0] as Cart | undefined

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Invalid checkout request' }, { status: 403 })
    }

    let subtotal = 0
    const orderItems = cart.items.map((item) => {
      const product = item.product as any
      const variant = item.variant as any
      const price =
        variant?.priceInGBP && variant?.priceInGBPEnabled
          ? variant.priceInGBP
          : product?.priceInGBP && product?.priceInGBPEnabled
            ? product.priceInGBP
            : 0

      const itemTotal = price * (item.quantity || 1)
      subtotal += itemTotal

      return {
        product: typeof product === 'object' && product?.id ? product.id : product,
        variant: variant && typeof variant === 'object' && variant?.id ? variant.id : variant,
        quantity: item.quantity || 1,
        price,
      }
    })

    const order = (await payload.create({
      collection: 'orders',
      data: {
        items: orderItems,
        amount: subtotal,
        currency: 'GBP',
        status: null,
        customerEmail: shippingAddress.email || undefined,
        ...(shippingAddress && {
          shippingAddress: {
            firstName: shippingAddress.name.split(' ')[0] || '',
            lastName: shippingAddress.name.split(' ').slice(1).join(' ') || '',
            addressLine1: shippingAddress.line1 || '',
            addressLine2: shippingAddress.line2 || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postalCode: shippingAddress.postalCode || '',
            country: shippingAddress.country || 'GB',
          },
        }),
      },
      depth: 2,
    })) as Order

    const lineItems = cart.items.map((item) => {
      const product = item.product as any
      const variant = item.variant as any
      const price =
        variant?.priceInGBP && variant?.priceInGBPEnabled
          ? variant.priceInGBP
            : product?.priceInGBP && product?.priceInGBPEnabled
            ? product.priceInGBP
            : 0

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product?.title || 'Product',
            description: variant
              ? `${product?.title} - ${variant.options
                  ?.map((opt: any) => {
                    if (typeof opt === 'object' && opt !== null && 'label' in opt) {
                      return opt.label
                    }
                    return null
                  })
                  .filter(Boolean)
                  .join(', ')}`
              : product?.description || '',
            images: product?.gallery?.[0]?.image
              ? [
                  typeof product.gallery[0].image === 'object' &&
                  product.gallery[0].image !== null &&
                  'url' in product.gallery[0].image
                    ? buildMediaSrc((product.gallery[0].image as any).url)
                  : '',
              ].filter(Boolean)
              : [],
          },
          unit_amount: price,
        },
        quantity: item.quantity || 1,
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart`,
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE', 'US', 'CA', 'AU', 'NZ', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'PT', 'GR', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY'],
      },
      metadata: {
        orderId: order.id?.toString() || '',
        cartId: cartId.toString(),
      },
      customer_email: shippingAddress?.email || undefined,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

