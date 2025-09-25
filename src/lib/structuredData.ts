export interface EventForStructuredData {
  id: string
  title: string
  date: string
  startTime?: string | null
  endTime?: string | null
  posterImage: { url: string }
  venue: { name: string; city: string }
  price?: string | null
  eventLink?: string | null
  description?: string | null
}

interface StructuredEventData {
  '@context': string
  '@type': string
  name: string
  startDate: string
  endDate: string
  location: {
    '@type': string
    name: string
    address: {
      '@type': string
      addressLocality: string
      //   addressCountry: string
    }
  }
  image: string
  organizer: {
    '@type': string
    name: string
    url: string
  }
  offers?: {
    '@type': string
    price: string
    priceCurrency: string
    availability: string
    url?: string
  }
  url?: string
  description?: string
}

export function generateEventStructuredData(event: EventForStructuredData): StructuredEventData {
  // Format the date and time
  const eventDate = new Date(event.date)
  const startDateTime = event.startTime
    ? `${eventDate.toISOString().split('T')[0]}T${event.startTime}:00`
    : eventDate.toISOString()

  const endDateTime = event.endTime
    ? `${eventDate.toISOString().split('T')[0]}T${event.endTime}:00`
    : eventDate.toISOString()

  // Generate the structured data
  const structuredData: StructuredEventData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: startDateTime,
    endDate: endDateTime,
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.venue.city,
        // addressCountry: 'UK',
      },
    },
    image: event.posterImage.url,
    organizer: {
      '@type': 'Organization',
      name: 'Crilli DnB Belfast',
      url: 'https://crillidnb.com',
    },
  }

  if (event.price && event.price !== '0' && event.price.toLowerCase() !== 'free') {
    structuredData.offers = {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: event.eventLink || undefined,
    }
  } else if (event.price && (event.price === '0' || event.price.toLowerCase() === 'free')) {
    structuredData.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: event.eventLink || undefined,
    }
  }

  if (event.eventLink) {
    structuredData.url = event.eventLink
  }

  if (event.description) {
    structuredData.description = event.description
  }

  return structuredData
}

export function generateEventsStructuredData(events: EventForStructuredData[]) {
  return events.map((event) => generateEventStructuredData(event))
}
