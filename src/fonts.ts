// import { Sometype_Mono } from 'next/font/google'

// export const sometypeMono = Sometype_Mono({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-sometype-mono',
//   display: 'swap',
//   adjustFontFallback: false,
// })

import localFont from 'next/font/local'

export const sometypeMono = localFont({
  src: [
    {
      path: '../public/fonts/SometypeMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SometypeMono-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/SometypeMono-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/SometypeMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sometype-mono',
  display: 'swap',
  adjustFontFallback: false,
})
