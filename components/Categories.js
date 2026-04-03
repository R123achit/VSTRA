import { motion } from 'framer-motion'
import Link from 'next/link'

const campaigns = [
  {
    title: 'WOMAN',
    subtitle: 'The Spring Edit',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=80',
    link: '/shop?category=women',
  },
  {
    title: 'MAN',
    subtitle: 'Elevated Everyday',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1920&q=80',
    link: '/shop?category=men',
  },
  {
    title: 'KIDS',
    subtitle: 'Joyful Styles',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1920&q=80',
    link: '/shop?category=kids',
  },
]

export default function Categories() {
  return (
    <section id="categories" className="bg-white w-full">
      {campaigns.map((campaign, idx) => (
        <Link key={campaign.title} href={campaign.link}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="group relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden cursor-pointer block border-b border-gray-100"
          >
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-full object-cover object-center transition-transform duration-[1.5s] group-hover:scale-105"
            />
            {/* Dark gradient for text readability */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 lg:p-8">
              <h3 className="text-white text-4xl lg:text-5xl font-medium tracking-widest mb-2 shadow-sm drop-shadow-md">
                {campaign.title}
              </h3>
              <p className="text-white text-[13px] tracking-[0.2em] font-medium uppercase mb-6 drop-shadow-md">
                {campaign.subtitle}
              </p>
              
              <div className="bg-white/90 backdrop-blur-sm text-black px-8 py-3 text-[12px] tracking-[0.1em] font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                DISCOVER MORE
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </section>
  )
}
