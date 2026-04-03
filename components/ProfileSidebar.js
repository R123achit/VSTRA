import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../store/useStore'

export default function ProfileSidebar({ activePage = 'profile' }) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getLinkClass = (pageName) => {
    const isActive = activePage === pageName
    return `flex items-center gap-4 text-[14px] px-6 py-3.5 transition-colors cursor-pointer ${
      isActive 
        ? 'border-l-[4px] border-black bg-[#fafafa] font-semibold text-black' 
        : 'border-l-[4px] border-transparent text-[#1a1a1a] hover:bg-gray-50 hover:text-black font-normal'
    }`
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'User'

  return (
    <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col pt-2 pb-10">
      
      {/* Profile Header */}
      {activePage === 'profile' && (
        <div className="flex items-center gap-5 mb-10 px-6">
          <div className="w-[85px] h-[85px] bg-[#e0e0e0] rounded-full flex items-center justify-center overflow-hidden">
            <svg className="w-12 h-12 text-[#1a1a1a] mt-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-1">
              Hello {firstName}!
            </h3>
            <Link href="/account">
              <span className="text-[13px] text-gray-500 underline underline-offset-[4px] hover:text-black transition-colors cursor-pointer">
                View Details
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Menu Block */}
      <div className="flex flex-col mb-6">
        <Link href="/orders">
          <div className={getLinkClass('orders')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            My Orders
          </div>
        </Link>
        <Link href="/wishlist">
          <div className={getLinkClass('wishlist')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            My Wishlist
          </div>
        </Link>
        <Link href="/saved-details">
          <div className={getLinkClass('saved-details')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Saved Details
          </div>
        </Link>
        <div className={getLinkClass('weststyleclub')}>
          <span className="font-serif italic text-lg w-[20px] text-center leading-none">W</span>
          WestStyleClub
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-6 mb-6" />

      {/* Middle Menu Block */}
      <div className="flex flex-col mb-6">
        <Link href="/store-locator">
          <div className={getLinkClass('store-locator')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Store Locator
          </div>
        </Link>
        <Link href="/contact">
          <div className={getLinkClass('contact')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact Us
          </div>
        </Link>
      </div>

      {/* Shipping Location Dropdown */}
      <div className="px-6 mb-8">
        <h4 className="text-[12px] text-gray-800 tracking-wide mb-3 uppercase">SHIPPING LOCATION</h4>
        <div className="relative">
          <select className="w-full appearance-none border border-black px-4 py-[10px] text-[14px] bg-white text-black rounded-sm cursor-pointer outline-none focus:ring-1 focus:ring-black">
            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-6 mb-4" />

      {/* Bottom Menu Block */}
      <div className="flex flex-col mb-8">
        <Link href="/about">
          <div className={getLinkClass('about')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            About Us
          </div>
        </Link>
        <Link href="/terms">
          <div className={getLinkClass('terms')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Terms of Use
          </div>
        </Link>
        <Link href="/privacy">
          <div className={getLinkClass('privacy')}>
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy Policy
          </div>
        </Link>
      </div>

      <div className="px-6 mb-12">
        <button 
          onClick={handleLogout}
          className="text-[14px] text-gray-500 font-semibold hover:text-black transition-colors uppercase tracking-wider"
        >
          Log Out
        </button>
      </div>

    </div>
  )
}
