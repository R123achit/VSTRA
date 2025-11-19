import { GoogleGenerativeAI } from '@google/generative-ai'
import dbConnect from '../../../lib/mongodb'
import Product from '../../../models/Product'

// Initialize with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    const { message, history = [] } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    // Get product context
    const products = await Product.find({ featured: true })
      .limit(20)
      .select('name description price category images')
      .lean()

    const categories = await Product.distinct('category')

    // Build context for AI
    const systemContext = `You are a sophisticated fashion and style assistant for VSTRA, a premium clothing ecommerce platform. 

BRAND IDENTITY:
- VSTRA is a luxury fashion brand with Apple-inspired minimalist design
- Focus on premium quality, modern elegance, and timeless style
- Black & white aesthetic with high contrast

YOUR ROLE:
- Provide personalized fashion recommendations
- Suggest trending styles and outfit combinations
- Help with color matching and styling advice
- Recommend products from our catalog
- Answer questions about fashion, sizing, and care
- Be friendly, knowledgeable, and enthusiastic

AVAILABLE CATEGORIES: ${categories.join(', ')}

FEATURED PRODUCTS:
${products.slice(0, 10).map(p => `- ${p.name} ($${p.price}) - ${p.description.substring(0, 100)}`).join('\n')}

GUIDELINES:
- Keep responses concise but informative (2-4 sentences)
- Use emojis sparingly for personality
- When recommending products, mention specific items from our catalog
- Focus on style advice, trends, and fashion tips
- Be conversational and engaging
- If asked about specific products, reference our actual inventory

USER MESSAGE: ${message}`

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Fallback response when API key is not configured
      const fallbackResponses = {
        'trending': "Right now, oversized blazers, wide-leg trousers, and minimalist accessories are trending! 🔥 Earth tones and monochrome looks are dominating the fashion scene.",
        'recommend': "I'd love to help you find the perfect outfit! For a versatile wardrobe, consider a classic black blazer, well-fitted jeans, and a crisp white shirt. These pieces work for both casual and formal occasions! ✨",
        'color': "Great question! For color matching, try pairing neutrals (black, white, beige) with one bold accent color. Navy blue goes beautifully with burgundy, while olive green pairs perfectly with rust orange! 🎨",
        'gift': "For thoughtful gifts, consider timeless pieces like a quality leather wallet, a stylish scarf, or a classic watch. These items are both practical and elegant! 🎁",
        'default': "I'm your style assistant! I can help with fashion recommendations, trending styles, outfit combinations, and shopping advice. What would you like to know about? ✨"
      }
      
      const keywords = message.toLowerCase()
      let response = fallbackResponses.default
      
      if (keywords.includes('trend')) response = fallbackResponses.trending
      else if (keywords.includes('recommend') || keywords.includes('outfit')) response = fallbackResponses.recommend
      else if (keywords.includes('color')) response = fallbackResponses.color
      else if (keywords.includes('gift')) response = fallbackResponses.gift
      
      // Get some products to recommend
      let recommendedProducts = products.slice(0, 3)
      
      return res.status(200).json({
        response: response + "\n\n💡 Tip: Add your Gemini API key to .env.local for AI-powered responses!",
        products: recommendedProducts,
      })
    }

    // Try multiple model names in order of preference
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-pro'
    ]
    
    let text = ''
    let modelWorked = false
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(systemContext)
        const response = result.response
        text = response.text()
        modelWorked = true
        break
      } catch (err) {
        console.log(`Model ${modelName} failed, trying next...`)
        continue
      }
    }
    
    // If no model worked, use fallback
    if (!modelWorked) {
      const fallbackResponses = {
        'trending': "Right now, oversized blazers, wide-leg trousers, and minimalist accessories are trending! 🔥 Earth tones and monochrome looks are dominating the fashion scene.",
        'recommend': "I'd love to help you find the perfect outfit! For a versatile wardrobe, consider a classic black blazer, well-fitted jeans, and a crisp white shirt. These pieces work for both casual and formal occasions! ✨",
        'color': "Great question! For color matching, try pairing neutrals (black, white, beige) with one bold accent color. Navy blue goes beautifully with burgundy, while olive green pairs perfectly with rust orange! 🎨",
        'gift': "For thoughtful gifts, consider timeless pieces like a quality leather wallet, a stylish scarf, or a classic watch. These items are both practical and elegant! 🎁",
        'style': "For a polished look, focus on fit and quality over quantity. Invest in versatile basics that can be mixed and matched. A well-fitted blazer, quality denim, and classic shoes are wardrobe essentials! 👔",
        'default': "I'm here to help with your style questions! Whether it's outfit recommendations, color matching, or fashion trends, I've got you covered. What would you like to know? ✨"
      }
      
      const keywords = message.toLowerCase()
      text = fallbackResponses.default
      
      if (keywords.includes('trend')) text = fallbackResponses.trending
      else if (keywords.includes('recommend') || keywords.includes('outfit')) text = fallbackResponses.recommend
      else if (keywords.includes('color')) text = fallbackResponses.color
      else if (keywords.includes('gift')) text = fallbackResponses.gift
      else if (keywords.includes('style') || keywords.includes('how')) text = fallbackResponses.style
    }

    // Extract product recommendations based on context
    let recommendedProducts = []
    
    // Smart product matching
    const keywords = message.toLowerCase()
    if (keywords.includes('recommend') || keywords.includes('show') || keywords.includes('find') || keywords.includes('looking for')) {
      // Match by category
      if (keywords.includes('men') || keywords.includes('male')) {
        recommendedProducts = products.filter(p => p.category === 'men').slice(0, 3)
      } else if (keywords.includes('women') || keywords.includes('female') || keywords.includes('ladies')) {
        recommendedProducts = products.filter(p => p.category === 'women').slice(0, 3)
      } else if (keywords.includes('accessories') || keywords.includes('accessory')) {
        recommendedProducts = products.filter(p => p.category === 'accessories').slice(0, 3)
      } else if (keywords.includes('new') || keywords.includes('latest') || keywords.includes('trending')) {
        recommendedProducts = products.filter(p => p.category === 'new-arrivals').slice(0, 3)
      } else {
        // General recommendations
        recommendedProducts = products.slice(0, 3)
      }
    }

    // Match by specific items mentioned in response
    const responseWords = text.toLowerCase()
    if (responseWords.includes('shirt') || responseWords.includes('top')) {
      const shirts = products.filter(p => 
        p.name.toLowerCase().includes('shirt') || 
        p.name.toLowerCase().includes('top')
      )
      if (shirts.length > 0) recommendedProducts = shirts.slice(0, 3)
    }

    res.status(200).json({
      response: text,
      products: recommendedProducts,
    })
  } catch (error) {
    console.error('AI Chat Error:', error)
    res.status(500).json({
      message: 'Failed to process request',
      error: error.message,
    })
  }
}
