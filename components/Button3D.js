import { motion } from 'framer-motion'
import { useState, useRef } from 'react'

export default function Button3D({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled || loading) return
    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900',
    secondary: 'bg-white text-black border-2 border-black hover:bg-black hover:text-white',
    accent: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    outline: 'bg-transparent text-black border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white',
    ghost: 'bg-transparent text-black hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  }

  const sizes = {
    sm: 'px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm min-h-[40px] md:min-h-[44px]',
    md: 'px-6 py-3 md:px-8 md:py-4 text-sm md:text-base min-h-[48px] md:min-h-[52px]',
    lg: 'px-8 py-4 md:px-10 md:py-5 text-base md:text-lg min-h-[56px] md:min-h-[60px]',
  }

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !disabled && !loading && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled || loading}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        scale: isHovered && !disabled && !loading ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        boxShadow: isHovered && !disabled && !loading
          ? '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.1)' 
          : '0 10px 20px -5px rgba(0, 0, 0, 0.15)',
      }}
      className={`
        relative font-semibold tracking-wider uppercase 
        rounded-lg overflow-hidden cursor-pointer
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
        disabled:opacity-50 disabled:cursor-not-allowed
        select-none inline-flex items-center justify-center
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: isHovered && !disabled && !loading ? ['0%', '100%'] : '-100%',
        }}
        transition={{ duration: 0.6 }}
        style={{ transform: 'translateZ(20px)' }}
      />

      {/* Loading Spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </motion.div>
      )}

      {/* Text with 3D depth */}
      <span 
        className={`relative z-10 block ${loading ? 'invisible' : 'visible'}`}
        style={{ transform: 'translateZ(40px)' }}
      >
        {children}
      </span>

      {/* Glow border */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: isHovered && !disabled && !loading
            ? 'inset 0 0 20px rgba(0, 0, 0, 0.1)' 
            : 'inset 0 0 0px rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.3 }}
        style={{ transform: 'translateZ(50px)' }}
      />
    </motion.button>
  )
}
