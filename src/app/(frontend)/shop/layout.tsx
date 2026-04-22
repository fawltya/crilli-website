import type { ReactNode } from 'react'

/** Shop is not linked in the UI yet; keep out of search results. */
export const metadata = {
  robots: { index: false, follow: false },
}

export default function ShopLayout({ children }: { children: ReactNode }) {
  return children
}
