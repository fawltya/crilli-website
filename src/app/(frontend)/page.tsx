import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'
import EventCard from '@/components/eventCard'
import type { Event, Media, Venue } from '@/payload-types'
import { getTicketTailorEvents } from '@/lib/tickettailor'

interface CombinedEvent {
  id: string
  title: string
  date: string
  posterImage: { url: string }
  venue: { name: string; city: string }
  price?: string | null
  eventLink?: string | null
  source: 'cms' | 'tickettailor'
}

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch CMS events
  const { docs: cmsEvents } = await payload.find({
    collection: 'events',
    depth: 2, // This ensures we get the related venue and posterImage data
  })

  // Fetch Ticket Tailor events
  const ticketTailorEvents = await getTicketTailorEvents()

  // Combine and transform events
  const combinedEvents: CombinedEvent[] = [
    ...cmsEvents.map((event: Event) => {
      const posterImage = event.posterImage as Media
      const venue = event.venue as Venue

      return {
        id: event.id,
        title: event.title,
        date: event.date,
        posterImage: { url: posterImage.url || '' },
        venue: {
          name: venue.name,
          city: venue.city,
        },
        price: event.price,
        eventLink: event.eventLink,
        source: 'cms' as const,
      }
    }),
    ...ticketTailorEvents.map((event) => {
      // Extract city from address or use a default
      let city = 'Belfast' // Default city
      if (event.venue?.address) {
        const addressParts = event.venue.address.split(',')
        const lastPart = addressParts[addressParts.length - 1]?.trim()
        if (lastPart) {
          city = lastPart
        }
      }

      // Get the first available image URL
      const imageUrl = event.image_url || event.images?.header || ''

      // Get the first ticket type price or default to '0'
      const price = event.ticket_types?.[0]?.price?.toString() || '0'

      return {
        id: event.id,
        title: event.name,
        date: event.start?.iso || new Date().toISOString(),
        posterImage: { url: imageUrl },
        venue: {
          name: event.venue?.name || 'Unknown Venue',
          city: city,
        },
        price: price,
        eventLink: event.checkout_url,
        source: 'tickettailor' as const,
      }
    }),
  ]

  // Sort events by date
  const sortedEvents = combinedEvents.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return (
    <main className="bg-crilli-900 text-crilli-50 uppercase p-20 font-main">
      <div className="container mx-auto max-w-7xl">
        <div className="relative flex items-center justify-center flex-col ">
          <Image
            src="https://jfkf0uemou6lrnps.public.blob.vercel-storage.com/Crilli%20Logo%20est%20belf.png"
            alt="Your alt text"
            width={400}
            height={300}
          />
          <div className="max-w-4xl text-center pt-10">
            <p className="mb-4">
              Established in 2005 <strong>Crilli</strong> is a Drum & Bass + Jungle promotion based
              in Belfast.
            </p>
            <p>
              We have been a part of Ireland&apos;s underground music culture for nearly two
              decades, giving artists like Goldie, Calibre, DJ Hazard, Sully, London Elektricity and
              DJ MArky the pleasure of experiencing beautiful Belfast audiences.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-crilli-50  mt-20 mb-8 text-xl font-semibold">Upcoming Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 gap-y-15 auto-rows-fr">
          {sortedEvents.map((event) => (
            <EventCard key={`${event.source}-${event.id}`} event={event} />
          ))}
        </div>
      </div>
    </main>
  )
}
