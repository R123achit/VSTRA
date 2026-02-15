// Weather API endpoint - Uses Open-Meteo (free, no API key needed) for real weather data
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    // Fetch real weather from Open-Meteo (free, no API key required)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`

    // Fetch city/area name via reverse geocoding (Nominatim - free, no API key)
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&addressdetails=1`

    // Fetch both in parallel
    const [weatherRes, geoRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(geoUrl, {
        headers: { 'User-Agent': 'VSTRA-Ecommerce/1.0' }
      })
    ])

    if (!weatherRes.ok) {
      throw new Error('Weather API request failed')
    }

    const weatherData = await weatherRes.json()
    let cityName = 'Your Area'

    try {
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        const addr = geoData.address || {}
        // Build a meaningful location string: city/town/village, state
        const place = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || ''
        const state = addr.state || ''
        const country = addr.country || ''

        if (place && state) {
          cityName = `${place}, ${state}`
        } else if (place) {
          cityName = place
        } else if (state && country) {
          cityName = `${state}, ${country}`
        } else if (geoData.display_name) {
          // Fallback: use first two parts of display_name
          const parts = geoData.display_name.split(',').map(s => s.trim())
          cityName = parts.slice(0, 2).join(', ')
        }
      }
    } catch (geoErr) {
      console.error('Geocoding error:', geoErr)
    }

    const current = weatherData.current

    // Map Open-Meteo WMO weather codes to descriptions and conditions
    const weatherInfo = mapWeatherCode(current.weather_code)
    const temp = current.temperature_2m
    const humidity = current.relative_humidity_2m
    const windSpeed = Math.round(current.wind_speed_10m)
    const feelsLike = Math.round(current.apparent_temperature)

    // Determine clothing condition based on actual temperature & weather
    const condition = getCondition(temp, humidity, current.weather_code)
    const recommendation = getRecommendation(condition, temp)

    return res.status(200).json({
      temperature: Math.round(temp),
      description: weatherInfo.description,
      humidity,
      windSpeed,
      feelsLike,
      city: cityName,
      condition,
      recommendation
    })
  } catch (error) {
    console.error('Weather API error:', error)
    // Return a sensible fallback
    return res.status(200).json(getFallbackWeather())
  }
}

// Map WMO weather codes to human-readable descriptions
// Reference: https://open-meteo.com/en/docs
function mapWeatherCode(code) {
  const codeMap = {
    0: { description: 'Clear sky', icon: '☀️' },
    1: { description: 'Mainly clear', icon: '🌤️' },
    2: { description: 'Partly cloudy', icon: '⛅' },
    3: { description: 'Overcast', icon: '☁️' },
    45: { description: 'Foggy', icon: '🌫️' },
    48: { description: 'Depositing rime fog', icon: '🌫️' },
    51: { description: 'Light drizzle', icon: '🌦️' },
    53: { description: 'Moderate drizzle', icon: '🌦️' },
    55: { description: 'Dense drizzle', icon: '🌧️' },
    56: { description: 'Light freezing drizzle', icon: '🌧️' },
    57: { description: 'Dense freezing drizzle', icon: '🌧️' },
    61: { description: 'Slight rain', icon: '🌧️' },
    63: { description: 'Moderate rain', icon: '🌧️' },
    65: { description: 'Heavy rain', icon: '🌧️' },
    66: { description: 'Light freezing rain', icon: '🌧️' },
    67: { description: 'Heavy freezing rain', icon: '🌧️' },
    71: { description: 'Slight snowfall', icon: '🌨️' },
    73: { description: 'Moderate snowfall', icon: '🌨️' },
    75: { description: 'Heavy snowfall', icon: '❄️' },
    77: { description: 'Snow grains', icon: '❄️' },
    80: { description: 'Slight rain showers', icon: '🌦️' },
    81: { description: 'Moderate rain showers', icon: '🌧️' },
    82: { description: 'Violent rain showers', icon: '⛈️' },
    85: { description: 'Slight snow showers', icon: '🌨️' },
    86: { description: 'Heavy snow showers', icon: '🌨️' },
    95: { description: 'Thunderstorm', icon: '⛈️' },
    96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
  }
  return codeMap[code] || { description: 'Partly cloudy', icon: '⛅' }
}

// Determine condition from real data
function getCondition(temp, humidity, weatherCode) {
  // Rain/storm codes
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
    return 'rainy'
  }
  // Snow codes
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return 'cold'
  }
  if (temp < 15) return 'cold'
  if (temp > 30) return 'hot'
  if (temp > 25) return 'warm'
  return 'cloudy' // mild/pleasant
}

function getRecommendation(condition, temp) {
  const recommendations = {
    cold: {
      title: '🥶 It\'s Cold Outside!',
      message: `At ${Math.round(temp)}°C, you'll want warm layers. We recommend hoodies, jackets, and sweaters to keep you cozy.`,
      categories: [
        { name: 'Hoodies', value: 'men', icon: '🧥', description: 'Warm & comfortable' },
        { name: 'Jackets', value: 'women', icon: '🧥', description: 'Stay warm in style' },
        { name: 'Sweaters', value: 'new-arrivals', icon: '👔', description: 'Cozy essentials' }
      ]
    },
    rainy: {
      title: '🌧️ Rainy Day Essentials',
      message: 'Don\'t let the rain stop you! Check out our waterproof jackets and rain-ready outfits.',
      categories: [
        { name: 'Rain Jackets', value: 'men', icon: '🧥', description: 'Waterproof protection' },
        { name: 'Windbreakers', value: 'women', icon: '🌬️', description: 'Light & protective' },
        { name: 'Accessories', value: 'accessories', icon: '☂️', description: 'Stay dry' }
      ]
    },
    hot: {
      title: '☀️ Beat the Heat!',
      message: `It's ${Math.round(temp)}°C! Stay cool and comfortable with breathable cotton wear and summer essentials.`,
      categories: [
        { name: 'Cotton Tees', value: 'men', icon: '👕', description: 'Breathable & light' },
        { name: 'Summer Dresses', value: 'women', icon: '👗', description: 'Cool & stylish' },
        { name: 'Linen Wear', value: 'new-arrivals', icon: '🌴', description: 'Perfect for summer' }
      ]
    },
    warm: {
      title: '🌤️ Perfect Weather!',
      message: `A pleasant ${Math.round(temp)}°C — great day for light, comfortable clothing.`,
      categories: [
        { name: 'Casual Wear', value: 'men', icon: '👔', description: 'Comfortable style' },
        { name: 'Light Tops', value: 'women', icon: '👚', description: 'Breezy & chic' },
        { name: 'New Arrivals', value: 'new-arrivals', icon: '✨', description: 'Latest trends' }
      ]
    },
    cloudy: {
      title: '☁️ Mild & Pleasant',
      message: `${Math.round(temp)}°C with mild conditions — perfect weather for layering! Explore our versatile collection.`,
      categories: [
        { name: 'Light Jackets', value: 'men', icon: '🧥', description: 'Layer in style' },
        { name: 'Cardigans', value: 'women', icon: '🧶', description: 'Cozy layers' },
        { name: 'All Products', value: 'all', icon: '🛍️', description: 'Browse everything' }
      ]
    }
  }

  return recommendations[condition] || recommendations.cloudy
}

function getFallbackWeather() {
  return {
    temperature: 28,
    description: 'Weather data temporarily unavailable',
    humidity: 60,
    windSpeed: 10,
    feelsLike: 30,
    city: 'India',
    condition: 'warm',
    recommendation: {
      title: '🌤️ Shop Our Collection!',
      message: 'Explore our latest styles perfect for any weather.',
      categories: [
        { name: 'Casual Wear', value: 'men', icon: '👔', description: 'Comfortable style' },
        { name: 'Light Tops', value: 'women', icon: '👚', description: 'Breezy & chic' },
        { name: 'New Arrivals', value: 'new-arrivals', icon: '✨', description: 'Latest trends' }
      ]
    }
  }
}
