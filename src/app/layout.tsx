import { sometypeMono } from '@/fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sometypeMono.variable}>
      <body>{children}</body>
    </html>
  )
}
