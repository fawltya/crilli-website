import React from 'react'
import './styles.css'
import { PlayerProvider } from '@/components/SitePlayer'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
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
