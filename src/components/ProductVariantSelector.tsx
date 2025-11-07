'use client'

import { useState, useEffect } from 'react'
import type { Product, Variant, VariantOption } from '@/payload-types'
import { Button } from './ui/button'
import { formatPriceInGBP } from '@/lib/utils'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

interface ProductVariantSelectorProps {
  product: Product
  variants: Variant[]
  variantOptionsByType: Record<string, VariantOption[]>
}

export default function ProductVariantSelector({
  product,
  variants,
  variantOptionsByType,
}: ProductVariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const initial: Record<string, number> = {}
    Object.keys(variantOptionsByType).forEach((typeName) => {
      const options = variantOptionsByType[typeName]
      if (options && options.length > 0) {
        initial[typeName] = options[0].id
      }
    })
    setSelectedOptions(initial)
  }, [variantOptionsByType])

  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0) return

    const selectedOptionIds = Object.values(selectedOptions)

    const matchingVariant = variants.find((variant) => {
      if (!variant.options || !Array.isArray(variant.options)) return false

      const variantOptionIds = variant.options.map((opt) =>
        typeof opt === 'object' && opt !== null ? opt.id : opt,
      )

      return (
        selectedOptionIds.length === variantOptionIds.length &&
        selectedOptionIds.every((id) => variantOptionIds.includes(id)) &&
        variantOptionIds.every((id) => selectedOptionIds.includes(id))
      )
    })

    setSelectedVariant(matchingVariant || null)
  }, [selectedOptions, variants])

  const handleOptionChange = (typeName: string, optionId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [typeName]: optionId,
    }))
  }

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
      {Object.entries(variantOptionsByType).map(([typeName, options]) => (
        <div key={typeName}>
          <label className="block text-sm font-medium mb-3 capitalize">
            {typeName}:
          </label>
          <div className="flex flex-wrap gap-3">
            {options.map((option) => {
              const isSelected = selectedOptions[typeName] === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionChange(typeName, option.id)}
                  className={`px-4 py-2 rounded-md border-2 transition-colors ${
                    isSelected
                      ? 'border-white bg-white text-black'
                      : 'border-gray-600 bg-transparent text-white hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <div className="p-4 bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Selected Variant:</p>
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
        className="w-full py-6 text-lg font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAdding
          ? 'Adding...'
          : selectedVariant
            ? 'Add to Cart'
            : 'Select Options'}
      </Button>
    </div>
  )
}

