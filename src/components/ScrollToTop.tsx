'use client'

import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    ScrollTrigger.create({
      trigger: 'body',
      start: 'top -100%',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setIsVisible(self.progress > 0.1)
      },
    })
  }, [])

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 1,
      scrollTo: 0,
      ease: 'power2.inOut',
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="bg-crilli-600 hover:bg-crilli-500 text-crilli-50 fixed right-8 bottom-8 z-50 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  )
}


