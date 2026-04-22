import axios from 'axios'
import crypto from 'crypto'

const INKTHREADABLE_API_URL = process.env.INKTHREADABLE_API_URL || 'https://api.inkthreadable.co.uk'
const INKTHREADABLE_APP_ID = process.env.INKTHREADABLE_APP_ID
const INKTHREADABLE_SECRET_KEY = process.env.INKTHREADABLE_SECRET_KEY
const INKTHREADABLE_ENABLED = process.env.INKTHREADABLE_ENABLED === 'true'

export interface InkthreadableOrderItem {
  productNumber: string
  quantity: number
  size: string
  color: string
  printFiles?: {
    front?: string
    back?: string
    left?: string
    right?: string
  }
}

export interface InkthreadableShippingAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  county?: string
  postcode: string
  country: string
  phone1?: string
  phone2?: string
  phone3?: string
  vatNumber?: string
}

export interface CreateInkthreadableOrderParams {
  order: any // Payload order document
  shippingDetails?: any // Stripe shipping details
  customerEmail?: string
  payload?: any // Payload instance for fetching related data
}

export interface InkthreadableOrderResponse {
  id?: string
  orderId?: string
  status?: string
  message?: string
}

function generateSignature(requestBody: string, secretKey: string): string {
  return crypto
    .createHash('sha1')
    .update(requestBody + secretKey)
    .digest('hex')
}

export async function createInkthreadableOrder({
  order,
  shippingDetails,
  customerEmail,
  payload,
}: CreateInkthreadableOrderParams): Promise<InkthreadableOrderResponse> {
  const shouldMock = !INKTHREADABLE_ENABLED

  if (shouldMock) {
    console.warn('⚠️  [Inkthreadable] Order creation is DISABLED (INKTHREADABLE_ENABLED=false)')
    console.warn('⚠️  [Inkthreadable] This is a MOCK - no actual order will be created')
  } else {
    if (!INKTHREADABLE_APP_ID || !INKTHREADABLE_SECRET_KEY) {
      throw new Error('INKTHREADABLE_APP_ID and INKTHREADABLE_SECRET_KEY must be configured')
    }
    console.log('✅ [Inkthreadable] Creating REAL order (INKTHREADABLE_ENABLED=true)')
  }

  const items: any[] = []

  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      const variant = item.variant || item.productVariant
      const product = item.product

      if (!variant || !variant.inkthreadable) {
        console.warn('Variant missing Inkthreadable configuration:', variant?.id)
        continue
      }

      const inkthreadableConfig = variant.inkthreadable

      // Get color and size from variant fields directly (simplified structure)
      const color = variant.color || ''
      const size = variant.size || ''

      // Get designs from the design relationship (at variant level, not in inkthreadable)
      const designs: Record<string, string> = {}
      const design = variant.design
      if (design) {
        let designData: any = null

        // Handle both populated and unpopulated design references
        if (typeof design === 'object' && design !== null && 'printFiles' in design) {
          // Design is already populated
          designData = design
        } else if (typeof design === 'number' || (typeof design === 'object' && design !== null && 'id' in design)) {
          // Design is just an ID, need to fetch it
          // This shouldn't happen if depth is set correctly, but handle it just in case
          try {
            const designId = typeof design === 'number' ? design : (design as { id: number }).id
            if (payload) {
              designData = await payload.findByID({
                collection: 'designs',
                id: designId,
                depth: 0,
              })
            } else {
              console.warn('[Inkthreadable] Design not populated and payload not available to fetch it')
            }
          } catch (error) {
            console.warn(`[Inkthreadable] Failed to fetch design ${design}:`, error)
          }
        }

        if (designData && designData.printFiles) {
          if (designData.printFiles.front) {
            designs.front = designData.printFiles.front
          }
          if (designData.printFiles.back) {
            designs.back = designData.printFiles.back
          }
          if (designData.printFiles.left) {
            designs.left = designData.printFiles.left
          }
          if (designData.printFiles.right) {
            designs.right = designData.printFiles.right
          }
        }
      }

      // Get retail price from priceInGBP (the selling price to customers)
      // Convert from pence to pounds as a number (not string)
      let retailPrice: number | undefined = undefined
      if (variant?.priceInGBP && variant.priceInGBPEnabled !== false) {
        retailPrice = variant.priceInGBP / 100
      } else if (
        typeof product === 'object' &&
        product !== null &&
        'priceInGBP' in product &&
        (product as any).priceInGBPEnabled !== false
      ) {
        const productPrice = (product as any).priceInGBP
        if (productPrice !== undefined && productPrice !== null) {
          retailPrice = productPrice / 100
        }
      }

      // Build order item according to Inkthreadable API spec
      // Only include fields that are in the example - they add other fields server-side
      const orderItem: any = {
        pn: inkthreadableConfig.productNumber,
        quantity: item.quantity || 1, // Number, not string
        ...(retailPrice !== undefined && { retailPrice: retailPrice }), // Number, not string
        ...(item.description && { description: item.description }),
      }

      // Add designs if available (only front, back, left, right)
      if (Object.keys(designs).length > 0) {
        orderItem.designs = designs
      }

      // Note: label field is optional and requires specific configuration
      // We can add it later if needed: { type: "printed", name: "ink-label" }

      items.push(orderItem)
    }
  }

  if (items.length === 0) {
    throw new Error('No valid items found in order')
  }

  const shippingName =
    shippingDetails?.name ||
    `${shippingDetails?.address?.first_name || ''} ${shippingDetails?.address?.last_name || ''}`.trim() ||
    'Customer'
  const nameParts = shippingName.split(' ')
  const firstName = nameParts[0] || 'Customer'
  const lastName = nameParts.slice(1).join(' ') || ''

  const countryCodeMap: Record<string, string> = {
    GB: 'United Kingdom',
    IE: 'Ireland',
    US: 'United States',
    CA: 'Canada',
    AU: 'Australia',
    NZ: 'New Zealand',
    FR: 'France',
    DE: 'Germany',
    ES: 'Spain',
    IT: 'Italy',
    NL: 'Netherlands',
    BE: 'Belgium',
    AT: 'Austria',
    CH: 'Switzerland',
    SE: 'Sweden',
    NO: 'Norway',
    DK: 'Denmark',
    FI: 'Finland',
    PL: 'Poland',
    PT: 'Portugal',
    GR: 'Greece',
    CZ: 'Czech Republic',
    HU: 'Hungary',
    RO: 'Romania',
    BG: 'Bulgaria',
    HR: 'Croatia',
    SK: 'Slovakia',
    SI: 'Slovenia',
    EE: 'Estonia',
    LV: 'Latvia',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    MT: 'Malta',
    CY: 'Cyprus',
  }

  const countryCode = shippingDetails?.address?.country || order.shippingAddress?.country || 'GB'
  const countryName = countryCodeMap[countryCode.toUpperCase()] || countryCode

  // Build shipping address according to Inkthreadable API spec
  // Only include fields from the example
  const shippingAddress: any = {
    firstName:
      shippingDetails?.address?.first_name || order.shippingAddress?.firstName || firstName,
    lastName: shippingDetails?.address?.last_name || order.shippingAddress?.lastName || lastName,
    address1: shippingDetails?.address?.line1 || order.shippingAddress?.addressLine1 || '',
    city: shippingDetails?.address?.city || order.shippingAddress?.city || '',
    postcode: shippingDetails?.address?.postal_code || order.shippingAddress?.postalCode || '',
    country: countryName,
  }

  // Add optional fields only if they have values
  const company = shippingDetails?.address?.company || order.shippingAddress?.company
  if (company) {
    shippingAddress.company = company
  }

  const address2 = shippingDetails?.address?.line2 || order.shippingAddress?.addressLine2
  if (address2) {
    shippingAddress.address2 = address2
  }

  const county =
    shippingDetails?.address?.state ||
    order.shippingAddress?.state ||
    order.shippingAddress?.county
  if (county) {
    shippingAddress.county = county
  }

  const phone1 =
    shippingDetails?.address?.phone ||
    order.shippingAddress?.phone ||
    order.shippingAddress?.phone1
  if (phone1) {
    shippingAddress.phone1 = phone1
  }

  const shippingMethod = order.shipping?.method || order.shippingMethod || 'courier'

  // Build order payload according to Inkthreadable API spec
  // Only include fields from the example - they add other fields server-side
  const orderPayload: any = {
    brandName: process.env.INKTHREADABLE_BRAND_NAME || 'Crilli',
    ...(order.comment && { comment: order.comment }),
    shipping_address: shippingAddress,
    shipping: {
      shippingMethod: shippingMethod,
    },
    items: items,
  }

  // Note: packing_slip is added by Inkthreadable server-side, don't send it
  // Note: external_id, billing_address, and other fields are added server-side

  if (shouldMock) {
    console.log(
      '[Inkthreadable] Mock order payload (full details):',
      JSON.stringify(orderPayload, null, 2),
    )
    console.log('[Inkthreadable] Items breakdown:')
    items.forEach((item, index) => {
      console.log(`  Item ${index + 1}:`, JSON.stringify(item, null, 2))
    })

    return {
      id: `MOCK-${Date.now()}`,
      orderId: `MOCK-${Date.now()}`,
      status: 'mock',
      message:
        'This is a mock order - no actual order was created. Set INKTHREADABLE_ENABLED=true to create real orders.',
    }
  }

  const requestBody = JSON.stringify(orderPayload)

  if (!INKTHREADABLE_SECRET_KEY) {
    throw new Error('INKTHREADABLE_SECRET_KEY is required')
  }
  const signature = generateSignature(requestBody, INKTHREADABLE_SECRET_KEY)

  try {
    console.log('📤 [Inkthreadable] Sending order to:', `${INKTHREADABLE_API_URL}/api/orders.php`)
    console.log('📤 [Inkthreadable] Order payload:', JSON.stringify(orderPayload, null, 2))

    const response = await axios.post(`${INKTHREADABLE_API_URL}/api/orders.php`, orderPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        AppId: INKTHREADABLE_APP_ID,
        Signature: signature,
      },
    })

    console.log(
      '✅ [Inkthreadable] Order created successfully:',
      JSON.stringify(response.data, null, 2),
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Inkthreadable API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
      throw new Error(`Inkthreadable API error: ${error.response?.statusText || error.message}`)
    }
    throw error
  }
}
