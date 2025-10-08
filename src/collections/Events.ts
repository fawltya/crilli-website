import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'venue', 'city'],
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
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'startTime',
      type: 'text',
      admin: {
        description: 'Enter the start time in 24hr format (e.g., "22:00") - Optional',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      admin: {
        description: 'Enter the end time in 24hr format (e.g., "03:00") - Optional',
      },
    },
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
      required: true,
      admin: {
        description: 'Select the venue for this event',
      },
    },
    {
      name: 'price',
      type: 'text',
      admin: {
        description:
          'Enter the price, use 0 for free and no £ prefix needed (e.g., "0", "10", "12.50")',
      },
    },
    {
      name: 'eventLink',
      type: 'text',
      admin: {
        description: 'Link to the event page or ticket sales',
      },
    },
    {
      name: 'posterImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload the event poster image',
      },
    },
    {
      name: 'posterArtist',
      type: 'relationship',
      relationTo: 'poster-artist',
      required: false,
      admin: {
        description: 'Select the poster artist for this event',
      },
    },
  ],
}
