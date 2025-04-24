import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <main className="min-h-screen bg-crilli-900 text-crilli-50 uppercase p-10">
      <div className="relative flex items-center justify-center flex-col">
        <Image
          src="https://jfkf0uemou6lrnps.public.blob.vercel-storage.com/Crilli%20Logo%20est%20belf.png"
          alt="Your alt text"
          width={400}
          height={300}
        />
        <div className="self-stretch px-2.5 pt-6 inline-flex flex-col justify-start items-center gap-5">
          <div className="max-w-4xl px-2.5 py-12 inline-flex justify-start items-start gap-2.5 flex-wrap content-start text-wrap">
            <div className="flex-1 text-center justify-start text-neutral-100 font-normal leading-relaxed">
              <p className="mb-4">
                Established in 2005 Crilli is a Drum & Bass + Jungle promotion based in Belfast.
              </p>
              <p>
                We have been a part of Ireland's underground music culture for nearly two decades,
                giving artists like Goldie, Calibre, DJ Hazard, Sully, London Elektricity and DJ
                MArky the pleasure of experiencing beautiful Belfast audiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
