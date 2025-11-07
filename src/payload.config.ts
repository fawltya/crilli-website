import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
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
    ecommercePlugin({
      customers: {
        slug: 'users',
      },
      currencies: {
        defaultCurrency: 'GBP',
        supportedCurrencies: [
          {
            code: 'GBP',
            decimals: 2,
            label: 'British Pound',
            symbol: '£',
          },
        ],
      },
      access: {
        adminOnly: ({ req }) => {
          return false
        },
        adminOnlyFieldAccess: ({ req }) => {
          return true
        },
        adminOrCustomerOwner: ({ req }) => {
          return true
        },
        adminOrPublishedStatus: ({ req }) => {
          return true
        },
        customerOnlyFieldAccess: ({ req }) => {
          return false
        },
      },
      products: {
        productsCollectionOverride: ({ defaultCollection }) => {
          const filteredFields = defaultCollection.fields
            .filter((field) => {
              if (
                'name' in field &&
                (field.name === 'priceInUSDEnabled' || field.name === 'priceInUSD')
              ) {
                return false
              }
              if ('name' in field && field.name === 'inventory') {
                return false
              }
              return true
            })
            .map((field: any) => {
              if (field.name === 'title') {
                return {
                  ...field,
                  required: true,
                  admin: {
                    ...(field.admin || {}),
                    description: 'The name of the product',
                  },
                }
              }
              if (field.name === 'description') {
                return {
                  ...field,
                  admin: {
                    ...(field.admin || {}),
                    description: 'Detailed description of the product',
                  },
                }
              }
              return field
            })

          const hasTitle = filteredFields.some((field) => 'name' in field && field.name === 'title')
          if (!hasTitle) {
            filteredFields.unshift({
              name: 'title',
              type: 'text',
              label: 'Product Title',
              required: true,
              admin: {
                description: 'The name of the product',
              },
            })
          }

          const hasDescription = filteredFields.some(
            (field) => 'name' in field && field.name === 'description',
          )
          if (!hasDescription) {
            filteredFields.push({
              name: 'description',
              type: 'textarea',
              label: 'Product Description',
              admin: {
                description: 'Detailed description of the product',
              },
            })
          }

          return {
            ...defaultCollection,
            fields: [
              ...filteredFields,
              {
                name: 'gallery',
                type: 'array',
                label: 'Product Gallery',
                admin: {
                  description: 'Upload mockup images of the product',
                },
                fields: [
                  {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                  },
                ],
                minRows: 1,
              },
              {
                name: 'inkthreadable',
                type: 'group',
                label: 'Inkthreadable Configuration',
                fields: [
                  {
                    name: 'productCode',
                    type: 'text',
                    label: 'Product Code',
                    required: true,
                    admin: {
                      description:
                        'Base product code (e.g., STTU169). Variant codes will be auto-generated as {code}-{color}-{size}',
                    },
                  },
                ],
              },
              {
                name: 'productStatus',
                type: 'select',
                label: 'Product Status',
                required: true,
                defaultValue: 'live',
                options: [
                  {
                    label: 'Live',
                    value: 'live',
                  },
                  {
                    label: 'On Sale',
                    value: 'onSale',
                  },
                  {
                    label: 'Coming Soon',
                    value: 'comingSoon',
                  },
                  {
                    label: 'Not Available',
                    value: 'notAvailable',
                  },
                ],
                admin: {
                  description: 'Set the availability status of this product',
                },
              },
            ],
          }
        },
        variants: {
          variantOptionsCollectionOverride: ({
            defaultCollection,
          }: {
            defaultCollection: any
          }) => ({
            ...defaultCollection,
            fields: [
              ...defaultCollection.fields,
              {
                name: 'code',
                type: 'text',
                label: 'Code',
                required: true,
                admin: {
                  description:
                    'Short code for this option (e.g., BLK for Black, L for Large). Used in auto-generated product numbers.',
                },
              },
            ],
          }),
          variantsCollectionOverride: ({ defaultCollection }) => {
            const filteredFields = defaultCollection.fields.filter((field) => {
              if (
                'name' in field &&
                (field.name === 'priceInUSDEnabled' || field.name === 'priceInUSD')
              ) {
                return false
              }
              if ('name' in field && field.name === 'inventory') {
                return false
              }
              return true
            })

            return {
              ...defaultCollection,
              hooks: {
                ...defaultCollection.hooks,
                beforeChange: [
                  ...(defaultCollection.hooks?.beforeChange || []),
                  async ({ data, req, operation }) => {
                    if (!data || !req.payload) {
                      return data
                    }

                    try {
                      const productId =
                        typeof data.product === 'object' &&
                        data.product !== null &&
                        'id' in data.product
                          ? (data.product as { id: number }).id
                          : typeof data.product === 'number'
                            ? data.product
                            : null

                      if (!productId) {
                        console.warn('[Variant Hook] No product ID found in variant data')
                        return data
                      }

                      const product = await req.payload.findByID({
                        collection: 'products',
                        id: productId,
                        depth: 0,
                      })

                      if (!product?.inkthreadable?.productCode) {
                        console.warn(
                          '[Variant Hook] Product missing inkthreadable.productCode:',
                          productId,
                        )
                        return data
                      }

                      const productCode = product.inkthreadable.productCode

                      let colorCode = ''
                      let sizeCode = ''

                      if (
                        !data.options ||
                        !Array.isArray(data.options) ||
                        data.options.length === 0
                      ) {
                        console.warn('[Variant Hook] No options found in variant data')
                        return data
                      }

                      const variantOptions = await Promise.all(
                        data.options.map(async (optionId: unknown) => {
                          const id =
                            typeof optionId === 'object' && optionId !== null && 'id' in optionId
                              ? (optionId as { id: number }).id
                              : typeof optionId === 'number'
                                ? optionId
                                : null

                          if (!id) {
                            console.warn('[Variant Hook] Invalid option ID:', optionId)
                            return null
                          }

                          try {
                            const option = await req.payload.findByID({
                              collection: 'variantOptions',
                              id: id,
                              depth: 2,
                            })
                            return option
                          } catch (error) {
                            console.error(
                              '[Variant Hook] Error fetching variant option:',
                              id,
                              error,
                            )
                            return null
                          }
                        }),
                      )

                      for (const option of variantOptions) {
                        if (!option) continue

                        let variantType: { id: number; name?: string } | null = null

                        if ('variantType' in option && option.variantType) {
                          if (
                            typeof option.variantType === 'object' &&
                            option.variantType !== null &&
                            'name' in option.variantType
                          ) {
                            variantType = option.variantType as { id: number; name?: string }
                          } else {
                            const typeId =
                              typeof option.variantType === 'object' &&
                              option.variantType !== null &&
                              'id' in option.variantType
                                ? (option.variantType as { id: number }).id
                                : typeof option.variantType === 'number'
                                  ? option.variantType
                                  : null

                            if (typeId) {
                              try {
                                variantType = (await req.payload.findByID({
                                  collection: 'variantTypes',
                                  id: typeId,
                                  depth: 0,
                                })) as { id: number; name?: string } | null
                              } catch (error) {
                                console.error(
                                  '[Variant Hook] Error fetching variant type:',
                                  typeId,
                                  error,
                                )
                              }
                            }
                          }
                        }

                        if (variantType && variantType.name) {
                          const typeName = variantType.name.toLowerCase()
                          const optionData = option as {
                            code?: string
                            value?: string
                            label?: string
                          }
                          const optionCode =
                            optionData.code || optionData.value || optionData.label || ''

                          if (typeName === 'color' || typeName === 'colour') {
                            colorCode = optionCode.toUpperCase()
                          } else if (typeName === 'size') {
                            sizeCode = optionCode.toUpperCase()
                          }
                        }
                      }

                      if (productCode && colorCode && sizeCode) {
                        const generatedPn = `${productCode}-${colorCode}-${sizeCode}`
                        data.inkthreadable = {
                          ...(data.inkthreadable || {}),
                          productNumber: generatedPn,
                        }
                        console.log(
                          `[Variant Hook] Generated product number: ${generatedPn} (operation: ${operation})`,
                        )
                      } else {
                        console.warn(
                          `[Variant Hook] Missing required codes - productCode: ${productCode || 'missing'}, colorCode: ${colorCode || 'missing'}, sizeCode: ${sizeCode || 'missing'}`,
                        )
                        console.log(
                          '[Variant Hook] Variant options data:',
                          JSON.stringify(variantOptions, null, 2),
                        )
                      }
                    } catch (error) {
                      console.error('[Variant Hook] Error in beforeChange hook:', error)
                    }

                    return data
                  },
                ],
              },
              fields: [
                ...filteredFields,
                {
                  name: 'inkthreadable',
                  type: 'group',
                  label: 'Inkthreadable Variant Configuration',
                  fields: [
                    {
                      name: 'productNumber',
                      type: 'text',
                      label: 'Inkthreadable Product Number (pn)',
                      required: true,
                      admin: {
                        description:
                          'Auto-generated from product code, color code, and size code (format: {productCode}-{colorCode}-{sizeCode})',
                        readOnly: true,
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
                },
              ],
            }
          },
        },
      },
      carts: {
        cartsCollectionOverride: ({ defaultCollection }) => {
          return {
            ...defaultCollection,
            access: {
              read: () => true,
              create: () => true,
              update: () => true,
              delete: () => true,
              readVersions: () => true,
            },
          }
        },
      },
    }),
  ],
})
