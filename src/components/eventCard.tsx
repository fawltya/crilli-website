import Image from 'next/image'
import Link from 'next/link'

import { Separator } from './ui/separator'
import { Button } from './ui/button'

type EventCardProps = {
  event: {
    title: string
    date: string
    posterImage: { url: string }
    venue: { name: string; city: string }
    price?: string | null
    eventLink?: string | null
  }
}

export default function EventCard({ event }: { event: EventCardProps['event'] }) {
  const isFree = !event.price || event.price.trim() === '0' || event.price.toLowerCase() === 'free'
  const dateObj = new Date(event.date)
  const dateStr = dateObj.toLocaleDateString('en-GB', {
    // weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="overflow-hidden shadow-lg max-w-md w-full h-full flex flex-col">
      <div className="relative w-full aspect-[4/5] rounded-sm overflow-hidden">
        <Link href={event.eventLink || ''} target="_blank" rel="noopener noreferrer">
          <Image
            src={
              // If it's already a full URL with http(s)
              event.posterImage.url.startsWith('http')
                ? event.posterImage.url
                : // If it starts with /api (relative path)
                  event.posterImage.url.startsWith('/api')
                  ? `https://crilli-website.vercel.app${event.posterImage.url}`
                  : // Otherwise add /api/media/file/ prefix
                    `https://crilli-website.vercel.app/api/media/file/${event.posterImage.url}`
            }
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />
        </Link>
      </div>
      <div className="py-6 px-2 flex flex-row gap-4 justify-between flex-grow">
        <div className="w-full flex flex-col justify-between">
          <h2 className="text-lg leading-5 font-bold text-crilli-50 pb-1 line-clamp-2">
            {event.title}
          </h2>
          <div>
            <p className="text-sm text-crilli-200">{event.venue.name}</p>
            <p className="text-sm text-crilli-200">{event.venue.city}</p>
          </div>
        </div>
        <div>
          <Separator className="bg-crilli-400 w-full" orientation="vertical" />
        </div>
        <div className="flex flex-col text-end items-end justify-between min-w-27">
          <p className="text-crilli-50 text-sm">{dateStr}</p>

          <Button variant="outline" asChild>
            <Link href={event.eventLink || ''} target="_blank" rel="noopener noreferrer">
              {isFree ? 'FREE' : 'TICKETS'}
            </Link>
          </Button>
        </div>
      </div>
      <Separator className="bg-crilli-400 w-full mt-2" orientation="horizontal" />
    </div>
  )
}
