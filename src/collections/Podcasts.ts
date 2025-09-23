import type { CollectionConfig } from 'payload'

export const Podcasts: CollectionConfig = {
  slug: 'podcasts',
  admin: {
    useAsTitle: 'artist',
    defaultColumns: ['number', 'artist'],
  },
  defaultSort: '-createdAt',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'artist',
      type: 'text',
      required: true,
    },
    {
      name: 'number',
      type: 'text',
      required: true,
      admin: {
        description: 'Should follow 2025/01 format (year/episode number)',
      },
    },
    {
      name: 'eventLink',
      type: 'text',
      admin: {
        description: 'Link to the Podcast',
      },
    },
    {
      name: 'posterImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload the Podcast image - should be square',
      },
    },
  ],
}
