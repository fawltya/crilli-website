'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from '@phosphor-icons/react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useSearchParams } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()
  const hasClearedCart = useRef(false)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!hasClearedCart.current && sessionId) {
      clearCart()
      hasClearedCart.current = true
    }
  }, [clearCart, sessionId])
  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-green-500/20 p-4">
              <CheckCircle size={64} weight="fill" className="text-green-500" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Order Successful!</h1>
          <p className="mb-8 text-xl text-gray-400">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <p className="mb-8 text-gray-500">
            You will receive an email confirmation shortly with your order details.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/shop">
              <Button className="w-full bg-white text-black hover:bg-gray-200 sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800 sm:w-auto"
              >
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
