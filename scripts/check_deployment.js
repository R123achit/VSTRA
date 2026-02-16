// Check deployment status
const https = require('https')

const SITE_URL = 'https://vstra.vercel.app'

console.log('🔍 Checking deployment status...\n')

// Check if site is accessible
function checkSite() {
  return new Promise((resolve, reject) => {
    https.get(SITE_URL, (res) => {
      console.log('✅ Site is accessible')
      console.log(`   Status: ${res.statusCode}`)
      console.log(`   Headers:`)
      console.log(`   - Server: ${res.headers.server || 'N/A'}`)
      console.log(`   - X-Vercel-ID: ${res.headers['x-vercel-id'] || 'N/A'}`)
      console.log(`   - Cache-Control: ${res.headers['cache-control'] || 'N/A'}`)
      resolve(res.statusCode)
    }).on('error', (err) => {
      console.error('❌ Site not accessible:', err.message)
      reject(err)
    })
  })
}

// Check API endpoint
function checkAPI() {
  return new Promise((resolve, reject) => {
    https.get(`${SITE_URL}/api/products?category=all`, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          console.log('\n📊 API Response:')
          console.log(`   Success: ${response.success}`)
          console.log(`   Product Count: ${response.count || 0}`)
          console.log(`   Products Returned: ${response.data?.length || 0}`)
          
          if (response.count >= 500) {
            console.log('\n✅ SUCCESS! API is returning all 500+ products!')
          } else if (response.count > 0) {
            console.log(`\n⚠️  WARNING: Only ${response.count} products returned (expected 500+)`)
          } else {
            console.log('\n❌ ERROR: No products returned!')
          }
          
          resolve(response)
        } catch (error) {
          console.error('❌ Failed to parse API response:', error.message)
          reject(error)
        }
      })
    }).on('error', (err) => {
      console.error('❌ API not accessible:', err.message)
      reject(err)
    })
  })
}

// Run checks
async function runChecks() {
  try {
    await checkSite()
    await checkAPI()
    
    console.log('\n💡 Tips:')
    console.log('   1. Hard refresh your browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)')
    console.log('   2. Try opening in incognito/private mode')
    console.log('   3. Check Vercel dashboard for deployment status')
    console.log('   4. Wait 2-3 minutes for CDN cache to clear')
    
  } catch (error) {
    console.error('\n❌ Check failed:', error.message)
  }
}

runChecks()
