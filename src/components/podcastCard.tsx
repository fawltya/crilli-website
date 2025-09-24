'use client'
import Image from 'next/image'
import { buildMediaSrc } from '@/lib/utils'
import { usePlayer } from '@/components/SitePlayer'

// removed unused imports

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
    <div className="relative overflow-hidden shadow-lg max-w-md w-full h-full flex flex-col pt-7 pb-6 px-7  justify-between">
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
      <div className="relative aspect-[1/1] overflow-visible w-full group">
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
          className="block w-full h-full relative"
        >
          <Image
            src={buildMediaSrc(podcast.posterImage.url)}
            alt={podcast.artist}
            fill
            className="object-cover aspect-square"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />

          {/* Always visible pause icon when playing */}
          {showPlayControls && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md backdrop-opacity-30 z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-16 h-16 text-white drop-shadow-lg"
              >
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            </div>
          )}

          {/* Hover play icon overlay (only show when not playing) */}
          {!showPlayControls && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md backdrop-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-16 h-16 text-white drop-shadow-lg"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* --- Text Row --- */}
      <div className="pt-3 px-1 flex flex-row w-full gap-3 justify-between">
        <p className="text-sm text-crilli-200">{podcast.artist}</p>
        <p className="text-sm text-crilli-200">{podcast.date}</p>
      </div>
    </div>
  )
}
