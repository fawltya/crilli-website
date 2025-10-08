'use client'

import { ComponentProps } from 'react'
import {
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
  SoundcloudLogo,
  SpotifyLogo,
} from '@phosphor-icons/react'

// Define the icon component type
type IconComponent = React.ComponentType<{
  size?: number | string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  color?: string
  className?: string
}>

// Icon mapping
const iconMap: Record<string, IconComponent> = {
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
  SoundcloudLogo,
  SpotifyLogo,
}

type IconWrapperProps = {
  iconName: string
  size?: number | string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  color?: string
  className?: string
} & ComponentProps<'div'>

export default function IconWrapper({
  iconName,
  size = 24,
  weight = 'regular',
  color,
  className = '',
  ...props
}: IconWrapperProps) {
  const Icon = iconMap[iconName]

  if (!Icon) {
    console.warn(`Icon "${iconName}" not found in iconMap`)
    return null
  }

  return (
    <div className={className} {...props}>
      <Icon
        size={size}
        weight={weight}
        color={color}
        className="h-full w-full opacity-70 transition-all duration-300 hover:opacity-100"
      />
    </div>
  )
}
