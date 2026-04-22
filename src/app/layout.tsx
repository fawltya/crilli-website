import { sometypeMono } from '@/fonts'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Crilli DnB Belfast',
  description: 'Established in 2005 Crilli is a Drum & Bass + Jungle promotion based in Belfast.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (pathname.startsWith('/admin')) {
    return children
  }

  return (
    <html lang="en" className="bg-crilli-900" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-title" content="Crilli DnB" />
        <link rel="preconnect" href="https://jfkf0uemou6lrnps.public.blob.vercel-storage.com" />
        <link rel="preconnect" href="https://uploads.tickettailor.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={sometypeMono.className}>{children}</body>
    </html>
  )
}
