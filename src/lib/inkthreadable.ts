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

      let size = ''
      let color = ''

      if (variant.options && Array.isArray(variant.options)) {
        for (const option of variant.options) {
          const optionData = typeof option === 'object' && 'variantType' in option ? option : null

          if (optionData && optionData.variantType) {
            const variantType =
              typeof optionData.variantType === 'object' ? optionData.variantType : null

            if (variantType) {
              const typeName = variantType.name?.toLowerCase() || ''
              const optionValue = optionData.code || optionData.value || optionData.label || ''

              if (typeName === 'size') {
                size = optionValue
              } else if (typeName === 'color' || typeName === 'colour') {
                color = optionValue
              }
            }
          }
        }
      }

      const designs: Record<string, string> = {}
      if (inkthreadableConfig.printFiles) {
        if (inkthreadableConfig.printFiles.front) {
          designs.front = inkthreadableConfig.printFiles.front
        }
        if (inkthreadableConfig.printFiles.back) {
          designs.back = inkthreadableConfig.printFiles.back
        }
        if (inkthreadableConfig.printFiles.left) {
          designs.left = inkthreadableConfig.printFiles.left
        }
        if (inkthreadableConfig.printFiles.right) {
          designs.right = inkthreadableConfig.printFiles.right
        }
      }

      const retailPriceInPounds = item.price ? (item.price / 100).toFixed(2) : undefined

      const orderItem: any = {
        pn: inkthreadableConfig.productNumber,
        quantity: String(item.quantity || 1),
        ...(size && { size: size }),
        ...(color && { color: color }),
        ...(retailPriceInPounds && { retailPrice: retailPriceInPounds }),
        ...(item.description && { description: item.description }),
      }

      if (Object.keys(designs).length > 0) {
        orderItem.designs = designs
      }

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

  const shippingAddress: InkthreadableShippingAddress = {
    firstName:
      shippingDetails?.address?.first_name || order.shippingAddress?.firstName || firstName,
    lastName: shippingDetails?.address?.last_name || order.shippingAddress?.lastName || lastName,
    company: shippingDetails?.address?.company || order.shippingAddress?.company || '',
    address1: shippingDetails?.address?.line1 || order.shippingAddress?.addressLine1 || '',
    address2: shippingDetails?.address?.line2 || order.shippingAddress?.addressLine2 || '',
    city: shippingDetails?.address?.city || order.shippingAddress?.city || '',
    county:
      shippingDetails?.address?.state ||
      order.shippingAddress?.state ||
      order.shippingAddress?.county ||
      '',
    postcode: shippingDetails?.address?.postal_code || order.shippingAddress?.postalCode || '',
    country: countryName,
    phone1:
      shippingDetails?.address?.phone ||
      order.shippingAddress?.phone ||
      order.shippingAddress?.phone1 ||
      '',
    phone2: order.shippingAddress?.phone2 || '',
    phone3: order.shippingAddress?.phone3 || '',
    vatNumber: order.shippingAddress?.vatNumber || '',
  }

  const billingAddress: InkthreadableShippingAddress = {
    ...shippingAddress,
  }

  const shippingMethod = order.shipping?.method || order.shippingMethod || 'regular'

  const orderPayload: any = {
    external_id: order.id?.toString() || order.orderNumber || `ORDER-${Date.now()}`,
    brandName: process.env.INKTHREADABLE_BRAND_NAME || 'Crilli',
    ...(order.comment && { comment: order.comment }),
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    items: items,
    shipping: {
      shippingMethod: shippingMethod,
    },
  }

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
