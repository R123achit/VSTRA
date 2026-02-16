/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'images.unsplash.com', 
      'videos.pexels.com', 
      'images.pexels.com',
      'rukminim2.flixcart.com',
      'rukminim1.flixcart.com',
      'img.flixcart.com'
    ],
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
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Exclude nodemailer from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
