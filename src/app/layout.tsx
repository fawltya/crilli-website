import { sometypeMono } from '@/fonts'

export const metadata = {
  title: 'Crilli DnB Belfast',
  description: 'Established in 2005 Crilli is a Drum & Bass + Jungle promotion based in Belfast.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sometypeMono.variable}>
      <body className={sometypeMono.className}>{children}</body>
    </html>
  )
}
