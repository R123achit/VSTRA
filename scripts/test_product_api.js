// Test script to verify the product API returns all products
const http = require('http')

console.log('🧪 Testing Product API...\n')

// Test localhost API
const testAPI = (port = 3000) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/products?category=all',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          resolve(response)
        } catch (error) {
          reject(new Error('Failed to parse response: ' + error.message))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.end()
  })
}

// Run the test
console.log('📡 Sending request to http://localhost:3000/api/products?category=all')
console.log('⏳ Please make sure your dev server is running (npm run dev)\n')

testAPI()
  .then(response => {
    console.log('✅ API Response received!\n')
    console.log('📊 Results:')
    console.log(`   Success: ${response.success}`)
    console.log(`   Total Products: ${response.count}`)
    console.log(`   Products Returned: ${response.data?.length || 0}`)
    
    if (response.count > 0) {
      console.log('\n🔍 Sample Products:')
      response.data.slice(0, 5).forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name}`)
        console.log(`      Category: ${product.category}/${product.subcategory || 'N/A'}`)
        console.log(`      Price: ₹${product.price}`)
      })
    }
    
    if (response.count >= 500) {
      console.log('\n✅ SUCCESS! API is returning all 500+ products!')
    } else if (response.count > 0) {
      console.log(`\n⚠️  API returned ${response.count} products. Expected 500+`)
    } else {
      console.log('\n❌ No products returned!')
    }
  })
  .catch(error => {
    console.error('❌ Error testing API:', error.message)
    console.log('\n💡 Make sure:')
    console.log('   1. Your dev server is running (npm run dev)')
    console.log('   2. MongoDB is connected')
    console.log('   3. Products exist in your database')
  })
