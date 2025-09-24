'use client'

import { useState, useEffect } from 'react'

export default function ScrollButton({ containerId }: { containerId: string }) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollButtons = () => {
    const container = document.getElementById(containerId)
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (container) {
      updateScrollButtons()
      container.addEventListener('scroll', updateScrollButtons)
      return () => container.removeEventListener('scroll', updateScrollButtons)
    }
  }, [containerId])

  const scrollLeft = () => {
    const container = document.getElementById(containerId)
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById(containerId)
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-row gap-3 self-end">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="relative overflow-hidden backdrop-blur-lg p-2 transition-all duration-300 z-10 group"
          aria-label="Scroll left"
        >
          {/* Corner Border Overlay */}
          <div className="pointer-events-none absolute inset-0">
            {/* top-left */}
            <span className="absolute left-1 top-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute left-1 top-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            {/* top-right */}
            <span className="absolute right-1 top-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute right-1 top-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            {/* bottom-left */}
            <span className="absolute bottom-1 left-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute bottom-1 left-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            {/* bottom-right */}
            <span className="absolute bottom-1 right-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute bottom-1 right-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-crilli-200 relative z-10"
          >
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          </svg>
        </button>
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="relative overflow-hidden backdrop-blur-lg p-2 transition-all duration-300 z-10 group"
          aria-label="Scroll right"
        >
          {/* Corner Border Overlay */}
          <div className="pointer-events-none absolute inset-0">
            {/* top-left */}
            <span className="absolute left-1 top-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute left-1 top-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            {/* top-right */}
            <span className="absolute right-1 top-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute right-1 top-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            {/* bottom-left */}
            <span className="absolute bottom-1 left-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute bottom-1 left-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            {/* bottom-right */}
            <span className="absolute bottom-1 right-1 h-px w-2 bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
            <span className="absolute bottom-1 right-1 h-2 w-px bg-crilli-600 group-hover:bg-crilli-400 transition-colors duration-300" />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-crilli-200 relative z-10"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>
      )}
    </div>
  )
}
