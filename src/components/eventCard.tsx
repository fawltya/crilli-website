import Image from 'next/image'
import Link from 'next/link'

import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { buildMediaSrc } from '@/lib/utils'

type EventCardProps = {
  event: {
    title: string
    date: string
    posterImage: { url: string }
    venue: { name: string; city: string }
    price?: string | null
    eventLink?: string | null
  }
  isPastEvent?: boolean
}

export default function EventCard({ event, isPastEvent = false }: EventCardProps) {
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
        {isPastEvent ? (
          <Image
            src={buildMediaSrc(event.posterImage.url)}
            alt={`${event.title} event poster`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <Link href={event.eventLink || ''} target="_blank" rel="noopener noreferrer">
            <Image
              src={buildMediaSrc(event.posterImage.url)}
              alt={`${event.title} event poster`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </Link>
        )}
      </div>

      {isPastEvent ? (
        // Past event layout - full width, no divider, date below title
        <div className="py-6 px-2 flex flex-col gap-2">
          <h2 className="text-lg leading-5 font-bold text-crilli-50 pb-1 line-clamp-2">
            {event.title}
          </h2>
          <div>
            <p className="text-crilli-50 text-sm">{dateStr}</p>

            <p className="text-sm text-crilli-200">{event.venue.name}</p>
            <p className="text-sm text-crilli-200">{event.venue.city}</p>
          </div>
        </div>
      ) : (
        // Upcoming event layout - original design
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
      )}

      <Separator className="bg-crilli-400 w-full mt-2" orientation="horizontal" />
    </div>
  )
}
