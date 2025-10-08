import type { CollectionConfig } from 'payload'

export const posterArtist: CollectionConfig = {
  slug: 'poster-artist',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'instagram', 'colour'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'instagram',
      type: 'text',
      required: true,
    },
    {
      name: 'colour',
      type: 'text',
      admin: {
        description: 'Enter the colour in hex format (e.g., "#000000")',
      },
      required: true,
    },
  ],
}
