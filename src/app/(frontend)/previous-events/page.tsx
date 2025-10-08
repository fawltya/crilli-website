import Image from 'next/image'
import { getPayload } from 'payload'
import Link from 'next/link'

import config from '@/payload.config'
import '../styles.css'
import EventCard from '@/components/eventCard'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'
import type { Event, Media, Venue } from '@/payload-types'
import { buildMediaSrc } from '@/lib/utils'
import { generateEventsStructuredData } from '@/lib/structuredData'

export const metadata = {
  title: 'Previous Events - Crilli DnB Belfast',
  description: 'Browse our past events and shows.',
}

// Avoid prerendering DB queries at build time
export const dynamic = 'force-dynamic'

interface CombinedEvent {
  id: string
  title: string
  date: string
  posterImage: { url: string }
  venue: { name: string; city: string }
  price?: string | null
  eventLink?: string | null
  posterArtist?: {
    name: string
    link: string
    colour: string
  }
  source: 'cms' | 'tickettailor'
}

export default async function PreviousEventsPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch CMS events
  const { docs: cmsEvents } = await payload.find({
    collection: 'events',
    depth: 2,
    limit: 1000, // High limit to fetch all events
  })

  // Combine and transform events - leaving incase bring TicketTailor back in
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
  ]

  // Sort events by date (newest first for past events)
  const sortedEvents = combinedEvents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pastEvents = sortedEvents.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  })

  const pastEventsStructuredData = generateEventsStructuredData(pastEvents)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pastEventsStructuredData),
        }}
      />

      <main className="bg-crilli-900 text-crilli-50 uppercase py-20 lg:px-20 px-8 font-main">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="relative flex items-center justify-center flex-col mb-16">
            <Image
              src={buildMediaSrc('/api/media/file/Crilli%20Logo%20est%20belf.png')}
              alt="Crilli DnB Belfast Logo"
              width={300}
              height={225}
              priority
            />
            <div className="max-w-4xl text-center pt-10">
              <h1 className="text-3xl font-bold mb-4">Previous Events</h1>
              <p className="mb-4">
                We&apos;ve been lucky enough to promote and play at some great parties over the
                years...
              </p>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="mb-8">
            <Button asChild variant="outline">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>

          {/* Events Grid */}
          <div>
            <h2 className="text-crilli-50 mb-6 text-xl font-semibold md:text-left text-center">
              Past Events
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 gap-y-15 auto-rows-fr md:justify-items-start justify-items-center">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => (
                <EventCard key={`${event.source}-${event.id}`} event={event} isPastEvent={true} />
              ))
            ) : (
              <div className="col-span-full text-left py-8">
                <p className="text-crilli-200 text-lg">No past events found</p>
                <p className="text-crilli-400 text-sm mt-2">
                  Check out our{' '}
                  <Link href="/" className="text-crilli-200 hover:text-crilli-100 underline">
                    upcoming events
                  </Link>{' '}
                  instead.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Footer
            navigationLinks={[
              { href: '/#events', label: 'Events' },
              { href: '/#podcasts', label: 'Podcasts' },
            ]}
          />
        </div>
      </main>
    </>
  )
}
