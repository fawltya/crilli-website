'use client'

import { useState, useEffect } from 'react'
import type { Product, Variant } from '@/payload-types'
import { Button } from './ui/button'
import { formatPriceInGBP } from '@/lib/utils'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

interface ProductVariantSelectorProps {
  product: Product
  variants: Variant[]
  colors: Array<{ name: string; code: string }>
  sizes: Array<{ name: string; code: string }>
}

export default function ProductVariantSelector({
  product,
  variants,
  colors,
  sizes,
}: ProductVariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    // Set initial selections
    if (colors.length > 0) setSelectedColor(colors[0].name)
    if (sizes.length > 0) setSelectedSize(sizes[0].name)
  }, [colors, sizes])

  useEffect(() => {
    // Find matching variant based on selected color and size
    const matchingVariant = variants.find((variant) => {
      const variantColor = variant.color || ''
      const variantSize = variant.size || ''

      const colorMatch = !selectedColor || variantColor === selectedColor
      const sizeMatch = !selectedSize || variantSize === selectedSize

      return colorMatch && sizeMatch
    })

    setSelectedVariant(matchingVariant || null)
  }, [selectedColor, selectedSize, variants])

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Please select all options')
      return
    }

    setIsAdding(true)
    try {
      await addItem(
        {
          product: product.id,
          variant: selectedVariant.id,
        },
        1,
      )
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-medium">Color:</label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedColor === color.name
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`rounded-md border-2 px-4 py-2 transition-colors ${
                    isSelected
                      ? 'border-white bg-white text-black'
                      : 'border-gray-600 bg-transparent text-white hover:border-gray-400'
                  }`}
                >
                  {color.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-medium">Size:</label>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const isSelected = selectedSize === size.name
              return (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size.name)}
                  className={`rounded-md border-2 px-4 py-2 transition-colors ${
                    isSelected
                      ? 'border-white bg-white text-black'
                      : 'border-gray-600 bg-transparent text-white hover:border-gray-400'
                  }`}
                >
                  {size.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedVariant && (
        <div className="rounded-lg bg-gray-900 p-4">
          <p className="mb-2 text-sm text-gray-400">Selected Variant:</p>
          <p className="font-semibold">
            {selectedVariant.priceInGBP && selectedVariant.priceInGBPEnabled
              ? `£${formatPriceInGBP(selectedVariant.priceInGBP)}`
              : product.priceInGBP && product.priceInGBPEnabled
                ? `£${formatPriceInGBP(product.priceInGBP)}`
                : 'Price not available'}
          </p>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={!selectedVariant || isAdding}
        className="w-full bg-white py-6 text-lg font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAdding ? 'Adding...' : selectedVariant ? 'Add to Cart' : 'Select Options'}
      </Button>
    </div>
  )
}
