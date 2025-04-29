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
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="overflow-hidden shadow-lg max-w-md w-full">
      <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden">
        <Link href={event.eventLink || ''}>
          <Image
            src={event.posterImage.url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </Link>
      </div>
      <div className="py-4 px-2 flex flex-row gap-4 justify-between">
        <div className="min-w-50">
          <h2 className="text-lg font-bold text-crilli-50 pb-3">{event.title}</h2>
          <p className="text-sm text-crilli-200">{event.venue.name}</p>
          <p className="text-sm text-crilli-200">{event.venue.city}</p>
        </div>
        <div>
          <Separator className="bg-crilli-400 w-full" orientation="vertical" />
        </div>
        <div className="flex flex-col text-end justify-between ">
          <p className="text-crilli-50 text-sm mt-1">{dateStr}</p>

          <Button variant="outline" asChild>
            <Link href={event.eventLink || ''} target="_blank" rel="noopener noreferrer">
              {isFree ? 'FREE' : 'TICKETS'}
            </Link>
          </Button>
        </div>
      </div>
      <Separator className="bg-crilli-400 w-full mt-4" orientation="horizontal" />
    </div>
  )
}
