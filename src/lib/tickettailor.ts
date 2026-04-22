import axios from 'axios'

const TICKETTAILOR_API_URL = process.env.TICKETTAILOR_API_URL
const TICKETTAILOR_API_KEY = process.env.TICKETTAILOR_API_KEY

export interface TicketTailorEvent {
  id: string
  name: string
  description: string
  start_at: string
  end_at: string
  start: {
    date: string
    time: string
    formatted: string
    iso: string
    timezone: string
    unix: number
  }
  end: {
    date: string
    time: string
    formatted: string
    iso: string
    timezone: string
    unix: number
  }
  venue: {
    name: string
    address: string
  }
  ticket_url: string
  checkout_url: string
  image_url: string
  images: {
    header: string
    thumbnail: string
  }
  ticket_types: {
    id: string
    name: string
    price: number
    currency: string
  }[]
  status: 'published' | 'draft' | 'sales_closed'
}

interface TicketTailorQueryParams {
  start_at?: number
  'start_at.gt'?: number
  'start_at.gte'?: number
  'start_at.lt'?: number
  'start_at.lte'?: number
  end_at?: number
  'end_at.gt'?: number
  'end_at.gte'?: number
  'end_at.lt'?: number
  'end_at.lte'?: number
  starting_after?: string
  ending_before?: string
  limit?: number
  status?: 'published' | 'draft' | 'sales_closed' | string
}

export async function getTicketTailorEvents(
  params: TicketTailorQueryParams = {},
): Promise<TicketTailorEvent[]> {
  if (!TICKETTAILOR_API_URL || !TICKETTAILOR_API_KEY) {
    throw new Error('TicketTailor API credentials not configured')
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching TicketTailor events', { url: TICKETTAILOR_API_URL, params })
    }

    const response = await axios.get(`${TICKETTAILOR_API_URL}/v1/events`, {
      headers: {
        Accept: 'application/json',
      },
      auth: {
        username: TICKETTAILOR_API_KEY,
        password: '',
      },
      params: {
        ...params,
        status: 'published', // Only get published events by default
        'start_at.gte': Math.floor(Date.now() / 1000), // Only get upcoming events by default
      },
    })

    if (process.env.NODE_ENV === 'development') {
      const n = Array.isArray(response.data?.data) ? response.data.data.length : 0
      console.log('TicketTailor API: events count', n)
    }
    return response.data.data
  } catch (error) {
    console.error('Error fetching TicketTailor events:', error)
    if (axios.isAxiosError(error)) {
      console.error('TicketTailor status:', error.response?.status)
    }
    throw error
  }
}

export async function getTicketTailorEvent(eventId: string): Promise<TicketTailorEvent> {
  if (!TICKETTAILOR_API_URL || !TICKETTAILOR_API_KEY) {
    throw new Error('TicketTailor API credentials not configured')
  }

  try {
    const response = await axios.get(`${TICKETTAILOR_API_URL}/v1/events/${eventId}`, {
      headers: {
        Accept: 'application/json',
      },
      auth: {
        username: TICKETTAILOR_API_KEY,
        password: '',
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error fetching TicketTailor event ${eventId}:`, error)
    throw error
  }
}
