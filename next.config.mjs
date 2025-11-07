import { withPayload } from '@payloadcms/next/withPayload'
import { createRequire } from 'module'
import webpack from 'webpack'

const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
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

    // Add aliases for subpath exports (needed for client-side bundles)
    const path = require('path')
    const fs = require('fs')

    // Ecommerce plugin - client/react and rsc
    // Resolve main package, then construct path to subpath export
    const ecommerceMainPath = require.resolve('@payloadcms/plugin-ecommerce')
    const ecommerceDistDir = path.dirname(ecommerceMainPath)
    const ecommerceReactPath = path.resolve(ecommerceDistDir, 'exports/client/react.js')
    const ecommerceRscPath = path.resolve(ecommerceDistDir, 'exports/rsc.js')

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
    const ecommerceClientIndexPath = path.resolve(ecommerceDistDir, 'exports/client/index.js')
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
    const seoDistDir = path.dirname(seoMainPath)
    const seoClientPath = path.resolve(seoDistDir, 'exports/client.js')

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
    const vercelBlobDistDir = path.dirname(vercelBlobMainPath)
    const vercelBlobClientPath = path.resolve(vercelBlobDistDir, 'exports/client.js')

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

    // Ensure SCSS files are handled correctly
    // Modify SCSS loader rules to include Payload CMS packages
    if (config.module && config.module.rules) {
      config.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (oneOfRule.test && oneOfRule.test.toString().includes('scss')) {
              // Don't exclude Payload CMS packages from SCSS processing
              if (oneOfRule.exclude) {
                if (typeof oneOfRule.exclude === 'function') {
                  const originalExclude = oneOfRule.exclude
                  oneOfRule.exclude = (path) => {
                    if (path && path.includes && path.includes('@payloadcms')) {
                      return false
                    }
                    return originalExclude(path)
                  }
                } else if (Array.isArray(oneOfRule.exclude)) {
                  oneOfRule.exclude = oneOfRule.exclude.filter(
                    (item) => typeof item !== 'string' || !item.includes('@payloadcms'),
                  )
                }
              }
            }
          })
        }
      })
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
      '@payloadcms/plugin-ecommerce/client/react': require
        .resolve('@payloadcms/plugin-ecommerce')
        .replace('/dist/index.js', '/dist/exports/client/react.js'),
      '@payloadcms/plugin-ecommerce/rsc': require
        .resolve('@payloadcms/plugin-ecommerce')
        .replace('/dist/index.js', '/dist/exports/rsc.js'),
      '@payloadcms/plugin-ecommerce/client': require
        .resolve('@payloadcms/plugin-ecommerce')
        .replace('/dist/index.js', '/dist/exports/client/index.js'),
      '@payloadcms/plugin-seo/client': require
        .resolve('@payloadcms/plugin-seo')
        .replace('/dist/index.js', '/dist/exports/client.js'),
      '@payloadcms/storage-vercel-blob/client': require
        .resolve('@payloadcms/storage-vercel-blob')
        .replace('/dist/index.js', '/dist/exports/client.js'),
    },
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
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
  },
  // Moved from experimental.serverComponentsExternalPackages
  // Note: Don't externalize these if they have SCSS dependencies
  // serverExternalPackages: [
  //   '@payloadcms/plugin-seo',
  //   '@payloadcms/plugin-ecommerce',
  //   '@payloadcms/storage-vercel-blob',
  // ],
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
