import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    
    // Fetch the latest image from media collection
    const { docs } = await payload.find({
      collection: 'media',
      sort: '-createdAt',
      limit: 5
    })
    
    // Return basic information about the images
    return Response.json({
      imageInfo: docs.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        url: doc.url,
        alt: doc.alt,
        createdAt: doc.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return Response.json({ error: 'Failed to fetch media data' }, { status: 500 })
  }
} 