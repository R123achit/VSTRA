import '../styles/globals.css'
import AbandonedCartPopup from '../components/AbandonedCartPopup'
import ProgressBar from '../components/ProgressBar'
import { useEffect } from 'react'
import { useCartStore, useAuthStore } from '../store/useStore'

function MyApp({ Component, pageProps }) {
  const cart = useCartStore((state) => state.items)
  const user = useAuthStore((state) => state.user)

  // Track cart changes for abandoned cart
  useEffect(() => {
    console.log('🔍 Cart tracking check:', {
      hasCart: !!cart,
      cartLength: cart?.length || 0,
      userEmail: user?.email || 'none'
    })

    if (cart && cart.length > 0) {
      console.log('📦 Cart has items, will track in 2 seconds...')
      
      // Track cart after user adds items
      const trackCart = async () => {
        try {
          const sessionId = sessionStorage.getItem('sessionId') || 
            `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          sessionStorage.setItem('sessionId', sessionId)

          // Get email from user or use guest email
          let email = user?.email
          
          // If no user email, check if we have a saved guest email
          if (!email) {
            email = sessionStorage.getItem('guestEmail')
          }
          
          // If still no email, use a placeholder (will be updated when user provides email)
          if (!email) {
            email = `guest_${sessionId}@temp.vstra.com`
          }

          console.log('📤 Tracking cart:', {
            sessionId,
            email,
            itemCount: cart.length
          })

          const response = await fetch('/api/abandoned-cart/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              email,
              cartItems: cart,
              userId: user?._id || null
            })
          })

          const data = await response.json()
          
          if (data.success) {
            console.log('✅ Cart tracked successfully:', cart.length, 'items')
          } else {
            console.error('❌ Cart tracking failed:', data.message)
          }
        } catch (error) {
          console.error('❌ Error tracking cart:', error)
        }
      }

      // Debounce tracking
      const timer = setTimeout(trackCart, 2000)
      return () => clearTimeout(timer)
    } else {
      console.log('ℹ️ No cart items to track')
    }
  }, [cart, user])

  // Mark cart as recovered when user completes purchase
  useEffect(() => {
    const handleOrderComplete = () => {
      const sessionId = sessionStorage.getItem('sessionId')
      if (sessionId) {
        fetch('/api/abandoned-cart/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        }).catch(console.error)
      }
    }

    window.addEventListener('orderCompleted', handleOrderComplete)
    return () => window.removeEventListener('orderCompleted', handleOrderComplete)
  }, [])

  return (
    <>
      <ProgressBar />
      <Component {...pageProps} />
      <AbandonedCartPopup />
    </>
  )
}

export default MyApp

