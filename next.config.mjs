
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push('cloudflare:sockets');
    config.externals.push('pg-native');
    return config;
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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
