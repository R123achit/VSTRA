#!/usr/bin/env node

/**
 * Abandoned Cart Processor
 * 
 * This script should be run every hour via cron job:
 * 0 * * * * node scripts/processAbandonedCarts.js
 * 
 * Or use a service like Vercel Cron or AWS EventBridge
 */

const axios = require('axios')

const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

async function processAbandonedCarts() {
  console.log('🔔 Starting abandoned cart processor...')
  console.log(`Time: ${new Date().toISOString()}`)
  
  try {
    const response = await axios.post(`${API_URL}/api/abandoned-cart/process`)
    
    if (response.data.success) {
      const { result } = response.data
      console.log('\n✅ Processing completed:')
      console.log(`   Popups sent: ${result.popupsSent}`)
      console.log(`   Emails sent: ${result.emailsSent}`)
      console.log(`   Carts cleaned: ${result.cleaned}`)
    } else {
      console.error('❌ Processing failed:', response.data.message)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

processAbandonedCarts()
