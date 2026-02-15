// Simple test script to check if Gemini API is working
const https = require('https')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  
  for (const line of lines) {
    if (line.startsWith('GEMINI_API_KEY=')) {
      return line.split('=')[1].trim()
    }
  }
  return null
}

async function testWithDirectAPI(apiKey) {
  console.log('\n🔧 Testing with direct REST API...\n')
  
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ]
  
  for (const model of models) {
    console.log(`  Testing: ${model}`)
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: 'Say "Hello, VSTRA!" in a friendly way.'
        }]
      }]
    })
    
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
        }, (res) => {
          let body = ''
          res.on('data', chunk => body += chunk)
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(body))
            } else {
              reject(new Error(`${res.statusCode}: ${body}`))
            }
          })
        })
        
        req.on('error', reject)
        req.write(data)
        req.end()
      })
      
      const text = response.candidates[0].content.parts[0].text
      console.log('  ✅ SUCCESS!')
      console.log('  📝 Response:', text)
      console.log('\n✨ Gemini API is working correctly with model:', model)
      console.log('\n💡 Update your code to use v1 API instead of v1beta')
      return true
    } catch (err) {
      console.log(`  ❌ Failed:`, err.message.split('\n')[0])
    }
  }
  
  return false
}

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API...\n')
  
  const apiKey = loadEnv()
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...')
  
  const success = await testWithDirectAPI(apiKey)
  
  if (!success) {
    console.log('\n❌ All tests failed.')
    console.log('\n💡 Possible issues:')
    console.log('1. API key not enabled for Gemini API')
    console.log('2. Need to enable Gemini API in Google Cloud Console')
    console.log('3. Regional restrictions')
    console.log('4. API quota exceeded')
    console.log('\n📝 Steps to fix:')
    console.log('1. Go to: https://aistudio.google.com/')
    console.log('2. Try the API in the playground first')
    console.log('3. Make sure it works there before using in code')
    console.log('4. Check API quotas and limits')
  }
}

testGeminiAPI()
