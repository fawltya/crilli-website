import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'
import EventCard from '@/components/eventCard'
import type { Event, Media, Venue } from '@/payload-types'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Fetch events
  const { docs: events } = await payload.find({
    collection: 'events',
    depth: 2, // This ensures we get the related venue and posterImage data
  })

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
              Established in 2005 Crilli is a Drum & Bass + Jungle promotion based in Belfast.
            </p>
            <p>
              We have been a part of Ireland&apos;s underground music culture for nearly two
              decades, giving artists like Goldie, Calibre, DJ Hazard, Sully, London Elektricity and
              DJ MArky the pleasure of experiencing beautiful Belfast audiences.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
          {events.map((event: Event) => {
            const posterImage = event.posterImage as Media
            const venue = event.venue as Venue

            return (
              <EventCard
                key={event.id}
                event={{
                  title: event.title,
                  date: event.date,
                  posterImage: { url: posterImage.url || '' },
                  venue: {
                    name: venue.name,
                    city: venue.city,
                  },
                  price: event.price,
                  eventLink: event.eventLink,
                }}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}
