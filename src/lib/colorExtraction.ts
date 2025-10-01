/**
 * Color extraction utilities for event posters
 * Extracts dominant colors from images for hover effects
 */

export interface ColorData {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}

/**
 * Extract dominant color from an image URL
 * Uses Canvas API to analyze image pixels
 */
export async function extractDominantColor(imageUrl: string): Promise<ColorData | null> {
  try {
    // Create a new image element
    const img = new Image()
    img.crossOrigin = 'anonymous' // Enable CORS for external images

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Create canvas to analyze the image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Set canvas size (smaller for performance)
          const size = 150
          canvas.width = size
          canvas.height = size

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, size, size)

          // Get image data
          const imageData = ctx.getImageData(0, 0, size, size)
          const data = imageData.data

          // Analyze pixels to find dominant color
          const colorCounts: { [key: string]: number } = {}
          const step = 4 // Sample every 4th pixel for performance

          for (let i = 0; i < data.length; i += step * 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]

            // Skip transparent pixels
            if (a < 128) continue

            // Skip very dark colors (won't be visible on black background)
            // Skip very light colors (likely background)
            const brightness = (r + g + b) / 3
            if (brightness < 120 || brightness > 225) continue
            // if (brightness < 200) continue

            // Prefer more saturated colors for better visibility
            const saturation = Math.max(r, g, b) - Math.min(r, g, b)
            if (saturation < 30) continue // Skip low saturation colors

            // Create color key
            const colorKey = `${Math.floor(r / 10) * 10},${Math.floor(g / 10) * 10},${Math.floor(b / 10) * 10}`
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1
          }

          // Find the most common color
          let dominantColor = '200,200,200' // Default light gray (visible on black background)
          let maxCount = 0

          for (const [color, count] of Object.entries(colorCounts)) {
            if (count > maxCount) {
              maxCount = count
              dominantColor = color
            }
          }

          console.log('Color extraction debug:', {
            totalPixels: data.length / 4,
            sampledPixels: Math.floor(data.length / (step * 4)),
            colorCounts: Object.keys(colorCounts).length,
            dominantColor,
            maxCount,
          })

          // Parse the dominant color
          const [r, g, b] = dominantColor.split(',').map(Number)

          // If the extracted color is still too dark, use a fallback
          const finalBrightness = (r + g + b) / 3
          let finalR = r
          let finalG = g
          let finalB = b

          console.log('Brightness check:', {
            originalColor: `${r},${g},${b}`,
            brightness: finalBrightness,
            needsFallback: finalBrightness < 140,
          })

          if (finalBrightness < 140) {
            // Use a bright, saturated fallback color
            // Try to maintain the hue if possible, but make it bright
            const maxChannel = Math.max(r, g, b)
            const minChannel = Math.min(r, g, b)

            if (maxChannel > minChannel) {
              // Maintain hue but increase brightness
              const scale = 180 / maxChannel
              finalR = Math.min(255, Math.round(r * scale))
              finalG = Math.min(255, Math.round(g * scale))
              finalB = Math.min(255, Math.round(b * scale))
            } else {
              // Use a bright cyan as fallback
              finalR = 100
              finalG = 200
              finalB = 255
            }

            console.log('Applied fallback:', {
              original: `${r},${g},${b}`,
              final: `${finalR},${finalG},${finalB}`,
              finalBrightness: (finalR + finalG + finalB) / 3,
            })
          }

          // Convert to different formats
          const hex = rgbToHex(finalR, finalG, finalB)
          const hsl = rgbToHsl(finalR, finalG, finalB)

          resolve({
            hex,
            rgb: { r: finalR, g: finalG, b: finalB },
            hsl,
          })
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      // Load the image
      img.src = imageUrl
    })
  } catch (error) {
    console.error('Error extracting color:', error)
    return null
  }
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// CSS Glow Shadow
export function generateGlowShadow(color: ColorData, intensity: number = 0.6): string {
  const { r, g, b } = color.rgb
  const alpha = intensity

  return `0 0 10px rgba(${r}, ${g}, ${b}, ${alpha * 0.5}), 0 0 30px rgba(${r}, ${g}, ${b}, ${alpha * 0.3}), 0 0 50px rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`
}

// CSS Border
export function generateBorderColor(color: ColorData, intensity: number = 0.8): string {
  const { r, g, b } = color.rgb
  const alpha = intensity

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
