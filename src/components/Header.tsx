'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { List, X } from '@phosphor-icons/react'
// import CartIcon from './CartIcon'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {}
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationLinks = [
    { href: '/', label: 'Home' },
    // { href: '/shop', label: 'Shop' },
    { href: '/previous-events', label: 'Previous Events' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header
      className={`supports-[backdrop-filter]:bg-crilli-800/50 bg-crilli-900 sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300`}
      style={{
        maskImage: 'linear-gradient(to bottom, black calc(100% - 8px), rgba(0,0,0,0.1) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 8px), rgba(0,0,0,0.1) 100%)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          {/* <Link href="/" className="flex items-center">
            <Image
              src={buildMediaSrc('/api/media/file/Crilli%20Logo%20est%20belf.png')}
              alt="Crilli DnB Belfast"
              width={50}
              height={40}
              className="h-auto w-auto"
              priority
            />
          </Link> */}

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium uppercase transition-colors hover:text-white ${
                  isActive(link.href) ? 'text-white' : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side - Cart & Mobile Menu */}
          <div className="flex w-full items-center justify-between gap-4 md:w-fit">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white transition-colors hover:text-gray-300 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
            {/* <CartIcon /> */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-800 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 text-sm font-medium uppercase transition-colors hover:text-white ${
                    isActive(link.href)
                      ? 'border-l-4 border-white pl-3 text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
