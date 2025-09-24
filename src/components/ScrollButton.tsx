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
    <div className="flex flex-row gap-4 self-end">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="self-end left-4 top-1/2 -translate-y-1/2 hover:bg-crilli-800/80 border border-px border-crilli-600/20 backdrop-blur-lg  rounded-full p-1 transition-all duration-300 z-10"
          aria-label="Scroll left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-crilli-200"
          >
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          </svg>
        </button>
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="self-end left-4 top-1/2 -translate-y-1/2 hover:bg-crilli-800/80 border border-px border-crilli-600/20 backdrop-blur-lg  rounded-full p-1 transition-all duration-300 z-10"
          aria-label="Scroll right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-crilli-200"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>
      )}
    </div>
  )
}
