'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

export default function LoadingSpinner() {
  const spinnerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 2,
        repeat: -1,
        ease: 'none',
      })
    }
  }, [])

  return (
    <div className="flex items-center justify-center p-8">
      <div
        ref={spinnerRef}
        className="border-crilli-400 h-8 w-8 rounded-full border-2 border-t-transparent"
      />
    </div>
  )
}


