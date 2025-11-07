import React from 'react'
import './styles.css'
import { PlayerProvider } from '@/components/SitePlayer'
import SmoothScroll from '@/components/SmoothScroll'
import ScrollToTop from '@/components/ScrollToTop'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import CartProvider from '@/components/CartProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  description: 'Established in 2005, Crilli is a Drum & Bass + Jungle promotion based in Belfast.',
  title: 'Crilli DnB Belfast',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="bg-crilli-900">
      <head>
        <meta name="apple-mobile-web-app-title" content="Crilli DnB" />
        <link rel="preconnect" href="https://jfkf0uemou6lrnps.public.blob.vercel-storage.com" />
        <link rel="preconnect" href="https://uploads.tickettailor.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="font-main">
        <CartProvider>
          <PlayerProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </PlayerProvider>
        </CartProvider>
        <SmoothScroll />
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
