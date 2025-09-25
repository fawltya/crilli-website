import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || []
    config.externals.push('cloudflare:sockets')
    config.externals.push('pg-native')
    return config
  },
  async headers() {
    return [
      {
        source: '/api/media/file/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Encoding', value: 'gzip' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
  turbopack: {
    resolveAlias: {
      'cloudflare:sockets': './src/stubs/empty.js',
      'pg-native': './src/stubs/empty.js',
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: 'uploads.tickettailor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'crilli-website.vercel.app', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@phosphor-icons/react',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
