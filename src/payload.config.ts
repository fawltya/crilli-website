import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import * as path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { Venues } from './collections/Venues'
import { Podcasts } from './collections/Podcasts'
import { posterArtist } from './collections/PosterArtists'

const dirname = path.resolve(process.cwd(), 'src')
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Events, Venues, Podcasts, posterArtist],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
    seoPlugin({
      collections: ['events', 'podcasts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc.title || doc.artist} - Crilli`,
      generateDescription: ({ doc }) => {
        if (doc.title) {
          const venueName = doc.venue?.name || doc.venue?.title
          if (venueName) {
            return `Join us for ${doc.title} at ${venueName}`
          } else {
            return `Join us for ${doc.title}`
          }
        } else if (doc.artist) {
          return `Listen to ${doc.artist} on the Crilli podcast.`
        }
        return `Check out this content on Crilli`
      },
      generateURL: ({ doc }) => {
        let slug = ''
        if (doc.title) {
          slug = doc.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        } else if (doc.artist && doc.number) {
          slug = `${doc.artist}-${doc.number}`
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        }

        if (slug) {
          return `https://crilli.com/${slug}`
        }
        return `https://crilli.com/${doc.id}`
      },
      generateImage: ({ doc }) => {
        if (doc.posterImage) {
          return doc.posterImage
        }
        return null
      },
    }),
  ],
})
