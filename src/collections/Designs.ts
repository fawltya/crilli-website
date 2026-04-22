import type { CollectionConfig } from 'payload'

export const Designs: CollectionConfig = {
  slug: 'designs',
  admin: {
    hidden: false, // Explicitly make Designs collection visible in admin
    useAsTitle: 'name',
    defaultColumns: ['name', 'color', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      // Allow authenticated admin users to create designs
      return req.user !== undefined
    },
    update: ({ req }) => {
      // Allow authenticated admin users to update designs
      return req.user !== undefined
    },
    delete: ({ req }) => {
      // Allow authenticated admin users to delete designs
      return req.user !== undefined
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Design Name',
      required: true,
      admin: {
        description: 'A descriptive name for this design (e.g., "Crilli Logo - Red", "Festival Design")',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Color',
      admin: {
        description:
          'The color this design is intended for (e.g., "Red", "Blue"). Used to organize designs and match them to variant colors.',
        position: 'sidebar',
      },
    },
    {
      name: 'printFiles',
      type: 'group',
      label: 'Print File URLs',
      fields: [
        {
          name: 'front',
          type: 'text',
          label: 'Front Print File URL',
          admin: {
            description: 'URL to the front print file',
          },
        },
        {
          name: 'back',
          type: 'text',
          label: 'Back Print File URL',
          admin: {
            description: 'URL to the back print file',
          },
        },
        {
          name: 'left',
          type: 'text',
          label: 'Left Print File URL',
          admin: {
            description: 'URL to the left print file',
          },
        },
        {
          name: 'right',
          type: 'text',
          label: 'Right Print File URL',
          admin: {
            description: 'URL to the right print file',
          },
        },
      ],
    },
  ],
}

