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
    // disable ESM externals to avoid parsing issues on some Node versions
    esmExternals: false,
  },
}

module.exports = nextConfig
