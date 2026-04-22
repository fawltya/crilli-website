'use client'

import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { ReactNode } from 'react'

interface CartProviderProps {
  children: ReactNode
}

export default function CartProvider({ children }: CartProviderProps) {
  return (
    <EcommerceProvider
      api={{
        apiRoute: '/api',
        cartsFetchQuery: {
          depth: 5, // Fetch product, variant, gallery, and all nested relationships
        },
      }}
      cartsSlug="carts"
      addressesSlug="addresses"
      enableVariants={true}
      currenciesConfig={{
        defaultCurrency: 'GBP',
        supportedCurrencies: [
          {
            code: 'GBP',
            decimals: 2,
            label: 'British Pound',
            symbol: '£',
          },
        ],
      }}
    >
      {children}
    </EcommerceProvider>
  )
}
