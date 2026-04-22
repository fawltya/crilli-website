import Image from 'next/image'
import { getPayload } from 'payload'
import Link from 'next/link'
import config from '@/payload.config'
import './styles.css'
import EventCard from '@/components/eventCard'
import PodcastCard from '@/components/podcastCard'
import ScrollButton from '@/components/ScrollButton'
import AnimatedSection from '@/components/AnimatedSection'
import type { Event, Media, Venue, Podcast, PosterArtist } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { buildMediaSrc } from '@/lib/utils'
import { generateEventsStructuredData } from '@/lib/structuredData'

export const metadata = {
  title: 'Crilli DnB Belfast',
  description: 'Established in 2005 Crilli is a Drum & Bass + Jungle promotion based in Belfast.',
}

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

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: cmsEvents } = await payload.find({
    collection: 'events',
    depth: 2,
    limit: 1000,
  })

  const combinedEvents: CombinedEvent[] = [
    ...cmsEvents.map((event: Event) => {
      const posterImage = event.posterImage as Media
      const venue = event.venue as Venue
      const posterArtist = event.posterArtist as PosterArtist | null | undefined

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
        posterArtist: posterArtist
          ? {
              name: posterArtist.name,
              link: posterArtist.link,
              colour: posterArtist.colour,
            }
          : undefined,
        source: 'cms' as const,
      }
    }),
  ]

  const sortedEvents = combinedEvents.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingEvents = sortedEvents.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })

  const { docs: cmsPodcasts } = await payload.find({
    collection: 'podcasts',
    depth: 1,
    sort: '-createdAt',
  })

  const podcastsForUi = cmsPodcasts.map((podcast: Podcast) => {
    const posterImage = podcast.posterImage as Media
    const audioMedia = podcast.audioFile as Media | null
    return {
      artist: podcast.artist,
      date: podcast.number,
      posterImage: { url: posterImage.url || '' },
      podcastLink: podcast.eventLink ?? null,
      audioUrl: audioMedia?.url || null,
    }
  })

  const sortedPodcasts = podcastsForUi.sort((a, b) => {
    const numA = parseInt(a.date.replace('/', ''))
    const numB = parseInt(b.date.replace('/', ''))
    return numB - numA
  })

  const upcomingEventsStructuredData = generateEventsStructuredData(upcomingEvents)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(upcomingEventsStructuredData),
        }}
      />

      <main className="bg-crilli-900 text-crilli-50 font-crilli px-8 py-20 uppercase lg:px-20">
        <div className="container mx-auto max-w-7xl">
          <AnimatedSection className="relative flex flex-col items-center justify-center">
            <div>
              <Image
                src={buildMediaSrc('/api/media/file/Crilli%20Logo%20est%20belf.png')}
                alt="Crilli DnB Belfast Logo"
                width={400}
                height={300}
                sizes="(max-width: 1024px) 100vw, 400px"
                className="h-auto w-full max-w-full object-contain"
                priority
              />
            </div>
            <div className="max-w-4xl pt-10 text-center">
              <p className="mb-4">
                Established in 2005, <strong>Crilli</strong> is a Drum & Bass + Jungle promotion
                based in Belfast.
              </p>
              <p>
                We have been a part of Ireland&apos;s underground music culture for two decades,
                giving artists like Goldie, Calibre, DJ Hazard, Sully, London Elektricity and DJ
                MArky the pleasure of experiencing beautiful Belfast audiences.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection className="mt-20" animationType="fadeInUp" delay={0.3} trigger="#events">
            <div id="events">
              <h2 className="text-crilli-50 mb-6 text-center text-xl font-semibold md:text-left">
                Upcoming Events
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection
            className="grid auto-rows-fr grid-cols-1 justify-items-center gap-10 gap-y-15 md:grid-cols-3 md:justify-items-start"
            animationType="fadeInUp"
            stagger={0.1}
            delay={0.5}
            trigger="#events"
          >
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard key={`${event.source}-${event.id}`} event={event} />
              ))
            ) : (
              <div className="col-span-full py-8 text-left">
                <p className="text-crilli-200 text-lg">Nothing scheduled right now...</p>
                <p className="text-crilli-400 mt-2 text-sm">Check back soon for more events.</p>
              </div>
            )}
          </AnimatedSection>
          <AnimatedSection className="mt-8" animationType="fadeInUp" delay={0.7} trigger="#events">
            <Button asChild variant="outline">
              <Link href="/previous-events">See Previous Events</Link>
            </Button>
          </AnimatedSection>

          <AnimatedSection
            className="mt-16 w-full"
            animationType="scaleIn"
            delay={0.9}
            trigger="#events"
          >
            <Image
              src={buildMediaSrc('/api/media/file/Crilli%20DnB%20-%20Kev.jpg')}
              alt="Crilli DnB promotional image"
              className="h-auto w-full max-w-full overflow-hidden rounded-sm"
              width={1200}
              height={400}
              // style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </AnimatedSection>
          <AnimatedSection
            className="mt-20"
            animationType="fadeInUp"
            delay={0.2}
            trigger="#podcasts"
          >
            <div id="podcasts">
              <h2 className="text-crilli-50 mb-4 text-center text-xl font-semibold md:text-left">
                Latest Podcasts
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection
            className="relative flex flex-col gap-1"
            animationType="fadeInLeft"
            delay={0.4}
            trigger="#podcasts"
          >
            <div className="scrollbar-hide overflow-x-auto" id="podcast-scroll">
              <div className="flex min-w-max gap-6 pb-4">
                {sortedPodcasts.map((podcast) => (
                  <div key={`${podcast.artist}-${podcast.date}`} className="w-64 flex-shrink-0">
                    <PodcastCard podcast={podcast} />
                  </div>
                ))}
              </div>
            </div>
            <ScrollButton containerId="podcast-scroll" />
          </AnimatedSection>
        </div>
      </main>
    </>
  )
}
