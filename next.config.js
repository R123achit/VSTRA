/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  // Disable static optimization for pages that use router
  experimental: {
    esmExternals: true,
  },
  // Export as server-side rendered
  output: 'standalone',
}

module.exports = nextConfig
