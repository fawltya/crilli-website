'use client'

import { ReactNode, useRef } from 'react'
import { useGSAP } from '@/hooks/useGSAP'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from 'gsap'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideUp'
  delay?: number
  duration?: number
  stagger?: number
  trigger?: string
}

export default function AnimatedSection({
  children,
  className = '',
  animationType = 'fadeInUp',
  delay = 0,
  duration = 0.8,
  stagger = 0,
  trigger,
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useGSAP(() => {
    if (!sectionRef.current || prefersReducedMotion) return

    const element = sectionRef.current
    const children = element.children

    // Set initial state based on animation type
    switch (animationType) {
      case 'fadeInUp':
        gsap.set(children, { opacity: 0, y: 50 })
        break
      case 'fadeInLeft':
        gsap.set(children, { opacity: 0, x: -50 })
        break
      case 'fadeInRight':
        gsap.set(children, { opacity: 0, x: 50 })
        break
      case 'scaleIn':
        gsap.set(children, { opacity: 0, scale: 0.8 })
        break
      case 'slideUp':
        gsap.set(children, { opacity: 0, y: 100 })
        break
    }

    const tl = gsap.timeline({
      delay,
      scrollTrigger: trigger
        ? {
            trigger: trigger,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          }
        : undefined,
    })

    tl.to(children, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      stagger,
      ease: 'power2.out',
    })
  }, [animationType, delay, duration, stagger, trigger, prefersReducedMotion])

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  )
}
