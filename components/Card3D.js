import { motion } from 'framer-motion'
import { useState, useRef } from 'react'

export default function Card3D({ 
  children, 
  className = '',
  intensity = 15,
  glowColor = 'rgba(212, 175, 55, 0.5)',
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * -intensity
    const rotateYValue = ((x - centerX) / centerX) * intensity
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
    setMouseX((x / rect.width) * 100)
    setMouseY((y / rect.height) * 100)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        boxShadow: isHovered 
          ? `0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px ${glowColor}` 
          : '0 10px 20px -5px rgba(0, 0, 0, 0.1)',
      }}
      className={`relative rounded-xl overflow-hidden ${className}`}
      {...props}
    >
      {/* Spotlight effect that follows mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0"
        animate={{
          opacity: isHovered ? 0.3 : 0,
          background: isHovered 
            ? `radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.8) 0%, transparent 50%)`
            : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        style={{ transform: 'translateZ(60px)' }}
      />

      {/* Holographic shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={isHovered ? {
          backgroundPosition: ['0% 0%', '100% 100%'],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Content wrapper with 3D depth */}
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>

      {/* Glow border */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isHovered 
            ? `inset 0 0 40px ${glowColor}` 
            : 'inset 0 0 0px rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.3 }}
        style={{ transform: 'translateZ(70px)' }}
      />
    </motion.div>
  )
}
