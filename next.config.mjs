import webpack from 'webpack'
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: 'uploads.tickettailor.com',                 pathname: '/**' },
      { protocol: 'https', hostname: 'crilli-website.vercel.app', pathname: '/**' },
    ],
  },
  webpack(config, { isServer }) {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^cloudflare:sockets$|^pg-native$/,
      })
    )
    return config
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
