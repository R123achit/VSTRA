/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'videos.pexels.com', 'images.pexels.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize production build
  productionBrowserSourceMaps: false,
  // Compress output
  compress: true,
  // Optimize fonts
  optimizeFonts: true,
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,
}

module.exports = nextConfig
