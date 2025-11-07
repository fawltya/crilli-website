import Image from 'next/image'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import type { Product, Media, Variant, VariantOption, VariantType } from '@/payload-types'
import { buildMediaSrc, formatPriceInGBP } from '@/lib/utils'
import ProductVariantSelector from '@/components/ProductVariantSelector'

export const metadata = {
  title: 'Product - Crilli',
  description: 'Product details',
}

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
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
    depth: 3,
    limit: 100,
  })

  const product = products.find((p: Product) => {
    const productSlug = p.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    return productSlug === slug
  })

  if (!product) {
    notFound()
  }

  const variants = product.variants?.docs || []
  const variantTypes = (product.variantTypes || []) as VariantType[]
  const variantOptionsByType: Record<string, VariantOption[]> = {}

  for (const variantTypeRef of variantTypes) {
    const variantTypeId = typeof variantTypeRef === 'object' ? variantTypeRef.id : variantTypeRef
    const variantType = (await payload.findByID({
      collection: 'variantTypes',
      id: variantTypeId,
      depth: 2,
    })) as VariantType

    if (variantType && variantType.options?.docs) {
      const options = variantType.options.docs.filter(
        (opt): opt is VariantOption => typeof opt === 'object' && opt !== null,
      )
      variantOptionsByType[variantType.name.toLowerCase()] = options
    }
  }

  const galleryImages = (product.gallery || [])
    .map((item) => item.image as Media)
    .filter((img): img is Media => img !== null && typeof img === 'object')

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            {galleryImages.length > 0 ? (
              <>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={buildMediaSrc(galleryImages[0].url || '')}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {galleryImages.slice(1, 5).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square w-full overflow-hidden rounded-lg"
                      >
                        <Image
                          src={buildMediaSrc(image.url || '')}
                          alt={`${product.title} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-800">
                <span className="text-gray-600">No images available</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{product.title}</h1>
              {product.priceInGBP && product.priceInGBPEnabled && (
                <p className="mb-6 text-3xl font-bold">£{formatPriceInGBP(product.priceInGBP)}</p>
              )}
            </div>

            {product.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-line text-gray-300">
                  {product.description}
                </p>
              </div>
            )}

            {variants.length > 0 && (
              <ProductVariantSelector
                product={product}
                variants={variants as Variant[]}
                variantOptionsByType={variantOptionsByType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
