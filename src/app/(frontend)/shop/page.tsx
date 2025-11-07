import Image from 'next/image'
import { getPayload } from 'payload'
import Link from 'next/link'
import config from '@/payload.config'
import type { Product, Media } from '@/payload-types'
import { buildMediaSrc, formatPriceInGBP } from '@/lib/utils'

export const metadata = {
  title: 'Shop - Crilli',
  description: 'Browse our collection of merchandise',
}

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          productStatus: {
            in: ['live', 'onSale'],
          },
        },
      ],
    },
    depth: 2,
    limit: 100,
  })

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-12 text-center text-4xl font-bold md:text-5xl">Shop</h1>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-400">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: Product) => {
              const firstGalleryImage = product.gallery?.[0]?.image as Media | undefined
              const imageUrl = firstGalleryImage?.url ? buildMediaSrc(firstGalleryImage.url) : null

              const slug = product.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()

              return (
                <Link
                  key={product.id}
                  href={`/shop/${slug}`}
                  className="group block overflow-hidden rounded-lg bg-gray-900 transition-colors hover:bg-gray-800"
                >
                  {imageUrl ? (
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gray-800">
                      <span className="text-gray-600">No image</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="mb-2 text-xl font-semibold transition-colors group-hover:text-white">
                      {product.title}
                    </h2>
                    {product.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-400">
                        {product.description}
                      </p>
                    )}
                    {product.priceInGBP && product.priceInGBPEnabled && (
                      <p className="text-lg font-bold">£{formatPriceInGBP(product.priceInGBP)}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
