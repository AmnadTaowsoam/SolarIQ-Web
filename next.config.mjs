import withPWAInit from 'next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-maps-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
  ],
})

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // WK-109: Performance Optimization - Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'solariqapp.com',
      },
      {
        protocol: 'https',
        hostname: 'www.solariqapp.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // WK-109: Performance Optimization - Bundle size and caching
  compress: true,
  swcMinify: true,
  generateEtags: true,
  // WK-109: Performance Optimization - Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|eot)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // WK-109: Performance Optimization - Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['recharts', 'lucide-react', '@heroicons/react', '@headlessui/react'],
    // WK-109: Performance Optimization - Optimize server components
    serverComponentsExternalPackages: ['sharp'],
  },
  // WK-109: Performance Optimization - Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default withNextIntl(withBundleAnalyzer(withPWA(nextConfig)))
