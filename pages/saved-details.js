import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ActiveOffersBar from '../components/ActiveOffersBar'
import ProfileSidebar from '../components/ProfileSidebar'
import useOffersBarVisible from '../hooks/useOffersBarVisible'
import { useAuthStore } from '../store/useStore'

export default function SavedDetails() {
  const router = useRouter()
  const offersBarVisible = useOffersBarVisible()
  const { isAuthenticated } = useAuthStore()
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    address1: '',
    address2: '',
    pinCode: '',
    city: '',
    state: '',
    type: 'Other'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  // Load addresses safely on client side
  useEffect(() => {
    const saved = localStorage.getItem('vstra_saved_addresses')
    if (saved) {
      setAddresses(JSON.parse(saved))
    }
  }, [])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isAddressModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isAddressModalOpen])

  const openModal = (addr = null) => {
    if (addr) {
      setFormData(addr)
      setEditingId(addr.id)
    } else {
      setFormData({
        firstName: '', lastName: '', mobile: '', address1: '', address2: '', pinCode: '', city: '', state: '', type: 'Other'
      })
      setEditingId(null)
    }
    setIsAddressModalOpen(true)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveAddress = () => {
    // Basic validation
    if (!formData.firstName || !formData.mobile || !formData.address1 || !formData.pinCode) {
      alert("Please fill in the required fields.")
      return
    }

    let updatedList
    if (editingId) {
      updatedList = addresses.map(a => a.id === editingId ? { ...formData, id: editingId } : a)
    } else {
      updatedList = [...addresses, { ...formData, id: Date.now().toString() }]
    }
    
    setAddresses(updatedList)
    localStorage.setItem('vstra_saved_addresses', JSON.stringify(updatedList))
    setIsAddressModalOpen(false)
  }

  const handleDeleteAddress = (id) => {
    const updatedList = addresses.filter(a => a.id !== id)
    setAddresses(updatedList)
    localStorage.setItem('vstra_saved_addresses', JSON.stringify(updatedList))
  }

  if (!isAuthenticated) return null

  return (
    <>
      <Head>
        <title>Saved Details - VSTRA</title>
      </Head>
      
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
            <Link href="/account"><span className="hover:text-black transition-colors cursor-pointer">Profile</span></Link>
            <span className="text-gray-300">/</span>
            <span className="text-black font-medium">Saved Details</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            
            {/* Left Sidebar */}
            <ProfileSidebar activePage="saved-details" />

            {/* Main Content */}
            <div className="flex-1 lg:border-l border-gray-100 lg:pl-[4.5rem]">
              
              {/* Tabs */}
              <div className="flex justify-center border-b border-gray-100 mb-12 mt-4 lg:mt-0">
                <div className="border-b-[1px] border-black px-16 py-3 mb-[-1px]">
                  <span className="text-[13px] text-[#1a1a1a] tracking-[0.02em] font-medium">Address</span>
                </div>
              </div>

              {/* Address List */}
              <div className="space-y-5 mb-8">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-gray-200 rounded-[5px] p-6 relative flex flex-col md:flex-row gap-4 md:gap-8 bg-white">
                    
                    {/* Left Icon Labels */}
                    <div className="flex flex-col gap-4 min-w-[130px] pt-1">
                      <div className="flex items-center gap-3 text-[14.5px] text-gray-600">
                        <svg className="w-[18px] h-[18px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span>Recipient:</span>
                      </div>
                      <div className="flex items-start gap-3 text-[14.5px] text-gray-600">
                        <svg className="w-[18px] h-[18px] text-gray-500 mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span>Address:</span>
                      </div>
                      <div className="mt-3">
                        <span className="bg-gray-200 text-gray-700 px-2 py-[3px] text-[11px] font-bold tracking-wider rounded-[2px] uppercase">
                          {addr.type}
                        </span>
                      </div>
                    </div>

                    {/* Right Info */}
                    <div className="flex flex-col gap-4 text-[14.5px] text-[#1a1a1a] flex-1 md:pr-16 pt-1">
                      <div className="font-semibold tracking-[0.02em]">
                        <span className="uppercase">{addr.firstName} {addr.lastName}</span> - <span className="underline underline-offset-[3px] leading-none">{addr.mobile}</span>
                      </div>
                      <div className="leading-[1.7] uppercase tracking-[0.01em] text-gray-800">
                        {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}, {addr.city}, {addr.state}, {addr.pinCode}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute top-6 right-6 flex items-center gap-4 text-gray-500">
                      <button onClick={() => openModal(addr)} aria-label="edit" className="hover:text-black transition-colors">
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteAddress(addr.id)} aria-label="delete" className="hover:text-red-500 transition-colors">
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Add Address Button */}
              <button 
                onClick={() => openModal()}
                className="w-full border border-gray-200 rounded-[3px] py-4 text-[13px] text-[#1a1a1a] font-medium hover:border-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-[6px]"
              >
                <svg className="w-[14px] h-[14px] text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add new address
              </button>

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Slide-out Address Drawer */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAddressModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100]" 
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-xl z-[101] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-[18px] text-[#1a1a1a] tracking-[0.01em] font-light">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button onClick={() => setIsAddressModalOpen(false)}>
                  <svg className="w-[22px] h-[22px] text-black hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-12">
                
                {/* Personal Details */}
                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-5 tracking-[0.02em]">Personal Details</h3>
                
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">First Name</label>
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="First Name" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">Last Name</label>
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Last Name" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">Mobile Number</label>
                    <input name="mobile" value={formData.mobile} onChange={handleInputChange} type="text" placeholder="Mobile Number" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>

                {/* Delivery Details */}
                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-5 tracking-[0.02em]">Delivery Details</h3>

                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">Address, Line 1</label>
                    <input name="address1" value={formData.address1} onChange={handleInputChange} type="text" placeholder="Address, Line 1" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">Address, Line 2</label>
                    <input name="address2" value={formData.address2} onChange={handleInputChange} type="text" placeholder="Address, Line 2" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">Pin Code</label>
                    <input name="pinCode" value={formData.pinCode} onChange={handleInputChange} type="text" placeholder="Pin Code" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">City</label>
                    <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="City" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] tracking-[0.03em] mb-[6px]">State</label>
                    <input name="state" value={formData.state} onChange={handleInputChange} type="text" placeholder="Andaman and Nicobar Islands" className="w-full border border-gray-300 px-4 py-[11px] text-[13px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>

                {/* Save As */}
                <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-5 tracking-wide">Save As</h3>
                <div className="flex gap-4 mb-8">
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex-1 py-3 border border-black text-center text-[15px] transition-colors ${
                        formData.type === type ? 'font-bold bg-black text-white' : 'font-normal hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={handleSaveAddress}
                  className="w-full bg-[#111111] text-white py-4 text-[16px] font-medium tracking-[0.05em] hover:bg-black transition-colors"
                >
                  SAVE
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
