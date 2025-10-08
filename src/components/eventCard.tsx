'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { buildMediaSrc } from '@/lib/utils'
import { useImageColor } from '@/hooks/useImageColor'
import { generateGlowShadow } from '@/lib/colorExtraction'

type EventCardProps = {
  event: {
    title: string
    date: string
    posterImage: { url: string }
    venue: { name: string; city: string }
    price?: string | null
    eventLink?: string | null
    posterArtist: {
      name: string
      link: string
      colour: string
    }
  }
  isPastEvent?: boolean
}

type designerTagProps = {}

export default function EventCard({ event, isPastEvent = false }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const imageUrl = buildMediaSrc(event.posterImage.url)
  const { color } = useImageColor(imageUrl)

  const isFree = !event.price || event.price.trim() === '0' || event.price.toLowerCase() === 'free'
  const dateObj = new Date(event.date)
  const dateStr = dateObj.toLocaleDateString('en-GB', {
    // weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  // Generate hover styles based on extracted color (only for image)
  const imageHoverStyles =
    color && isHovered
      ? {
          boxShadow: generateGlowShadow(color, 0.8),
          transform: 'scale(1.01)',
        }
      : {}

  return (
    <>
      <div>
        <div className="rounded-xl blur-lg bg-[{event.posterArtist.colour}] p-4"></div>
        <p>
          Designed by{' '}
          <Link href={event.posterArtist.link} target="_blank" rel="noopener noreferrer">
            {event.posterArtist.name}
          </Link>
        </p>
      </div>

      <div
        className="overflow-visible shadow-lg max-w-md w-full h-full flex flex-col transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full aspect-[4/5] rounded-sm overflow-visible p-2">
          {isPastEvent ? (
            <Image
              src={imageUrl}
              alt={`${event.title} event poster`}
              fill
              className="object-cover rounded-sm transition-all duration-300 ease-in-out"
              sizes="(max-width: 768px) 100vw, 400px"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              style={imageHoverStyles}
            />
          ) : (
            <Link
              href={event.eventLink || ''}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View details for ${event.title} event`}
            >
              <Image
                src={imageUrl}
                alt={`${event.title} event poster`}
                fill
                className="object-cover rounded-sm transition-all duration-300 ease-in-out"
                sizes="(max-width: 768px) 100vw, 400px"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                style={imageHoverStyles}
              />
            </Link>
          )}
        </div>

        {isPastEvent ? (
          // Past event layout
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
          // Upcoming event layout
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
    </>
  )
}
