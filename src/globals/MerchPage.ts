import type { GlobalConfig } from 'payload'

export const defaultMerchIntro =
  'Pre Order before Monday 1st December for UK delivery by Christmas. Oversized, boxy fit hood with a heavyweight build and premium finish. 80% organic cotton, 20% recycled polyester. 420gsm. Design by Benjac.'

export const MerchPage: GlobalConfig = {
  slug: 'merch-page',
  label: 'Merch page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      label: 'Intro',
      defaultValue: defaultMerchIntro,
      admin: {
        description:
          'Optional paragraph shown under the Merch heading. Leave empty to hide it.',
      },
    },
  ],
}
