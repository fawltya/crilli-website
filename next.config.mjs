import { withPayload } from '@payloadcms/next/withPayload'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, relative, resolve } from 'path'
import webpack from 'webpack'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Turbopack requires project-relative paths in resolveAlias (absolute paths fail to resolve). */
function projectRelative(absolutePath) {
  const rel = relative(__dirname, absolutePath)
  if (!rel || rel.startsWith('..')) {
    throw new Error(`Path outside project: ${absolutePath}`)
  }
  return rel.startsWith('.') ? rel : `./${rel.replace(/\\/g, '/')}`
}

const ecommerceMainPath = require.resolve('@payloadcms/plugin-ecommerce')
const ecommerceDistDir = dirname(ecommerceMainPath)
const seoMainPathForTurbo = require.resolve('@payloadcms/plugin-seo')
const seoDistDirForTurbo = dirname(seoMainPathForTurbo)
const vercelBlobMainPathForTurbo = require.resolve('@payloadcms/storage-vercel-blob')
const vercelBlobDistDirForTurbo = dirname(vercelBlobMainPathForTurbo)

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: resolve(__dirname),
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
  webpack: (config, { isServer }) => {
    config.externals = config.externals || []
    config.externals.push('cloudflare:sockets')
    config.externals.push('pg-native')

    // Help resolve Payload CMS plugins from hoisted node_modules
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@payloadcms/plugin-seo': require.resolve('@payloadcms/plugin-seo'),
      '@payloadcms/plugin-ecommerce': require.resolve('@payloadcms/plugin-ecommerce'),
      '@payloadcms/storage-vercel-blob': require.resolve('@payloadcms/storage-vercel-blob'),
    }

    // Configure webpack to properly resolve package.json exports
    config.resolve.conditionNames = ['import', 'require', 'default']
    config.resolve.fullySpecified = false

    // Ensure aliases are checked before other resolution strategies
    config.resolve.preferRelative = false

    // file-type is patched via pnpm patch to add fileTypeFromFile and fileTypeFromBuffer exports
    // No webpack alias needed - the patch handles ESM exports via index.mjs

    // Add aliases for subpath exports (needed for client-side bundles)
    const fs = require('fs')

    // Ecommerce plugin - client/react and rsc
    // Resolve main package, then construct path to subpath export
    const ecommerceMainPath = require.resolve('@payloadcms/plugin-ecommerce')
    const ecommerceDistDir = dirname(ecommerceMainPath)
    const ecommerceReactPath = resolve(ecommerceDistDir, 'exports/client/react.js')
    const ecommerceRscPath = resolve(ecommerceDistDir, 'exports/rsc.js')

    // Verify file exists and use absolute path
    if (fs.existsSync(ecommerceReactPath)) {
      config.resolve.alias['@payloadcms/plugin-ecommerce/client/react'] = ecommerceReactPath

      // Also add a webpack NormalModuleReplacementPlugin as a fallback
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@payloadcms\/plugin-ecommerce\/client\/react$/,
          ecommerceReactPath,
        ),
      )
    } else {
      console.warn(
        'Warning: Could not find @payloadcms/plugin-ecommerce/client/react at:',
        ecommerceReactPath,
      )
    }

    // Ecommerce plugin - RSC (React Server Components)
    if (fs.existsSync(ecommerceRscPath)) {
      config.resolve.alias['@payloadcms/plugin-ecommerce/rsc'] = ecommerceRscPath

      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@payloadcms\/plugin-ecommerce\/rsc$/,
          ecommerceRscPath,
        ),
      )
    } else {
      console.warn('Warning: Could not find @payloadcms/plugin-ecommerce/rsc at:', ecommerceRscPath)
    }

    // Ecommerce plugin - client (base client export)
    // The client export is actually at exports/client/index.js, not exports/client.js
    const ecommerceClientIndexPath = resolve(ecommerceDistDir, 'exports/client/index.js')
    if (fs.existsSync(ecommerceClientIndexPath)) {
      config.resolve.alias['@payloadcms/plugin-ecommerce/client'] = ecommerceClientIndexPath

      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@payloadcms\/plugin-ecommerce\/client$/,
          ecommerceClientIndexPath,
        ),
      )
    } else {
      console.warn(
        'Warning: Could not find @payloadcms/plugin-ecommerce/client at:',
        ecommerceClientIndexPath,
      )
    }

    // SEO plugin - client
    const seoMainPath = require.resolve('@payloadcms/plugin-seo')
    const seoDistDir = dirname(seoMainPath)
    const seoClientPath = resolve(seoDistDir, 'exports/client.js')

    if (fs.existsSync(seoClientPath)) {
      config.resolve.alias['@payloadcms/plugin-seo/client'] = seoClientPath

      // Also add a webpack NormalModuleReplacementPlugin as a fallback
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@payloadcms\/plugin-seo\/client$/,
          seoClientPath,
        ),
      )
    } else {
      console.warn('Warning: Could not find @payloadcms/plugin-seo/client at:', seoClientPath)
    }

    // Vercel Blob Storage plugin - client
    const vercelBlobMainPath = require.resolve('@payloadcms/storage-vercel-blob')
    const vercelBlobDistDir = dirname(vercelBlobMainPath)
    const vercelBlobClientPath = resolve(vercelBlobDistDir, 'exports/client.js')

    if (fs.existsSync(vercelBlobClientPath)) {
      config.resolve.alias['@payloadcms/storage-vercel-blob/client'] = vercelBlobClientPath

      // Also add a webpack NormalModuleReplacementPlugin as a fallback
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@payloadcms\/storage-vercel-blob\/client$/,
          vercelBlobClientPath,
        ),
      )
    } else {
      console.warn(
        'Warning: Could not find @payloadcms/storage-vercel-blob/client at:',
        vercelBlobClientPath,
      )
    }

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
      '@payloadcms/plugin-ecommerce/client/react': projectRelative(
        resolve(ecommerceDistDir, 'exports/client/react.js'),
      ),
      '@payloadcms/plugin-ecommerce/rsc': projectRelative(
        resolve(ecommerceDistDir, 'exports/rsc.js'),
      ),
      '@payloadcms/plugin-ecommerce/client': projectRelative(
        resolve(ecommerceDistDir, 'exports/client/index.js'),
      ),
      '@payloadcms/plugin-seo/client': projectRelative(
        resolve(seoDistDirForTurbo, 'exports/client.js'),
      ),
      '@payloadcms/storage-vercel-blob/client': projectRelative(
        resolve(vercelBlobDistDirForTurbo, 'exports/client.js'),
      ),
    },
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs'],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: 'uploads.tickettailor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'crilli-website.vercel.app', pathname: '/**' },
    ],
    // Disable optimization for PayloadCMS media routes to avoid conflicts
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: [
      '@phosphor-icons/react',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
    ],
    /** Avoid noisy "turbopackServerFastRefresh" experimental warning; dev script also passes --no-server-fast-refresh */
    turbopackServerFastRefresh: false,
  },
  serverExternalPackages: [
    'payload',
    '@payloadcms/db-vercel-postgres',
    'sharp',
    'file-type',
  ],
}

export default withPayload(nextConfig, { 
  devBundleServerPackages: false,
})
