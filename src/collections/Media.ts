import type { CollectionConfig } from 'payload'
import { put } from '@vercel/blob'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        if (req.file) {
          const blob = await put(req.file.name, req.file.data, {
            access: 'public',
          })
          return {
            ...data,
            url: blob.url,
            filename: blob.pathname,
          }
        }
        return data
      },
    ],
  },
  upload: {
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
  ],
}
