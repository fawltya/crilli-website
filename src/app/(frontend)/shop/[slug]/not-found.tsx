import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-400 mb-8">The product you're looking for doesn't exist.</p>
        <Link href="/shop">
          <Button className="bg-white text-black hover:bg-gray-200">
            Back to Shop
          </Button>
        </Link>
      </div>
    </div>
  )
}

