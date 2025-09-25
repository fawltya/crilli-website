import Image from 'next/image'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import IconWrapper from '@/components/IconWrapper'
import SubscriptionForm from '@/components/SubscriptionForm'
import { buildMediaSrc } from '@/lib/utils'

interface FooterProps {
  showSubscriptionForm?: boolean
  navigationLinks?: Array<{
    href: string
    label: string
  }>
}

export default function Footer({
  showSubscriptionForm = true,
  navigationLinks = [
    { href: '#events', label: 'Events' },
    { href: '#podcasts', label: 'Podcasts' },
  ],
}: FooterProps) {
  return (
    <>
      {/* Footer */}
      <div className="mt-16 w-full flex md:flex-row flex-col justify-between align-bottom md:gap-4 gap-10 items-center md:items-start">
        <Image
          src={buildMediaSrc('/api/media/file/Crilli%20Logo%20est%20belf.png')}
          alt="Crilli DnB Belfast Logo"
          width={200}
          height={300}
          loading="lazy"
        />
        <div className="flex flex-col gap-4 md:text-right justify-end md:align-end text-center">
          <div>
            {navigationLinks.map((link, index) => (
              <span key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-crilli-200 text-crilli-200/70 transition-all duration-300"
                >
                  {link.label}
                </Link>
                {index < navigationLinks.length - 1 && ' | '}
              </span>
            ))}
          </div>
          <Separator className="bg-crilli-400/30 w-full" orientation="horizontal" />
          {showSubscriptionForm && (
            <>
              <div>
                <p className="text-sm text-crilli-200">
                  Sign up to our mailing list for early access to tickets
                </p>
              </div>
              <SubscriptionForm />
            </>
          )}
          <div className="flex gap-4 md:justify-end justify-center">
            <Link href="https://www.instagram.com/crillidnb/" target="_blank">
              <IconWrapper iconName="InstagramLogo" size={22} weight="light" />
            </Link>
            <Link href="https://www.facebook.com/CrilliDnB" target="_blank">
              <IconWrapper iconName="FacebookLogo" size={22} weight="light" />
            </Link>
            <Link href="https://www.soundcloud.com/Crillidnb" target="_blank">
              <IconWrapper iconName="SoundcloudLogo" size={22} weight="light" />
            </Link>
            <Link href="https://open.spotify.com/user/1116081744" target="_blank">
              <IconWrapper iconName="SpotifyLogo" size={22} weight="light" />
            </Link>
            <Link href="https://www.youtube.com/channel/UCJI-M_xV5N_LUe22QBmPPTg" target="_blank">
              <IconWrapper iconName="YoutubeLogo" size={22} weight="light" />
            </Link>
          </div>
        </div>
      </div>
      <Separator className="bg-crilli-400/30 w-full mt-10" orientation="horizontal" />
    </>
  )
}
