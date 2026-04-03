import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import ProfileSidebar from '../components/ProfileSidebar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useAuthStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'

export default function Account() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { isAuthenticated, user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (user) {
      const nameParts = (user.name || '').split(' ')
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '+916307844745',
      })
    }
  }, [isAuthenticated, user, router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateUser({
        ...user,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
      })
      
      toast.success('Profile updated successfully!', {
        style: { background: '#1a1a1a', color: '#fff', fontSize: '13px', borderRadius: '0' },
      })
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <>
      <Head>
        <title>Profile - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <ActiveOffersBar />
      <Navbar />

      <main 
        className="pb-20 bg-white transition-all duration-300 min-h-screen" 
        style={{ paddingTop: offersBarVisible ? '10rem' : '7rem' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] text-gray-400 tracking-wide mb-10">
            <Link href="/"><span className="hover:text-black transition-colors cursor-pointer">Home</span></Link>
            <span className="text-gray-300">/</span>
            <span className="text-black font-medium">Profile</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            
            {/* Left Sidebar */}
            <ProfileSidebar activePage="profile" />

            {/* Main Content */}
            <div className="flex-1 lg:border-l border-gray-200 lg:pl-[4.5rem]">
              <h2 className="text-[15px] font-medium text-[#1a1a1a] mb-8">Profile Details</h2>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 mb-10">
                  <div>
                    <label className="block text-[13px] text-[#1a1a1a] font-medium mb-3">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-4 py-3 text-[14px] text-gray-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#1a1a1a] font-medium mb-3">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-4 py-3 text-[14px] text-gray-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#1a1a1a] font-medium mb-3">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-4 py-3 text-[14px] text-gray-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#1a1a1a] font-medium mb-3">Mobile Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-4 py-3 text-[14px] text-gray-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1a1a1a] text-white px-10 py-[11px] text-[13px] tracking-wide hover:bg-black transition-colors font-medium disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Edit'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
