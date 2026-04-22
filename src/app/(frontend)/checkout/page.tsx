'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatPriceInGBP } from '@/lib/utils'
import { CircleNotch } from '@phosphor-icons/react'
import type { Product, Variant } from '@/payload-types'

export default function CheckoutPage() {
  const { cart } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'GB',
  })

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      router.push('/cart')
    }
  }, [cart, router])

  const calculatedSubtotal = useMemo(() => {
    const items = cart?.items || []
    return items.reduce((total, item) => {
      const productData = item.product
      const variantData = item.variant

      let product: Product | null = null
      if (typeof productData === 'object' && productData !== null && 'id' in productData) {
        product = productData as Product
      }

      const variant =
        variantData && typeof variantData === 'object' ? (variantData as Variant) : undefined

      let price = 0

      if (typeof productData === 'object' && productData !== null && 'priceInGBP' in productData) {
        const productPrice = (productData as { priceInGBP?: number; priceInGBPEnabled?: boolean })
          .priceInGBP
        const priceEnabled = (productData as { priceInGBPEnabled?: boolean }).priceInGBPEnabled
        if (productPrice !== undefined && productPrice !== null && priceEnabled !== false) {
          price = productPrice
        }
      }

      if (variant?.priceInGBP && variant.priceInGBPEnabled !== false) {
        price = variant.priceInGBP
      } else if (product?.priceInGBP && product.priceInGBPEnabled !== false) {
        price = product.priceInGBP
      }

      const quantity = item.quantity || 1
      const itemTotal = price * quantity

      return total + itemTotal
    }, 0)
  }, [cart?.items])

  const subtotal = cart?.subtotal && cart.subtotal > 0 ? cart.subtotal : calculatedSubtotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!cart?.id) {
        throw new Error('Cart not found')
      }

      const cartSecret =
        typeof window !== 'undefined' ? window.localStorage.getItem('cart_secret') : null
      if (!cartSecret) {
        throw new Error('Your cart session is missing. Return to the shop and try again.')
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cart.id,
          cartSecret,
          shippingAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold md:text-5xl">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg bg-gray-900 p-6">
              <h2 className="mb-6 text-2xl font-semibold">Shipping Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, name: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={shippingAddress.email}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, email: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="line1" className="mb-2 block text-sm font-medium">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="line1"
                    required
                    value={shippingAddress.line1}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, line1: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="line2" className="mb-2 block text-sm font-medium">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="line2"
                    value={shippingAddress.line2}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, line2: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="mb-2 block text-sm font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="mb-2 block text-sm font-medium">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="state" className="mb-2 block text-sm font-medium">
                      State / County
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="mb-2 block text-sm font-medium">
                      Country *
                    </label>
                    <select
                      id="country"
                      required
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, country: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-white focus:outline-none"
                    >
                      <option value="GB">United Kingdom</option>
                      <option value="IE">Ireland</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="NZ">New Zealand</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500 bg-red-900/50 p-4 text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg bg-gray-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-semibold">£{formatPriceInGBP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
              </div>
              <div className="mb-6 border-t border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>£{formatPriceInGBP(subtotal)}</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white py-6 text-lg font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <CircleNotch className="animate-spin" size={20} />
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
