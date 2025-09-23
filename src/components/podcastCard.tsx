import Image from 'next/image'
import Link from 'next/link'

import { Separator } from './ui/separator'
import { Button } from './ui/button'

type PodcastCardProps = {
  podcast: {
    artist: string
    date: string
    posterImage: { url: string }
    podcastLink?: string | null
  }
}

export default function PodcastCard({ podcast }: { podcast: PodcastCardProps['podcast'] }) {
  // const isFree = !podcast.price || podcast.price.trim() === '0' || podcast.price.toLowerCase() === 'free'
  // const dateObj = new Date(podcast.date)
  // const dateStr = dateObj.toLocaleDateString('en-GB', {
  // weekday: 'short',
  //   day: '2-digit',
  //   month: 'short',
  //   year: 'numeric',
  // })

  return (
    <div className="relative overflow-hidden shadow-lg max-w-md w-full h-full flex flex-col pt-7 pb-6 px-7 aspect-[1/1] justify-between">
      {/* --- Corner Border Overlay --- */}
      <div className="pointer-events-none absolute inset-0">
        {/* top-left */}
        <span className="absolute left-2 top-2 h-px w-12 bg-crilli-600" />
        <span className="absolute left-2 top-2 h-12 w-px bg-crilli-600" />
        {/* top-right */}
        <span className="absolute right-2 top-2 h-px w-12 bg-crilli-600" />
        <span className="absolute right-2 top-2 h-12 w-px bg-crilli-600" />
        {/* bottom-left */}
        <span className="absolute bottom-2 left-2 h-px w-12 bg-crilli-600" />
        <span className="absolute bottom-2 left-2 h-12 w-px bg-crilli-600" />
        {/* bottom-right */}
        <span className="absolute bottom-2 right-2 h-px w-12 bg-crilli-600" />
        <span className="absolute bottom-2 right-2 h-12 w-px bg-crilli-600" />
      </div>

      {/* --- Image --- */}
      <div className="relative aspect-[1/1] overflow-hidden w-full h-48">
        <Link href={podcast.podcastLink || ''} target="_blank" rel="noopener noreferrer">
          <Image
            src={
              podcast.posterImage.url.startsWith('http')
                ? podcast.posterImage.url
                : podcast.posterImage.url.startsWith('/api')
                  ? `https://crilli-website.vercel.app${podcast.posterImage.url}`
                  : `https://crilli-website.vercel.app/api/media/file/${podcast.posterImage.url}`
            }
            alt={podcast.artist}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />
        </Link>
      </div>

      {/* --- Text Row --- */}
      <div className="pt-3 px-1 flex flex-row w-full gap-3 justify-between">
        <p className="text-sm text-crilli-200">{podcast.artist}</p>
        <p className="text-sm text-crilli-200">{podcast.date}</p>
      </div>
    </div>
  )
}
