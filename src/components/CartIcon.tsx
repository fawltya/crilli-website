'use client'

import Link from 'next/link'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingBag } from '@phosphor-icons/react'

export default function CartIcon() {
  const { cart } = useCart()

  const itemCount = cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0

  return (
    <Link
      href="/cart"
      className="hover:bg-crilli-800 relative flex h-10 w-10 items-center justify-center rounded-full transition-colors"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingBag size={24} weight="thin" color="white" />
      {itemCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200/90 text-[9px] font-bold text-black">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  )
}
