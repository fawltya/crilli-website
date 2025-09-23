// import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
// import React from 'react'

import config from '@/payload.config'
import './styles.css'
import EventCard from '@/components/eventCard'
import PodcastCard from '@/components/podcastCard'
import type { Event, Media, Venue, Podcast } from '@/payload-types'
// import { getTicketTailorEvents } from '@/lib/tickettailor'

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
  // const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch CMS events
  const { docs: cmsEvents } = await payload.find({
    collection: 'events',
    depth: 2, // This ensures we get the related venue and posterImage data
  })

  // Fetch Ticket Tailor events
  // const ticketTailorEvents = await getTicketTailorEvents()

  // Combine and transform events
  const combinedEvents: CombinedEvent[] = [
    ...cmsEvents.map((event: Event) => {
      const posterImage = event.posterImage as Media
      const venue = event.venue as Venue

      return {
        id: String(event.id),
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
    // ...ticketTailorEvents.map((event) => {
    //   // Extract city from address or use a default
    //   let city = 'Belfast' // Default city
    //   if (event.venue?.address) {
    //     const addressParts = event.venue.address.split(',')
    //     const lastPart = addressParts[addressParts.length - 1]?.trim()
    //     if (lastPart) {
    //       city = lastPart
    //     }
    //   }

    //   // Get the first available image URL
    //   const imageUrl = event.image_url || event.images?.header || ''

    //   // Get the first ticket type price or default to '0'
    //   const price = event.ticket_types?.[0]?.price?.toString() || '0'

    //   return {
    //     id: event.id,
    //     title: event.name,
    //     date: event.start?.iso || new Date().toISOString(),
    //     posterImage: { url: imageUrl },
    //     venue: {
    //       name: event.venue?.name || 'Unknown Venue',
    //       city: city,
    //     },
    //     price: price,
    //     eventLink: event.checkout_url,
    //     source: 'tickettailor' as const,
    //   }
    // }),
  ]

  // Sort events by date
  const sortedEvents = combinedEvents.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Fetch Podcasts
  const { docs: cmsPodcasts } = await payload.find({
    collection: 'podcasts',
    depth: 1,
    sort: '-createdAt',
  })

  const podcastsForUi = cmsPodcasts.map((podcast: Podcast) => {
    const posterImage = podcast.posterImage as Media
    return {
      artist: podcast.artist,
      date: podcast.number, // using `number` as display string (e.g., "2025/01")
      posterImage: { url: posterImage.url || '' },
      podcastLink: podcast.eventLink ?? null,
    }
  })

  // Sort podcasts by number field (which contains episode numbers like "2025/01")
  const sortedPodcasts = podcastsForUi.sort((a, b) => {
    // Convert "2025/01" format to numeric values for proper sorting
    const numA = parseInt(a.date.replace('/', '')) // "2025/01" -> 202501
    const numB = parseInt(b.date.replace('/', '')) // "2023/02" -> 202302
    return numB - numA // Sort descending (newest first)
  })

  return (
    <main className="bg-crilli-900 text-crilli-50 uppercase  py-20 lg:px-20 px-8 font-main">
      <div className="container mx-auto max-w-7xl">
        <div className="relative flex items-center justify-center flex-col ">
          <Image
            src="https://jfkf0uemou6lrnps.public.blob.vercel-storage.com/Crilli%20Logo%20est%20belf.png"
            alt="Your alt text"
            width={400}
            height={300}
            unoptimized
          />
          <div className="max-w-4xl text-center pt-10">
            <p className="mb-4">
              Established in 2005 <strong>Crilli</strong> is a Drum & Bass + Jungle promotion based
              in Belfast.
            </p>
            <p>
              We have been a part of Ireland&apos;s underground music culture for two decades,
              giving artists like Goldie, Calibre, DJ Hazard, Sully, London Elektricity and DJ MArky
              the pleasure of experiencing beautiful Belfast audiences.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-crilli-50  mt-20 mb-8 text-xl text-center font-semibold">
            Upcoming Events
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 gap-y-15 auto-rows-fr justify-items-center">
          {sortedEvents.map((event) => (
            <EventCard key={`${event.source}-${event.id}`} event={event} />
          ))}
        </div>
        <div className="mt-16 w-full ">
          <Image
            src="/api/media/file/Crilli%20DnB%20-%20Kev.jpg"
            alt="Your alt text"
            unoptimized
            className="rounded-sm overflow-hidden"
            width={1200}
            height={400}
          />
        </div>
        <div>
          <h2 className="text-crilli-50  mt-20 mb-8 text-xl text-center font-semibold">
            Latest Podcasts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4 min-w-max">
            {sortedPodcasts.map((podcast) => (
              <div key={`${podcast.artist}-${podcast.date}`} className="flex-shrink-0 w-64">
                <PodcastCard podcast={podcast} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
