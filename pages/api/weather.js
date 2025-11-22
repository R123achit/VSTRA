// Weather API endpoint
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    // Using OpenWeatherMap API (free tier)
    // You can also use WeatherAPI.com or any other weather service
    const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo' // Add your API key to .env.local
    
    // If no API key, return mock data for demo
    if (API_KEY === 'demo') {
      return res.status(200).json(getMockWeatherData(parseFloat(lat)))
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    
    const response = await fetch(weatherUrl)
    
    if (!response.ok) {
      throw new Error('Weather API request failed')
    }

    const data = await response.json()
    
    // Process weather data and generate recommendations
    const weatherData = processWeatherData(data)
    
    return res.status(200).json(weatherData)
  } catch (error) {
    console.error('Weather API error:', error)
    // Return mock data as fallback
    return res.status(200).json(getMockWeatherData(20))
  }
}

function processWeatherData(data) {
  const temp = data.main.temp
  const description = data.weather[0].description
  const humidity = data.main.humidity
  const windSpeed = data.wind.speed * 3.6 // Convert m/s to km/h
  const feelsLike = data.main.feels_like
  const city = data.name

  // Determine weather condition and recommendations
  let condition, recommendation

  if (temp < 15) {
    condition = 'cold'
    recommendation = {
      title: '🥶 It\'s Cold Outside!',
      message: 'Bundle up! We recommend warm layers, hoodies, and jackets to keep you cozy.',
      categories: [
        { name: 'Hoodies', value: 'men', icon: '🧥', description: 'Warm & comfortable' },
        { name: 'Jackets', value: 'women', icon: '🧥', description: 'Stay warm in style' },
        { name: 'Sweaters', value: 'new-arrivals', icon: '👔', description: 'Cozy essentials' }
      ]
    }
  } else if (description.includes('rain') || humidity > 80) {
    condition = 'rainy'
    recommendation = {
      title: '🌧️ Rainy Day Essentials',
      message: 'Don\'t let the rain stop you! Check out our waterproof jackets and rain-ready outfits.',
      categories: [
        { name: 'Rain Jackets', value: 'men', icon: '🧥', description: 'Waterproof protection' },
        { name: 'Windbreakers', value: 'women', icon: '🌬️', description: 'Light & protective' },
        { name: 'Accessories', value: 'accessories', icon: '☂️', description: 'Stay dry' }
      ]
    }
  } else if (temp > 30) {
    condition = 'hot'
    recommendation = {
      title: '☀️ Beat the Heat!',
      message: 'Stay cool and comfortable with our breathable cotton wear and summer essentials.',
      categories: [
        { name: 'Cotton Tees', value: 'men', icon: '👕', description: 'Breathable & light' },
        { name: 'Summer Dresses', value: 'women', icon: '👗', description: 'Cool & stylish' },
        { name: 'Linen Wear', value: 'new-arrivals', icon: '🌴', description: 'Perfect for summer' }
      ]
    }
  } else if (temp > 25) {
    condition = 'warm'
    recommendation = {
      title: '🌤️ Perfect Weather!',
      message: 'Great day for light, comfortable clothing. Check out our casual collection.',
      categories: [
        { name: 'Casual Wear', value: 'men', icon: '👔', description: 'Comfortable style' },
        { name: 'Light Tops', value: 'women', icon: '👚', description: 'Breezy & chic' },
        { name: 'New Arrivals', value: 'new-arrivals', icon: '✨', description: 'Latest trends' }
      ]
    }
  } else {
    condition = 'cloudy'
    recommendation = {
      title: '☁️ Mild & Pleasant',
      message: 'Perfect weather for layering! Explore our versatile collection.',
      categories: [
        { name: 'Light Jackets', value: 'men', icon: '🧥', description: 'Layer in style' },
        { name: 'Cardigans', value: 'women', icon: '🧶', description: 'Cozy layers' },
        { name: 'All Products', value: 'all', icon: '🛍️', description: 'Browse everything' }
      ]
    }
  }

  return {
    temperature: Math.round(temp),
    description: description.charAt(0).toUpperCase() + description.slice(1),
    humidity,
    windSpeed: Math.round(windSpeed),
    feelsLike: Math.round(feelsLike),
    city,
    condition,
    recommendation
  }
}

function getMockWeatherData(lat) {
  // Generate mock data based on latitude (rough approximation)
  let temp, description, condition, recommendation

  // Simulate different weather based on location
  if (lat > 40 || lat < -40) {
    // Cold regions
    temp = 8
    description = 'Cold and cloudy'
    condition = 'cold'
    recommendation = {
      title: '🥶 It\'s Cold Outside!',
      message: 'Bundle up! We recommend warm layers, hoodies, and jackets to keep you cozy.',
      categories: [
        { name: 'Hoodies', value: 'men', icon: '🧥', description: 'Warm & comfortable' },
        { name: 'Jackets', value: 'women', icon: '🧥', description: 'Stay warm in style' },
        { name: 'Sweaters', value: 'new-arrivals', icon: '👔', description: 'Cozy essentials' }
      ]
    }
  } else if (Math.abs(lat) < 10) {
    // Tropical regions
    temp = 32
    description = 'Hot and sunny'
    condition = 'hot'
    recommendation = {
      title: '☀️ Beat the Heat!',
      message: 'Stay cool and comfortable with our breathable cotton wear and summer essentials.',
      categories: [
        { name: 'Cotton Tees', value: 'men', icon: '👕', description: 'Breathable & light' },
        { name: 'Summer Dresses', value: 'women', icon: '👗', description: 'Cool & stylish' },
        { name: 'Linen Wear', value: 'new-arrivals', icon: '🌴', description: 'Perfect for summer' }
      ]
    }
  } else {
    // Temperate regions
    temp = 22
    description = 'Partly cloudy'
    condition = 'warm'
    recommendation = {
      title: '🌤️ Perfect Weather!',
      message: 'Great day for light, comfortable clothing. Check out our casual collection.',
      categories: [
        { name: 'Casual Wear', value: 'men', icon: '👔', description: 'Comfortable style' },
        { name: 'Light Tops', value: 'women', icon: '👚', description: 'Breezy & chic' },
        { name: 'New Arrivals', value: 'new-arrivals', icon: '✨', description: 'Latest trends' }
      ]
    }
  }

  return {
    temperature: temp,
    description,
    humidity: 65,
    windSpeed: 12,
    feelsLike: temp - 2,
    city: 'Your Location',
    condition,
    recommendation
  }
}
