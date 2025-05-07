import { getPayload } from 'payload'
import { put } from '@vercel/blob'
import config from '@/payload.config'

// This is a utility endpoint to help fix existing images
// It will check images with /api/media paths and attempt to re-upload them to Vercel Blob
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'This utility is disabled in production' }, { status: 403 })
  }

  try {
    const payload = await getPayload({ config })
    
    // Fetch media with incorrect URLs (containing /api/media)
    const { docs } = await payload.find({
      collection: 'media',
      where: {
        url: {
          contains: '/api/media',
        },
      },
      limit: 5 // Process a few at a time to avoid timeout
    })
    
    const results = []
    
    for (const media of docs) {
      try {
        if (!media.url) {
          results.push({
            id: media.id,
            status: 'skipped',
            reason: 'No URL found'
          })
          continue
        }
        
        // Get the image data from the current URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}${media.url}`)
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
        
        const buffer = await response.arrayBuffer()
        const filename = media.filename || media.url.split('/').pop() || 'untitled.jpg'
        
        // Upload to Vercel Blob
        const blob = await put(filename, new Uint8Array(buffer), {
          access: 'public',
        })
        
        // Update the media record
        await payload.update({
          collection: 'media',
          id: media.id,
          data: {
            url: blob.url,
            filename: blob.pathname,
          }
        })
        
        results.push({
          id: media.id,
          oldUrl: media.url,
          newUrl: blob.url,
          status: 'fixed'
        })
      } catch (error: any) {
        console.error(`Error fixing image ${media.id}:`, error)
        results.push({
          id: media.id,
          url: media.url,
          status: 'error',
          error: error?.message || String(error)
        })
      }
    }
    
    return Response.json({
      success: true,
      processed: docs.length,
      results
    })
  } catch (error: any) {
    console.error('Error in fix-images route:', error)
    return Response.json({ error: error?.message || String(error) }, { status: 500 })
  }
} 