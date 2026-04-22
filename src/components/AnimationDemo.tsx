'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function AnimationDemo() {
  const demoRef = useRef<HTMLDivElement>(null)

  // This component demonstrates various GSAP animations
  // You can use this as a reference for implementing similar effects

  const animateOnHover = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.1,
      rotation: 5,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const resetAnimation = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <div ref={demoRef} className="hidden">
      {/* This is a demo component - you can use these patterns in your actual components */}
      <div
        className="demo-element"
        onMouseEnter={(e) => animateOnHover(e.currentTarget)}
        onMouseLeave={(e) => resetAnimation(e.currentTarget)}
      >
        Hover me!
      </div>
    </div>
  )
}


