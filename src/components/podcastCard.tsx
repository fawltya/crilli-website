'use client'
import Image from 'next/image'
import { buildMediaSrc } from '@/lib/utils'
import { usePlayer } from '@/components/SitePlayer'
import { Play, Pause } from '@phosphor-icons/react'

type PodcastCardProps = {
  podcast: {
    artist: string
    date: string
    posterImage: { url: string }
    podcastLink?: string | null
    audioUrl?: string | null
  }
}

export default function PodcastCard({ podcast }: { podcast: PodcastCardProps['podcast'] }) {
  const { setTrack, isCurrentTrack, isPlaying, togglePlay } = usePlayer()
  const isCurrentlyPlaying = podcast.audioUrl ? isCurrentTrack(podcast.audioUrl) : false
  const showPlayControls = isCurrentlyPlaying && isPlaying

  // const isFree = !podcast.price || podcast.price.trim() === '0' || podcast.price.toLowerCase() === 'free'
  // const dateObj = new Date(podcast.date)
  // const dateStr = dateObj.toLocaleDateString('en-GB', {
  // weekday: 'short',
  //   day: '2-digit',
  //   month: 'short',
  //   year: 'numeric',
  // })

  return (
    <div className="relative flex h-full w-full max-w-md flex-col justify-between overflow-hidden px-7 pt-7 pb-6 shadow-lg">
      {/* --- Corner Border Overlay --- */}
      <div className="pointer-events-none absolute inset-0">
        {/* top-left */}
        <span className="bg-crilli-600 absolute top-2 left-2 h-px w-12" />
        <span className="bg-crilli-600 absolute top-2 left-2 h-12 w-px" />
        {/* top-right */}
        <span className="bg-crilli-600 absolute top-2 right-2 h-px w-12" />
        <span className="bg-crilli-600 absolute top-2 right-2 h-12 w-px" />
        {/* bottom-left */}
        <span className="bg-crilli-600 absolute bottom-2 left-2 h-px w-12" />
        <span className="bg-crilli-600 absolute bottom-2 left-2 h-12 w-px" />
        {/* bottom-right */}
        <span className="bg-crilli-600 absolute right-2 bottom-2 h-px w-12" />
        <span className="bg-crilli-600 absolute right-2 bottom-2 h-12 w-px" />
      </div>

      {/* --- Image --- */}
      <div className="group relative aspect-[1/1] w-full overflow-visible">
        <button
          type="button"
          onClick={() => {
            if (!podcast.audioUrl) return
            if (isCurrentlyPlaying) {
              togglePlay()
            } else {
              setTrack({
                title: `${podcast.artist} — ${podcast.date}`,
                artist: podcast.artist,
                date: podcast.date,
                artworkUrl: podcast.posterImage.url,
                audioUrl: podcast.audioUrl,
                externalLink: podcast.podcastLink || undefined,
              })
            }
          }}
          className="relative block h-full w-full"
        >
          <Image
            src={buildMediaSrc(podcast.posterImage.url)}
            alt={`${podcast.artist} podcast artwork`}
            fill
            className="aspect-square object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />

          {showPlayControls && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-md backdrop-opacity-30">
              <Pause className="h-16 w-16 text-white drop-shadow-lg" weight="fill" />
            </div>
          )}

          {!showPlayControls && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-md backdrop-opacity-40 transition-opacity duration-200 group-hover:opacity-100">
              <Play className="h-16 w-16 text-white drop-shadow-lg" weight="fill" />
            </div>
          )}
        </button>
      </div>

      {/* --- Text Row --- */}
      <div className="flex w-full flex-row justify-between gap-3 px-1 pt-3">
        <p className="text-crilli-200 text-sm">{podcast.artist}</p>
        <p className="text-crilli-200 text-sm">{podcast.date}</p>
      </div>
    </div>
  )
}
