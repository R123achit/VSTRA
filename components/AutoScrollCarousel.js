import { motion } from 'framer-motion'

export default function AutoScrollCarousel() {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
      alt: 'Fashion Collection 1'
    },
    {
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      alt: 'Fashion Collection 2'
    },
    {
      url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
      alt: 'Fashion Collection 3'
    },
    {
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      alt: 'Fashion Collection 4'
    },
    {
      url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
      alt: 'Fashion Collection 5'
    },
    {
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
      alt: 'Fashion Collection 6'
    }
  ]

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images]

  return (
    <div className="w-full overflow-hidden bg-gray-50 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Latest Collections
        </h2>
        <p className="text-gray-600 mt-2">Discover our trending styles</p>
      </div>
      
      <div className="relative">
        <motion.div
          className="flex gap-6"
          animate={{
            x: ['0%', '-50%']
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear'
            }
          }}
        >
          {duplicatedImages.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 h-96 relative group cursor-pointer"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-semibold">View Collection</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
