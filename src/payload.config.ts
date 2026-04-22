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
import { Designs } from './collections/Designs'

const dirname = path.resolve(process.cwd(), 'src')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Events, Venues, Podcasts, posterArtist, Designs],
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
        isAdmin: () => false,
        adminOnlyFieldAccess: () => true,
        isDocumentOwner: ({ req }) => {
          if (!req.user) return false
          return {
            customer: {
              equals: req.user.id,
            },
          }
        },
        adminOrPublishedStatus: () => true,
        customerOnlyFieldAccess: () => false,
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
            access: {
              ...defaultCollection.access,
              create: ({ req }) => {
                // Allow authenticated admin users to create products
                return req.user !== undefined
              },
              read: ({ req }) => {
                // Allow public read access
                return true
              },
              update: ({ req }) => {
                // Allow authenticated admin users to update products
                return req.user !== undefined
              },
              delete: ({ req }) => {
                // Allow authenticated admin users to delete products
                return req.user !== undefined
              },
            },
            hooks: {
              ...defaultCollection.hooks,
              afterChange: [
                ...(defaultCollection.hooks?.afterChange || []),
                async ({ doc, req, operation }) => {
                  if (!doc || !req.payload) return

                  // Only auto-generate variants if colors and sizes are defined
                  if (
                    (!doc.colors || !Array.isArray(doc.colors) || doc.colors.length === 0) &&
                    (!doc.sizes || !Array.isArray(doc.sizes) || doc.sizes.length === 0)
                  ) {
                    return
                  }

                  // Only run on create or update operations
                  if (operation !== 'create' && operation !== 'update') {
                    return
                  }

                  try {
                    const productId = typeof doc.id === 'number' ? doc.id : parseInt(doc.id as string)
                    const colors = doc.colors || []
                    const sizes = doc.sizes || []
                    const productCode = doc.inkthreadable?.productCode

                    if (!productCode) {
                      console.warn(
                        '[Product Hook] Skipping variant generation: product is missing inkthreadable.productCode',
                      )
                      return
                    }

                    // If no colors or sizes, don't generate variants
                    if (colors.length === 0 && sizes.length === 0) {
                      return
                    }

                    // Generate all combinations
                    const combinations: Array<{ color?: { name: string; code: string }; size?: { name: string; code: string } }> = []

                    if (colors.length > 0 && sizes.length > 0) {
                      // Both colors and sizes: create all combinations
                      for (const color of colors) {
                        for (const size of sizes) {
                          combinations.push({ color, size })
                        }
                      }
                    } else if (colors.length > 0) {
                      // Only colors
                      for (const color of colors) {
                        combinations.push({ color })
                      }
                    } else if (sizes.length > 0) {
                      // Only sizes
                      for (const size of sizes) {
                        combinations.push({ size })
                      }
                    }

                    // Get existing variants for this product
                    const existingVariants = await req.payload.find({
                      collection: 'variants',
                      where: {
                        product: {
                          equals: productId,
                        },
                      },
                      depth: 0,
                      limit: 1000,
                    })

                    // Create a set of existing combinations for quick lookup
                    const existingCombinations = new Set<string>()
                    existingVariants.docs.forEach((variant: any) => {
                      const color = variant.color || ''
                      const size = variant.size || ''
                      const key = `${color}|${size}`
                      existingCombinations.add(key)
                    })

                    // Create variants for each combination that doesn't exist
                    for (const combo of combinations) {
                      // Extract color/size names directly from the objects
                      const colorName = combo.color?.name || ''
                      const sizeName = combo.size?.name || ''
                      const key = `${colorName}|${sizeName}`

                      // Skip if this combination already exists
                      if (existingCombinations.has(key)) {
                        continue
                      }

                      // Generate variant title
                      const parts = []
                      if (colorName) parts.push(colorName)
                      if (sizeName) parts.push(sizeName)
                      const variantTitle = parts.length > 0 ? `${doc.title} - ${parts.join(' / ')}` : doc.title

                      const colorCode = combo.color?.code
                        ? String(combo.color.code).toUpperCase()
                        : ''
                      const sizeCode = combo.size?.code
                        ? String(combo.size.code).toUpperCase()
                        : ''
                      let productNumber: string
                      if (productCode && colorCode && sizeCode) {
                        productNumber = `${productCode}-${colorCode}-${sizeCode}`
                      } else if (productCode && (colorCode || sizeCode)) {
                        productNumber = [productCode, colorCode, sizeCode].filter(Boolean).join('-')
                      } else {
                        productNumber = productCode
                      }

                      try {
                        await req.payload.create({
                          collection: 'variants',
                          draft: false,
                          data: {
                            title: variantTitle,
                            product: productId,
                            color: colorName || undefined,
                            size: sizeName || undefined,
                            inkthreadable: { productNumber },
                            _status: 'published',
                          },
                        })

                        console.log(`[Product Hook] Created variant: ${variantTitle}`)
                      } catch (error) {
                        console.error(`[Product Hook] Error creating variant for ${variantTitle}:`, error)
                      }
                    }
                  } catch (error) {
                    console.error('[Product Hook] Error in afterChange hook:', error)
                  }
                },
              ],
            },
            fields: [
              ...filteredFields,
              {
                name: 'colors',
                type: 'array',
                label: 'Available Colors',
                admin: {
                  description: 'Add the colors available for this product. Variants will be auto-generated.',
                },
                fields: [
                  {
                    name: 'name',
                    type: 'text',
                    label: 'Color Name',
                    required: true,
                    admin: {
                      description: 'e.g., Red, Blue, Black',
                    },
                  },
                  {
                    name: 'code',
                    type: 'text',
                    label: 'Color Code',
                    required: true,
                    admin: {
                      description: 'Short code for this color (e.g., RED, BLK). Used in auto-generated product numbers.',
                    },
                  },
                ],
              },
              {
                name: 'sizes',
                type: 'array',
                label: 'Available Sizes',
                admin: {
                  description: 'Add the sizes available for this product. Variants will be auto-generated.',
                },
                fields: [
                  {
                    name: 'name',
                    type: 'text',
                    label: 'Size Name',
                    required: true,
                    admin: {
                      description: 'e.g., Small, Medium, Large, XL',
                    },
                  },
                  {
                    name: 'code',
                    type: 'text',
                    label: 'Size Code',
                    required: true,
                    admin: {
                      description: 'Short code for this size (e.g., S, M, L, XL). Used in auto-generated product numbers.',
                    },
                  },
                ],
              },
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
          variantTypesCollectionOverride: ({ defaultCollection }) => ({
            ...defaultCollection,
            admin: {
              ...defaultCollection.admin,
              hidden: false, // Make variant types collection visible in admin
              useAsTitle: 'name',
              defaultColumns: ['name', 'label'],
            },
            access: {
              ...defaultCollection.access,
              create: ({ req }) => {
                // Allow authenticated admin users to create variant types
                return req.user !== undefined
              },
              read: ({ req }) => {
                // Allow public read access
                return true
              },
              update: ({ req }) => {
                // Allow authenticated admin users to update variant types
                return req.user !== undefined
              },
              delete: ({ req }) => {
                // Allow authenticated admin users to delete variant types
                return req.user !== undefined
              },
            },
          }),
          variantOptionsCollectionOverride: ({
            defaultCollection,
          }: {
            defaultCollection: any
          }) => ({
            ...defaultCollection,
            admin: {
              ...defaultCollection.admin,
              hidden: false, // Make variant options collection visible in admin
              useAsTitle: 'label',
              defaultColumns: ['label', 'value', 'variantType', 'product', 'code'],
            },
            access: {
              ...defaultCollection.access,
              create: ({ req }) => {
                // Allow authenticated admin users to create variant options
                return req.user !== undefined
              },
              read: ({ req }) => {
                // Allow public read access
                return true
              },
              update: ({ req }) => {
                // Allow authenticated admin users to update variant options
                return req.user !== undefined
              },
              delete: ({ req }) => {
                // Allow authenticated admin users to delete variant options
                return req.user !== undefined
              },
            },
            fields: [
              {
                name: 'product',
                type: 'relationship',
                relationTo: 'products',
                required: true,
                admin: {
                  description: 'The product this variant option belongs to. Colors and sizes are product-specific.',
                },
              },
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
              // Remove options field - we're using color and size directly
              if ('name' in field && field.name === 'options') {
                return false
              }
              return true
            })

            return {
              ...defaultCollection,
              admin: {
                ...defaultCollection.admin,
                hidden: false, // Make variants collection visible in admin
                useAsTitle: 'title',
                defaultColumns: ['title', 'product', 'color', 'size', 'design', 'priceInGBP'],
              },
              access: {
                ...defaultCollection.access,
                create: ({ req }) => {
                  // Allow authenticated admin users to create variants
                  return req.user !== undefined
                },
                read: ({ req }) => {
                  // Allow public read access
                  return true
                },
                update: ({ req }) => {
                  // Allow authenticated admin users to update variants
                  return req.user !== undefined
                },
                delete: ({ req }) => {
                  // Allow authenticated admin users to delete variants
                  return req.user !== undefined
                },
              },
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

                      // Get color and size codes from the variant data
                      let colorCode = ''
                      let sizeCode = ''

                      // Try to get codes from color/size fields directly
                      if (data.color) {
                        // If color is an object with code, use it; otherwise use the string
                        if (typeof data.color === 'object' && data.color !== null && 'code' in data.color) {
                          colorCode = String(data.color.code).toUpperCase()
                        } else {
                          // Look up the color code from the product's colors array
                          const colors = (product as any).colors || []
                          const colorMatch = colors.find((c: any) => 
                            c.name === data.color || c.code === data.color
                          )
                          colorCode = colorMatch?.code?.toUpperCase() || String(data.color).toUpperCase()
                        }
                      }

                      if (data.size) {
                        // If size is an object with code, use it; otherwise use the string
                        if (typeof data.size === 'object' && data.size !== null && 'code' in data.size) {
                          sizeCode = String(data.size.code).toUpperCase()
                        } else {
                          // Look up the size code from the product's sizes array
                          const sizes = (product as any).sizes || []
                          const sizeMatch = sizes.find((s: any) => 
                            s.name === data.size || s.code === data.size
                          )
                          sizeCode = sizeMatch?.code?.toUpperCase() || String(data.size).toUpperCase()
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
                      } else if (productCode && (colorCode || sizeCode)) {
                        // Handle cases where only color or only size is provided
                        const codes = [productCode, colorCode, sizeCode].filter(Boolean)
                        const generatedPn = codes.join('-')
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
                  name: 'color',
                  type: 'text',
                  label: 'Color',
                  admin: {
                    description: 'The color name for this variant (e.g., Red, Blue)',
                  },
                },
                {
                  name: 'size',
                  type: 'text',
                  label: 'Size',
                  admin: {
                    description: 'The size name for this variant (e.g., Small, Large)',
                  },
                },
                {
                  name: 'design',
                  type: 'relationship',
                  relationTo: 'designs',
                  label: 'Design',
                  admin: {
                    description:
                      'Select the design to use for this variant. Tip: Create designs with matching colors (e.g., if variant is "Red", select a design with color "Red"). Designs can be reused across different variants and products.',
                  },
                },
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
                      name: 'costPrice',
                      type: 'number',
                      label: 'Cost Price (from Inkthreadable)',
                      admin: {
                        description:
                          'The wholesale cost price from Inkthreadable in pence (e.g., 1200 for £12.00). This is what Inkthreadable charges you.',
                      },
                      required: false,
                    },
                  ],
                },
              ],
            }
          },
        },
      },
      orders: {
        ordersCollectionOverride: ({ defaultCollection }) => {
          return {
            ...defaultCollection,
            fields: [
              ...defaultCollection.fields,
              {
                name: 'inkthreadableOrderId',
                type: 'text',
                label: 'Inkthreadable Order ID',
                admin: {
                  description: 'The order ID returned from Inkthreadable API',
                  readOnly: true,
                },
              },
            ],
          }
        },
      },
    }),
  ],
})
