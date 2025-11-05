'use client'

import { ReactNode, useRef } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { Button } from './ui/button'

interface AnimatedButtonProps {
  children: ReactNode
  href?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  className?: string
  onClick?: () => void
  asChild?: boolean
}

export default function AnimatedButton({
  children,
  href,
  variant = 'default',
  className = '',
  onClick,
  asChild = false,
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  }

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (rippleRef.current && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.set(rippleRef.current, {
        left: x,
        top: y,
        scale: 0,
        opacity: 1,
      })

      gsap.to(rippleRef.current, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
    }

    if (onClick) {
      onClick()
    }
  }

  const buttonContent = (
    <Button
      ref={buttonRef}
      variant={variant}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      asChild={asChild}
    >
      {children}
      <span
        ref={rippleRef}
        className="pointer-events-none absolute rounded-full bg-white/20"
        style={{ width: '20px', height: '20px' }}
      />
    </Button>
  )

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {buttonContent}
      </Link>
    )
  }

  return buttonContent
}


