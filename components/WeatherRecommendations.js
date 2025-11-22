import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function WeatherRecommendations() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)



  useEffect(() => {
    fetchWeatherAndRecommendations()
  }, [])

  const fetchWeatherAndRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Fetch weather data
            const response = await axios.get('/api/weather', {
              params: { lat: latitude, lon: longitude }
            })
            
            setWeather(response.data)
            setLocation({ lat: latitude, lon: longitude })
            setLoading(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            // Fallback to default location (e.g., Mumbai)
            fetchDefaultWeather()
          }
        )
      } else {
        fetchDefaultWeather()
      }
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to fetch weather data')
      setLoading(false)
    }
  }

  const fetchDefaultWeather = async () => {
    try {
      // Default to Mumbai coordinates
      const response = await axios.get('/api/weather', {
        params: { lat: 19.0760, lon: 72.8777 }
      })
      setWeather(response.data)
      setLoading(false)
    } catch (err) {
      setError('Unable to fetch weather data')
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

  const getWeatherGradient = (condition) => {
    const gradients = {
      cold: 'from-[#0a1628] via-[#0f1f3a] to-[#1a2942]',
      rainy: 'from-[#0d1b2a] via-[#1b263b] to-[#2d3e50]',
      hot: 'from-[#1a2332] via-[#243447] to-[#2e4559]',
      warm: 'from-[#162238] via-[#1e2f47] to-[#273c56]',
      cloudy: 'from-[#0f1d2e] via-[#1a2a3f] to-[#253750]'
    }
    return gradients[condition] || 'from-[#0a1628] via-[#0f1f3a] to-[#1a2942]'
  }

  const getAccentColor = (condition) => {
    const accents = {
      cold: 'from-blue-400/15 via-cyan-400/10 to-transparent',
      rainy: 'from-blue-300/15 via-indigo-400/10 to-transparent',
      hot: 'from-amber-400/15 via-orange-400/10 to-transparent',
      warm: 'from-yellow-400/15 via-amber-400/10 to-transparent',
      cloudy: 'from-slate-400/15 via-gray-400/10 to-transparent'
    }
    return accents[condition] || 'from-blue-400/15 via-cyan-400/10 to-transparent'
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2942] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl mb-6 sm:mb-8 border border-blue-400/20">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-300"></div>
          <p className="text-blue-50 font-light text-sm sm:text-lg tracking-wide">Curating recommendations...</p>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return null
  }

  return (
    <div
      className={`relative bg-gradient-to-br ${getWeatherGradient(weather.condition)} rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8 overflow-hidden border border-blue-400/20`}
    >
      {/* Premium navy overlay gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getAccentColor(weather.condition)} pointer-events-none`} />
      {/* Header */}
      <div 
        className="relative p-4 sm:p-6 md:p-8 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-1 min-w-0">
            <div className="bg-blue-400/10 backdrop-blur-md p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-blue-300/30 flex-shrink-0">
              <span className="text-3xl sm:text-4xl md:text-5xl">{getWeatherIcon(weather.condition)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-light text-blue-50 mb-1 sm:mb-2 tracking-wide truncate">
                Curated for Today's Weather
              </h3>
              <p className="text-blue-100/80 text-xs sm:text-sm md:text-base font-light tracking-wide truncate">
                {weather.temperature}°C • {weather.description} • {weather.city}
              </p>
            </div>
          </div>
          <button className="text-blue-100 hover:bg-blue-400/10 p-2 sm:p-3 rounded-full transition-all duration-300 border border-blue-300/30 flex-shrink-0">
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {isExpanded && (
        <div className="relative bg-[#0a1628]/40 backdrop-blur-md border-t border-blue-400/20">
            <div className="p-4 sm:p-6 md:p-8 pt-4 sm:pt-5 md:pt-6">
              <div className="bg-blue-400/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border border-blue-300/30">
                <h4 className="text-blue-50 font-light text-base sm:text-lg md:text-xl mb-2 sm:mb-3 tracking-wide">
                  {weather.recommendation.title}
                </h4>
                <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed font-light">
                  {weather.recommendation.message}
                </p>
              </div>

              {/* Recommended Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {weather.recommendation.categories.map((category, index) => (
                  <div key={category.name}>
                    <Link href={`/shop?category=${category.value}`}>
                      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl cursor-pointer group border border-gray-200/50 hover:border-gray-300 hover:scale-105 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">
                          {category.icon}
                        </div>
                        <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base tracking-wide relative z-10">
                          {category.name}
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600 font-light relative z-10">
                          {category.description}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Additional Weather Info */}
              <div className="mt-4 sm:mt-5 md:mt-6 flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-blue-100/70 text-xs sm:text-sm font-light">
                {weather.humidity && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-400/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-300/20">
                    <span className="text-sm sm:text-base">💧</span>
                    <span>Humidity {weather.humidity}%</span>
                  </div>
                )}
                {weather.windSpeed && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-400/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-300/20">
                    <span className="text-sm sm:text-base">💨</span>
                    <span>Wind {weather.windSpeed} km/h</span>
                  </div>
                )}
                {weather.feelsLike && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-400/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-300/20">
                    <span className="text-sm sm:text-base">🌡️</span>
                    <span>Feels like {weather.feelsLike}°C</span>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fetchWeatherAndRecommendations()
                }}
                className="mt-4 sm:mt-5 md:mt-6 w-full bg-gradient-to-r from-blue-50 to-white text-[#0a1628] py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium tracking-wide hover:from-white hover:to-blue-50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 border border-blue-200 shadow-lg shadow-blue-900/20"
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update Weather
              </button>
            </div>
          </div>
        )}
    </div>
  )
}
