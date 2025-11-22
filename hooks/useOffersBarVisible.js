import { useState, useEffect } from 'react'

export default function useOffersBarVisible() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleOffersBarVisibility = (e) => {
      setIsVisible(e.detail.visible)
    }

    window.addEventListener('offersBarVisibility', handleOffersBarVisibility)
    
    return () => {
      window.removeEventListener('offersBarVisibility', handleOffersBarVisibility)
    }
  }, [])

  return isVisible
}
