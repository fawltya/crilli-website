import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalizes media URLs between dev and prod.
// - If value starts with http(s), return as-is.
// - If value starts with /api, return as-is (relative path for dev/prod correctness).
// - Otherwise, prefix with /api/media/file/ for direct file serving.
export function buildMediaSrc(value: string | null | undefined): string {
  if (!value) return ''
  if (value.startsWith('http')) return value
  if (value.startsWith('/api')) return value
  return `/api/media/file/${value}`
}

export type PodcastPlayable = {
  title: string
  artist: string
  date?: string
  artworkUrl?: string | null
  audioUrl: string
  externalLink?: string | null
}
