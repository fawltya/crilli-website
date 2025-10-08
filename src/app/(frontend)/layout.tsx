import React from 'react'
import './styles.css'
import { PlayerProvider } from '@/components/SitePlayer'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  description: 'Established in 2005, Crilli is a Drum & Bass + Jungle promotion based in Belfast.',
  title: 'Crilli DnB Belfast',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Crilli DnB" />
        <link rel="preconnect" href="https://jfkf0uemou6lrnps.public.blob.vercel-storage.com" />
        <link rel="preconnect" href="https://uploads.tickettailor.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <PlayerProvider>
          <main>{children}</main>
        </PlayerProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
