'use client'

import { useEffect, useState, useMemo } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { buildMediaSrc, formatPriceInGBP } from '@/lib/utils'
import type { Product, Variant, Media } from '@/payload-types'
import { Trash } from '@phosphor-icons/react'

export default function CartPage() {
  const { cart, removeItem, decrementItem, clearCart } = useCart()
  const [enrichedProducts, setEnrichedProducts] = useState<Record<number, Product>>({})

  const items = cart?.items || []

  const calculatedSubtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const productData = item.product
      const variantData = item.variant

      let product: Product | null = null
      if (typeof productData === 'object' && productData !== null && 'id' in productData) {
        const productId = productData.id as number
        product = enrichedProducts[productId] || (productData as Product)
      } else if (typeof productData === 'number' && enrichedProducts[productData]) {
        product = enrichedProducts[productData]
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
  }, [items, enrichedProducts])

  const subtotal = cart?.subtotal && cart.subtotal > 0 ? cart.subtotal : calculatedSubtotal

  useEffect(() => {
    const fetchMissingProducts = async () => {
      if (!cart?.items) return

      const productsToFetch: number[] = []

      cart.items.forEach((item) => {
        const productData = item.product
        if (
          typeof productData === 'object' &&
          productData !== null &&
          'id' in productData &&
          typeof productData.id === 'number' &&
          (!('title' in productData) || !productData.title)
        ) {
          productsToFetch.push(productData.id)
        }
      })

      if (productsToFetch.length === 0) return

      const fetchedProducts: Record<number, Product> = {}

      await Promise.all(
        productsToFetch.map(async (productId) => {
          try {
            const response = await fetch(`/api/products/${productId}?depth=3`)
            if (response.ok) {
              const product = await response.json()
              fetchedProducts[productId] = product
            }
          } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error)
          }
        }),
      )

      if (Object.keys(fetchedProducts).length > 0) {
        setEnrichedProducts((prev) => ({ ...prev, ...fetchedProducts }))
      }
    }

    fetchMissingProducts()
  }, [cart])

  if (items.length === 0) {
    return (
      <div className="min-h-screen text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="mb-8 text-4xl font-bold md:text-5xl">Shopping Cart</h1>
          <div className="py-20 text-center">
            <p className="mb-8 text-xl text-gray-400">Your cart is empty</p>
            <Link href="/shop">
              <Button className="bg-white text-black hover:bg-gray-200">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold md:text-5xl">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items
              .flatMap((item, itemIndex) => {
                const quantity = item.quantity || 1
                return Array.from({ length: quantity }, (_, quantityIndex) => ({
                  ...item,
                  visualKey: `${item.id || itemIndex}-${quantityIndex}`,
                }))
              })
              .map((item) => {
                const productData = item.product
                let product: Product | null = null

                if (
                  typeof productData === 'object' &&
                  productData !== null &&
                  'id' in productData
                ) {
                  const productId = productData.id as number

                  if (enrichedProducts[productId]) {
                    product = enrichedProducts[productId]
                  } else if ('title' in productData && productData.title) {
                    product = productData as Product
                  } else {
                    product = productData as Product
                  }
                } else if (typeof productData === 'number') {
                  if (enrichedProducts[productData]) {
                    product = enrichedProducts[productData]
                  } else {
                    console.warn('Product is ID only, not populated:', productData)
                  }
                }

                const variantData = item.variant
                let variant: Variant | undefined = undefined

                if (variantData && typeof variantData === 'object' && variantData !== null) {
                  variant = variantData as Variant
                } else if (typeof variantData === 'number') {
                  console.warn('Variant is ID only, not populated:', variantData)
                }

                const firstGalleryImage = product?.gallery?.[0]?.image as Media | undefined
                const imageUrl = firstGalleryImage?.url
                  ? buildMediaSrc(firstGalleryImage.url)
                  : null

                const slug =
                  product?.title
                    ?.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim() || ''

                const price =
                  variant?.priceInGBP && variant?.priceInGBPEnabled
                    ? variant.priceInGBP
                    : product?.priceInGBP && product?.priceInGBPEnabled
                      ? product.priceInGBP
                      : 0

                const itemTotal = price

                const itemIdString = (item as any).visualKey || item.id || `item-${Math.random()}`
                const itemId = item.id

                if (!product) {
                  console.warn('Cart item missing product data:', {
                    itemId: item.id,
                    product: item.product,
                    variant: item.variant,
                    productType: typeof item.product,
                    variantType: typeof item.variant,
                    fullItem: JSON.stringify(item, null, 2),
                  })
                }

                return (
                  <div key={itemIdString} className="flex gap-4 rounded-lg bg-gray-900 p-4">
                    {imageUrl ? (
                      <Link href={`/shop/${slug}`} className="flex-shrink-0">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                          <Image
                            src={imageUrl}
                            alt={product?.title || 'Product'}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800">
                        <span className="text-xs text-gray-600">No image</span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        {product?.title ? (
                          <Link href={`/shop/${slug}`}>
                            <h3 className="mb-1 font-semibold hover:text-gray-300">
                              {product.title}
                            </h3>
                          </Link>
                        ) : product?.id ? (
                          <h3 className="mb-1 font-semibold text-gray-500">
                            Product #{product.id}
                          </h3>
                        ) : (
                          <h3 className="mb-1 font-semibold text-gray-500">
                            Product{' '}
                            {typeof item.product === 'number' ? `#${item.product}` : 'Unknown'}
                          </h3>
                        )}
                        {variant && variant.options && Array.isArray(variant.options) && (
                          <p className="text-sm text-gray-400">
                            {variant.options
                              .map((opt) => {
                                if (typeof opt === 'object' && opt !== null && 'label' in opt) {
                                  return opt.label
                                }
                                return null
                              })
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                        {product && !product.title && (
                          <p className="text-xs text-yellow-400">
                            Product details loading... (ID: {product.id})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">£{formatPriceInGBP(itemTotal)}</p>
                          <button
                            onClick={async () => {
                              try {
                                const currentItem = cart?.items?.find((i) => {
                                  if (typeof i.id === 'string' && typeof item.id === 'string') {
                                    return i.id === item.id
                                  }
                                  if (typeof i.id === 'number' && typeof item.id === 'number') {
                                    return i.id === item.id
                                  }
                                  return false
                                })
                                const currentQuantity = currentItem?.quantity || 1

                                const idToUse = item.id
                                if (currentQuantity > 1) {
                                  await decrementItem(idToUse as any)
                                } else {
                                  await removeItem(idToUse as any)
                                }
                              } catch (error) {
                                console.error('Error removing item:', error)
                                alert(
                                  `Failed to remove item: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                )
                              }
                            }}
                            className="text-red-400 transition-colors hover:text-red-300"
                            aria-label="Remove item"
                          >
                            <Trash size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

            <div className="pt-4">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart()
                  }
                }}
                className="text-sm text-gray-400 transition-colors hover:text-gray-300"
              >
                Clear cart
              </button>
            </div>
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
              <Link href="/checkout" className="block">
                <Button className="w-full bg-white py-6 text-lg font-semibold text-black hover:bg-gray-200">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link
                href="/shop"
                className="mt-4 block text-center text-sm text-gray-400 transition-colors hover:text-gray-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
