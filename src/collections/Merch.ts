import type { CollectionConfig } from 'payload'

export const Merch: CollectionConfig = {
  slug: 'merch',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'text',
      admin: {
        description: 'Display price, no £ prefix needed (e.g. "25", "12.50")',
      },
    },
    {
      name: 'buyLink',
      type: 'text',
      required: true,
      admin: {
        description: 'TicketTailor link where people buy this item',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Square product image',
      },
    },
  ],
}
