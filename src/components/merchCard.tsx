'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { gsap } from 'gsap'

import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { buildMediaSrc } from '@/lib/utils'

type MerchCardProps = {
  item: {
    title: string
    image: { url: string }
    price?: string | null
    buyLink: string
  }
}

export default function MerchCard({ item }: MerchCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageUrl = buildMediaSrc(item.image.url)
  const priceLabel = item.price?.trim() ? `£${item.price.trim()}` : null

  const handleMouseEnter = () => {
    if (!cardRef.current || !imageRef.current) return
    gsap.to(imageRef.current, { scale: 1.02, duration: 0.3, ease: 'power2.out' })
  }

  const handleMouseLeave = () => {
    if (!imageRef.current) return
    gsap.to(imageRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' })
  }

  return (
    <div
      ref={cardRef}
      className="flex h-full w-full max-w-md flex-col overflow-visible shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={imageRef} className="relative aspect-square w-full overflow-hidden rounded-sm">
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          className="rounded-sm object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          loading="lazy"
        />
        <Link
          href={item.buyLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buy ${item.title}`}
          className="focus-visible:ring-crilli-300/80 focus-visible:ring-offset-crilli-900 absolute inset-0 z-10 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex flex-grow flex-row items-end justify-between gap-4 px-2 py-6">
        <h2 className="text-crilli-50 line-clamp-2 text-lg leading-5 font-bold">{item.title}</h2>
        <div className="flex shrink-0 flex-col items-end gap-3">
          {priceLabel ? <p className="text-crilli-50 text-sm">{priceLabel}</p> : null}
          <Button variant="outline" asChild>
            <Link href={item.buyLink} target="_blank" rel="noopener noreferrer">
              Buy
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="bg-crilli-400 mt-2 w-full" orientation="horizontal" />
    </div>
  )
}
