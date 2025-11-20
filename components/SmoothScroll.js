import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

export default function SmoothScroll({ children }) {
  const scrollRef = useRef(null)
  const locomotiveScrollRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    let scroll = null

    const initScroll = async () => {
      try {
        const LocomotiveScroll = (await import('locomotive-scroll')).default

        scroll = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
          multiplier: 1,
          class: 'is-revealed',
          smartphone: {
            smooth: true,
          },
          tablet: {
            smooth: true,
          },
        })

        locomotiveScrollRef.current = scroll

        // Update scroll on route change
        scroll.update()
      } catch (error) {
        console.error('Locomotive Scroll error:', error)
      }
    }

    if (scrollRef.current) {
      initScroll()
    }

    // Cleanup
    return () => {
      if (scroll) {
        scroll.destroy()
      }
    }
  }, [])

  // Update scroll on route change
  useEffect(() => {
    if (locomotiveScrollRef.current) {
      locomotiveScrollRef.current.update()
    }
  }, [router.pathname])

  return (
    <div data-scroll-container ref={scrollRef}>
      {children}
    </div>
  )
}
