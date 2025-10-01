'use client'

import { useState, useEffect } from 'react'
import { extractDominantColor, type ColorData } from '@/lib/colorExtraction'

/**
 * Custom hook to extract dominant color from an image
 * Caches results to avoid re-processing the same image
 */
export function useImageColor(imageUrl: string | null | undefined): {
  color: ColorData | null
  isLoading: boolean
  error: string | null
} {
  const [color, setColor] = useState<ColorData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setColor(null)
      setIsLoading(false)
      setError(null)
      return
    }

    // Check if we already have this color cached
    const cacheKey = `color_${imageUrl}`
    const cached = sessionStorage.getItem(cacheKey)

    // TEMPORARY: Clear cache to test new logic
    sessionStorage.removeItem(cacheKey)

    // Also clear any existing cache for this URL
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('color_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key))

    console.log('Cleared all color cache entries')

    if (cached) {
      try {
        const cachedColor = JSON.parse(cached)
        console.log('Using cached color for:', imageUrl, cachedColor)
        setColor(cachedColor)
        setIsLoading(false)
        setError(null)
        return
      } catch {
        // Invalid cache, continue with extraction
      }
    }

    setIsLoading(true)
    setError(null)

    extractDominantColor(imageUrl)
      .then((extractedColor) => {
        if (extractedColor) {
          console.log('Extracted color for:', imageUrl, extractedColor)
          setColor(extractedColor)
          // Cache the result
          sessionStorage.setItem(cacheKey, JSON.stringify(extractedColor))
        } else {
          setError('Failed to extract color')
        }
      })
      .catch((err) => {
        console.error('Color extraction error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [imageUrl])

  return { color, isLoading, error }
}
