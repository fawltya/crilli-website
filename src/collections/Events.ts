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
      required: true,
      admin: {
        description: 'Enter the start time (e.g., "7:00 PM")',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Enter the end time (e.g., "10:00 PM")',
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
        description: 'Enter the price (e.g., "Free", "$20", "£15")',
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
  ],
}
