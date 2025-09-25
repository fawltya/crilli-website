import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalizes media URLs between dev and prod.
// - If value starts with http(s), return as-is (direct Vercel Blob URLs).
// - If value starts with /api/media/file/, convert to direct Vercel Blob URL.
// - Otherwise, prefix with /api/media/file/ for direct file serving.
export function buildMediaSrc(value: string | null | undefined): string {
  if (!value) return ''
  if (value.startsWith('http')) return value

  // Convert PayloadCMS /api/media/file/ URLs to direct Vercel Blob URLs
  if (value.startsWith('/api/media/file/')) {
    const filename = value.replace('/api/media/file/', '')
    // Use the Vercel Blob URL pattern - this should match your actual blob domain
    return `https://jfkf0uemou6lrnps.public.blob.vercel-storage.com/${filename}`
  }

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
