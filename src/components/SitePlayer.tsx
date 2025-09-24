'use client'
import React from 'react'
import { buildMediaSrc, type PodcastPlayable } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type PlayerContextType = {
  current?: PodcastPlayable | null
  isPlaying: boolean
  setTrack: (track: PodcastPlayable) => void
  togglePlay: () => void
  pause: () => void
  isCurrentTrack: (audioUrl: string) => boolean
}

export const PlayerContext = React.createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = React.useState<PodcastPlayable | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [_, setIsSeeking] = React.useState(false)
  const isSeekingRef = React.useRef(false)

  const setTrack = React.useCallback((track: PodcastPlayable) => {
    // Set current track but do NOT start playing or set src yet to avoid network requests
    setCurrent(track)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
  }, [])

  const togglePlay = React.useCallback(() => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      // Just-in-time set src to avoid any request until user clicks play
      if (current && !audioRef.current.src) {
        audioRef.current.src = buildMediaSrc(current.audioUrl)
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [current])

  const pause = React.useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  const isCurrentTrack = React.useCallback(
    (audioUrl: string) => {
      return current?.audioUrl === audioUrl
    },
    [current],
  )

  // Bind audio element events for time/duration and play/pause sync
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => {
      if (!isSeekingRef.current) setCurrentTime(audio.currentTime || 0)
    }
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || sec < 0) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const value = React.useMemo(
    () => ({ current, isPlaying, setTrack, togglePlay, pause, isCurrentTrack }),
    [current, isPlaying, setTrack, togglePlay, pause, isCurrentTrack],
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Fixed bottom player UI */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <audio ref={audioRef} className="hidden" preload="none" />
        {current ? (
          <div className="bg-crilli-800/60 supports-[backdrop-filter]:bg-crilli-800/50 backdrop-blur-md border-t border-crilli-600/30 text-crilli-50 px-4 py-3 font-main uppercase shadow-lg w-full">
            <div className="flex flex-row gap-6 md:items-center items-end">
              <div className="max-w-7xl mx-auto flex  items-center gap-4">
                {current.artworkUrl ? (
                  <div className="relative w-16 h-16 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildMediaSrc(current.artworkUrl)}
                      alt={current.title}
                      className="w-16 h-16 object-cover"
                    />
                    {/* Play/Pause overlay button */}
                    <button
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className={`absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md backdrop-opacity-30 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200 rounded-sm`}
                    >
                      {isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-8 h-8 text-white drop-shadow-lg"
                        >
                          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-8 h-8 text-white drop-shadow-lg"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2 flex-1 flex-col md:flex-row w-full">
                <div className=" max-content">
                  <p className="text-lg leading-tight">Crilli Podcast - {current.artist}</p>
                  <p className="text-sm text-crilli-200 truncate">{current.date}</p>
                </div>
                <div className="flex gap-1 flex-1 select-none justify-center align-middle items-center md:ml-0 -ml-3">
                  <span className="text-xs text-crilli-200 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={Math.min(currentTime, duration || 0)}
                    onMouseDown={() => {
                      setIsSeeking(true)
                      isSeekingRef.current = true
                    }}
                    onTouchStart={() => {
                      setIsSeeking(true)
                      isSeekingRef.current = true
                    }}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      setCurrentTime(next)
                    }}
                    onMouseUp={(e) => {
                      const target = e.target as HTMLInputElement
                      const next = Number(target.value)
                      setIsSeeking(false)
                      isSeekingRef.current = false
                      if (audioRef.current) {
                        audioRef.current.currentTime = next
                      }
                    }}
                    onTouchEnd={(e) => {
                      const target = e.target as HTMLInputElement
                      const next = Number(target.value)
                      setIsSeeking(false)
                      isSeekingRef.current = false
                      if (audioRef.current) {
                        audioRef.current.currentTime = next
                      }
                    }}
                    className="flex-1 h-1 cursor-pointer accent-crilli-400"
                  />
                  <span className="text-xs text-crilli-200 w-10">{formatTime(duration)}</span>
                </div>
              </div>
              <div className=" gap-4 flex-col md:flex-row hidden md:flex">
                {current.externalLink ? (
                  <Button variant="outline" asChild>
                    <Link href={current.externalLink} target="_blank" rel="noopener noreferrer">
                      SoundCloud
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = React.useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
