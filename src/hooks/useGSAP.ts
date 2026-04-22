'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export const useGSAP = (
  callback: (context: gsap.Context) => void,
  dependencies: React.DependencyList = [],
) => {
  const context = useRef<gsap.Context | null>(null)

  useEffect(() => {
    context.current = gsap.context(callback)
    return () => context.current?.revert()
  }, dependencies)

  return context
}

export const useScrollTrigger = (
  vars: ScrollTrigger.Vars,
  dependencies: React.DependencyList = [],
) => {
  const trigger = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    trigger.current = ScrollTrigger.create(vars)
    return () => trigger.current?.kill()
  }, dependencies)

  return trigger
}

export const useStaggeredAnimation = (
  selector: string,
  animation: gsap.TweenVars,
  stagger: number = 0.1,
  dependencies: React.DependencyList = [],
) => {
  useGSAP(() => {
    gsap.fromTo(
      selector,
      { opacity: 0, y: 50 },
      {
        ...animation,
        opacity: 1,
        y: 0,
        stagger,
        duration: 0.8,
        ease: 'power2.out',
      },
    )
  }, dependencies)
}

export const useFadeInUp = (selector: string, delay: number = 0) => {
  useGSAP(() => {
    gsap.fromTo(
      selector,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay,
        ease: 'power2.out',
      },
    )
  })
}

export const useScaleIn = (selector: string, delay: number = 0) => {
  useGSAP(() => {
    gsap.fromTo(
      selector,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay,
        ease: 'back.out(1.7)',
      },
    )
  })
}

export const useParallax = (selector: string, speed: number = 0.5) => {
  useGSAP(() => {
    gsap.to(selector, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: selector,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  })
}
