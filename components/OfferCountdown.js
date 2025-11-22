import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function OfferCountdown({ endDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date()
      
      if (difference <= 0) {
        setIsExpired(true)
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (isExpired) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-4 h-4 text-red-500" />
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <TimeUnit value={timeLeft.days} label="d" />
            <span className="text-sm font-bold">:</span>
          </>
        )}
        <TimeUnit value={timeLeft.hours} label="h" />
        <span className="text-sm font-bold">:</span>
        <TimeUnit value={timeLeft.minutes} label="m" />
        <span className="text-sm font-bold">:</span>
        <TimeUnit value={timeLeft.seconds} label="s" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-0.5"
    >
      <span className="text-sm font-bold text-red-600 min-w-[20px] text-center">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </motion.div>
  )
}
