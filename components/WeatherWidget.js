import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import axios from 'axios'

// Compact weather widget for navbar or floating display
export default function WeatherWidget({ compact = false }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const response = await axios.get('/api/weather', {
              params: { lat: latitude, lon: longitude }
            })
            setWeather(response.data)
            setLoading(false)
          },
          () => {
            fetchDefaultWeather()
          }
        )
      } else {
        fetchDefaultWeather()
      }
    } catch (err) {
      setLoading(false)
    }
  }

  const fetchDefaultWeather = async () => {
    try {
      const response = await axios.get('/api/weather', {
        params: { lat: 19.0760, lon: 72.8777 }
      })
      setWeather(response.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      cold: '❄️',
      rainy: '🌧️',
      hot: '☀️',
      warm: '🌤️',
      cloudy: '☁️'
    }
    return icons[condition] || '🌤️'
  }

  if (loading || !weather) {
    return null
  }

  if (compact) {
    // Compact version for navbar
    return (
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full cursor-pointer"
        >
          <span className="text-xl">{getWeatherIcon(weather.condition)}</span>
          <span className="text-sm font-semibold">{weather.temperature}°C</span>
        </motion.div>

        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl p-4 z-50"
            >
              <div className="text-sm">
                <p className="font-bold text-gray-900 mb-1">
                  {weather.city}
                </p>
                <p className="text-gray-600 mb-3">
                  {weather.description}
                </p>
                <div className="border-t pt-3">
                  <p className="font-semibold text-gray-900 mb-2 text-xs">
                    {weather.recommendation.title}
                  </p>
                  <Link href="/shop">
                    <button className="w-full bg-black text-white py-2 px-4 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors">
                      Shop Recommendations
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Floating widget version
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl p-4 max-w-xs"
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl">{getWeatherIcon(weather.condition)}</span>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold">{weather.temperature}°C</span>
            <span className="text-sm text-gray-600">{weather.city}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{weather.description}</p>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-gray-900 mb-1">
              {weather.recommendation.title}
            </p>
            <p className="text-xs text-gray-600">
              {weather.recommendation.message.substring(0, 60)}...
            </p>
          </div>

          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              View Recommendations
            </motion.button>
          </Link>
        </div>

        <button
          onClick={() => setWeather(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
