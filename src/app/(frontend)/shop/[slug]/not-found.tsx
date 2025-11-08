import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="font-crilli flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Product Not Found</h1>
        <p className="mb-8 text-gray-400">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/shop">
          <Button className="bg-white text-black hover:bg-gray-200">Back to Shop</Button>
        </Link>
      </div>
    </div>
  )
}
