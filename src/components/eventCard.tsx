'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { gsap } from 'gsap'

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
    posterArtist?: {
      name: string
      link: string
      colour: string
    }
  }
  isPastEvent?: boolean
}

export default function EventCard({ event, isPastEvent = false }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
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

  // Hover animations
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (cardRef.current && imageRef.current && contentRef.current) {
      const tl = gsap.timeline()

      // Card lift effect
      tl.to(cardRef.current, {
        y: -1,
        duration: 0.3,
        ease: 'power2.out',
      })

      // Image scale and glow
      tl.to(
        imageRef.current,
        {
          scale: 1.01,
          duration: 0.3,
          ease: 'power2.out',
        },
        0,
      )

      // Content slide up
      tl.to(
        contentRef.current,
        {
          y: -1,
          duration: 0.3,
          ease: 'power2.out',
        },
        0,
      )

      // Add glow effect if color is available
      if (color) {
        tl.to(
          imageRef.current,
          {
            boxShadow: generateGlowShadow(color, 0.6),
            duration: 0.3,
            ease: 'power2.out',
          },
          0,
        )
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (cardRef.current && imageRef.current && contentRef.current) {
      const tl = gsap.timeline()

      // Reset all animations
      tl.to([cardRef.current, imageRef.current, contentRef.current], {
        y: 0,
        scale: 1,
        boxShadow: 'none',
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        className="flex h-full w-full max-w-md flex-col overflow-visible shadow-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={imageRef}
          className="relative aspect-[4/5] w-full overflow-visible rounded-sm p-2"
        >
          {event.posterArtist && isHovered && (
            <div className="border-crilli-400/50 bg-crilli-700/70 absolute top-1 right-1 z-50 flex flex-row items-center gap-2 rounded border-1 px-2 py-1 backdrop-blur-md backdrop-opacity-30 transition-all duration-300 ease-in-out">
              <div
                className="blur-2xs h-3 w-3 rounded-xl blur-[2px]"
                style={{ backgroundColor: event.posterArtist.colour }}
              ></div>
              <p className="text-crilli-50 text-[9px]">
                Design by{' '}
                <Link
                  href={event.posterArtist.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crilli-200 hover:text-crilli-100 font-bold"
                >
                  {event.posterArtist.name}
                </Link>
              </p>
            </div>
          )}
          {isPastEvent ? (
            <Image
              src={imageUrl}
              alt={`${event.title} event poster`}
              fill
              className="rounded-sm object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <>
              <Image
                src={imageUrl}
                alt={`${event.title} event poster`}
                fill
                className="rounded-sm object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              <Link
                href={event.eventLink || ''}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View details for ${event.title} event`}
                className="absolute inset-0 z-10 rounded-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-crilli-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-crilli-900"
              />
            </>
          )}
        </div>

        {isPastEvent ? (
          // Past event layout
          <div ref={contentRef} className="flex flex-col gap-2 px-2 py-6">
            <h2 className="text-crilli-50 line-clamp-2 pb-1 text-lg leading-5 font-bold">
              {event.title}
            </h2>
            <div>
              <p className="text-crilli-50 text-sm">{dateStr}</p>

              <p className="text-crilli-200 text-sm">{event.venue.name}</p>
              <p className="text-crilli-200 text-sm">{event.venue.city}</p>
            </div>
          </div>
        ) : (
          // Upcoming event layout
          <div ref={contentRef} className="flex flex-grow flex-row justify-between gap-4 px-2 py-6">
            <div className="flex w-full flex-col justify-between">
              <h2 className="text-crilli-50 line-clamp-2 pb-1 text-lg leading-5 font-bold">
                {event.title}
              </h2>
              <div>
                <p className="text-crilli-200 text-sm">{event.venue.name}</p>
                <p className="text-crilli-200 text-sm">{event.venue.city}</p>
              </div>
            </div>
            <div>
              <Separator className="bg-crilli-400 w-full" orientation="vertical" />
            </div>
            <div className="flex min-w-27 flex-col items-end justify-between text-end">
              <p className="text-crilli-50 text-sm">{dateStr}</p>

              <Button variant="outline" asChild>
                <Link href={event.eventLink || ''} target="_blank" rel="noopener noreferrer">
                  {isFree ? 'FREE' : 'TICKETS'}
                </Link>
              </Button>
            </div>
          </div>
        )}

        <Separator className="bg-crilli-400 mt-2 w-full" orientation="horizontal" />
      </div>
    </>
  )
}
