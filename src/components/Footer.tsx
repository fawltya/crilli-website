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
    { href: '/#events', label: 'Events' },
    { href: '/shop', label: 'Shop' },
    { href: '/#podcasts', label: 'Podcasts' },
  ],
}: FooterProps) {
  return (
    <>
      {/* Footer */}
      <footer className="text-crilli-200/70 container mx-auto mt-16 flex w-full max-w-7xl flex-col items-center gap-10 px-8 pb-16 uppercase lg:px-10">
        <Separator className="bg-crilli-400/30 w-full" orientation="horizontal" />
        <div className="mx-auto flex w-full flex-row justify-between align-bottom md:flex-row md:items-start md:gap-4">
          <Image
            src={buildMediaSrc('/api/media/file/Crilli%20Logo%20est%20belf.png')}
            alt="Crilli DnB Belfast Logo"
            width={200}
            height={300}
            loading="lazy"
          />
          <div className="md:align-end flex flex-col justify-end gap-4 text-center md:text-right">
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
                  <p className="text-crilli-200 text-sm">
                    Sign up to our mailing list for early access to tickets
                  </p>
                </div>
                <SubscriptionForm />
              </>
            )}
            <div className="flex justify-center gap-4 md:justify-end">
              <Link
                href="https://www.instagram.com/crillidnb/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Crilli on Instagram"
              >
                <IconWrapper iconName="InstagramLogo" size={22} weight="light" />
              </Link>
              <Link
                href="https://www.facebook.com/CrilliDnB"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Crilli on Facebook"
              >
                <IconWrapper iconName="FacebookLogo" size={22} weight="light" />
              </Link>
              <Link
                href="https://www.soundcloud.com/Crillidnb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Listen to Crilli Podcasts on SoundCloud"
              >
                <IconWrapper iconName="SoundcloudLogo" size={22} weight="light" />
              </Link>
              <Link
                href="https://open.spotify.com/user/1116081744"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Listen to Crilli Playlists on Spotify"
              >
                <IconWrapper iconName="SpotifyLogo" size={22} weight="light" />
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCJI-M_xV5N_LUe22QBmPPTg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Crilli on YouTube"
              >
                <IconWrapper iconName="YoutubeLogo" size={22} weight="light" />
              </Link>
            </div>
          </div>
        </div>
        <Separator className="bg-crilli-400/30 mx-10 w-full" orientation="horizontal" />
      </footer>
    </>
  )
}
