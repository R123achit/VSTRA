import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { useCartStore } from '../store/useStore'
import WishlistButton from './WishlistButton'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)
  const touchStartX = useRef(null)

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.name || 'Default',
    })
    toast.success('Added to bag', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '13px', letterSpacing: '0.5px', borderRadius: '0' },
      iconTheme: { primary: '#fff', secondary: '#1a1a1a' },
    })
  }

  // Swipe on mobile to browse images
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || product.images.length <= 1) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      setCurrentImg((prev) =>
        diff > 0
          ? Math.min(prev + 1, product.images.length - 1)
          : Math.max(prev - 1, 0)
      )
    }
    touchStartX.current = null
  }

  // On hover, show second image if available
  const displayImg = isHovered && product.images.length > 1 && currentImg === 0
    ? product.images[1]
    : product.images[currentImg] || product.images[0]

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.35 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentImg(0) }}
    >
      <Link href={`/product/${product._id}`}>
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-[#f2f0ed] cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#eae8e4] animate-pulse" />
          )}

          {/* Product Image */}
          <div className="absolute inset-0 p-4 pb-6 flex items-center justify-center">
            <img
              src={displayImg}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={`max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-500 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-[1.03]' : 'scale-100'}`}
              loading="lazy"
            />
          </div>

          {/* Wishlist heart — top right */}
          <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
            <WishlistButton product={product} size="md" />
          </div>

          {/* Badges — top left stack */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="bg-[#1a1a1a] text-white text-[9px] tracking-[0.15em] px-2.5 py-1 uppercase font-medium">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="bg-[#c0392b] text-white text-[9px] tracking-[0.1em] px-2.5 py-1 uppercase font-medium">
                -{discount}%
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
              <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 font-medium">Sold Out</span>
            </div>
          )}

          {/* Image pagination dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {product.images.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(idx) }}
                  className={`w-[6px] h-[6px] rounded-full transition-all duration-200 ${
                    currentImg === idx
                      ? 'bg-[#1a1a1a] scale-110'
                      : 'bg-[#1a1a1a]/25 hover:bg-[#1a1a1a]/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Quick Add — slides up on hover */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
            onClick={handleQuickAdd}
          >
            <button
              disabled={product.stock === 0}
              className="w-full bg-[#1a1a1a]/95 backdrop-blur-sm text-white py-3.5 text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#000] transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Sold Out' : '+ Quick Add'}
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="pt-3 pb-2 px-0.5">
        {/* Brand */}
        <p className="text-[10px] text-neutral-400 tracking-[0.12em] uppercase mb-1 font-medium">
          {product.brand || 'VSTRA'}
        </p>

        {/* Product Name */}
        <Link href={`/product/${product._id}`}>
          <h3 className="text-[13px] text-[#1a1a1a] leading-[1.4] cursor-pointer hover:underline underline-offset-[3px] decoration-neutral-300 transition-all line-clamp-2 mb-2 font-normal">
            {product.name}
          </h3>
        </Link>

        {/* Color swatches */}
        {product.colors && product.colors.length > 1 && (
          <div className="flex gap-1.5 mb-2">
            {product.colors.slice(0, 5).map((color) => (
              <span
                key={color.name}
                className="w-3.5 h-3.5 rounded-full border border-neutral-200 hover:border-neutral-400 transition-colors cursor-pointer"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-neutral-400 self-center ml-0.5">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <p className="text-[14px] text-[#1a1a1a] font-medium">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <p className="text-[12px] text-neutral-400 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#c0392b] font-medium">
                ({discount}% off)
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
