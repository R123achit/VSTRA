import { useEffect, useState } from 'react'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'

const FlyingClothsRive = () => {
  const [activeCloth, setActiveCloth] = useState(0)

  // Configuration for three cloth animations
  const clothConfigs = [
    {
      id: 1,
      position: 'left-10 top-20',
      size: 'w-64 h-64',
      delay: 0,
      color: 'from-purple-500/20 to-pink-500/20'
    },
    {
      id: 2,
      position: 'right-10 top-40',
      size: 'w-72 h-72',
      delay: 1000,
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      id: 3,
      position: 'left-1/2 -translate-x-1/2 top-60',
      size: 'w-80 h-80',
      delay: 2000,
      color: 'from-amber-500/20 to-rose-500/20'
    }
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {clothConfigs.map((config, index) => (
        <ClothAnimation
          key={config.id}
          config={config}
          isActive={activeCloth === index}
          onInteraction={() => setActiveCloth(index)}
        />
      ))}
    </div>
  )
}

const ClothAnimation = ({ config, isActive, onInteraction }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [animationState, setAnimationState] = useState('idle')

  // Rive animation hook with state machine
  const { RiveComponent, rive } = useRive({
    src: '/animations/cloth.riv', // You'll need to add your Rive file here
    stateMachines: 'State Machine 1',
    autoplay: true,
    onLoad: () => {
      console.log('Rive animation loaded')
    },
  })

  // Get state machine inputs for interactivity
  const hoverInput = useStateMachineInput(rive, 'State Machine 1', 'hover')
  const clickInput = useStateMachineInput(rive, 'State Machine 1', 'click')

  useEffect(() => {
    // Trigger different animations based on state
    if (hoverInput) {
      hoverInput.value = isHovered
    }
  }, [isHovered, hoverInput])

  const handleClick = () => {
    if (clickInput) {
      clickInput.fire()
    }
    onInteraction()
    setAnimationState('flying')
    
    setTimeout(() => {
      setAnimationState('idle')
    }, 2000)
  }

  return (
    <div
      className={`absolute ${config.position} ${config.size} pointer-events-auto transition-all duration-700 ease-out ${
        isActive ? 'scale-110 z-10' : 'scale-100'
      }`}
      style={{
        animation: `float${config.id} ${4 + config.id}s ease-in-out infinite`,
        animationDelay: `${config.delay}ms`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Gradient background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} blur-3xl rounded-full opacity-50 transition-opacity duration-500 ${
        isHovered ? 'opacity-80' : 'opacity-50'
      }`} />
      
      {/* Rive Animation Container */}
      <div className="relative w-full h-full cursor-pointer">
        <RiveComponent />
      </div>

      {/* Interaction indicator */}
      {isHovered && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
          Click to interact
        </div>
      )}

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-25px) rotate(7deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-30px) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(4deg); }
          75% { transform: translateY(-20px) rotate(-6deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-25px) rotate(6deg); }
          50% { transform: translateY(-35px) rotate(-4deg); }
          75% { transform: translateY(-15px) rotate(8deg); }
        }
      `}</style>
    </div>
  )
}

export default FlyingClothsRive
