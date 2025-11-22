import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TestOffers() {
  const [offers, setOffers] = useState([])
  const [allOffers, setAllOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      // Fetch active offers (public endpoint)
      const activeResponse = await axios.get('/api/offers/active')
      console.log('Active offers response:', activeResponse.data)
      setOffers(activeResponse.data.offers || [])

      // Try to fetch all offers (admin endpoint - might fail if not admin)
      try {
        const token = localStorage.getItem('token')
        const allResponse = await axios.get('/api/admin/offers', {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('All offers response:', allResponse.data)
        setAllOffers(allResponse.data.offers || [])
      } catch (adminError) {
        console.log('Could not fetch admin offers (not logged in as admin)')
      }

    } catch (err) {
      console.error('Error fetching offers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Offers Debug Page</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Offers (Public API)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Endpoint: /api/offers/active
        </p>
        {offers.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No active offers found
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer._id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">{offer.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Type:</strong> {offer.type}
                  </div>
                  <div>
                    <strong>Value:</strong> {offer.value}
                  </div>
                  <div>
                    <strong>Code:</strong> {offer.code || 'N/A'}
                  </div>
                  <div>
                    <strong>Active:</strong> {offer.isActive ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Start:</strong> {new Date(offer.startDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>End:</strong> {new Date(offer.endDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Priority:</strong> {offer.priority}
                  </div>
                  <div>
                    <strong>Usage:</strong> {offer.usedCount} / {offer.usageLimit || '∞'}
                  </div>
                </div>
                <div className="mt-4">
                  <strong>Description:</strong> {offer.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {allOffers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">All Offers (Admin API)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Endpoint: /api/admin/offers
          </p>
          <div className="space-y-4">
            {allOffers.map((offer) => (
              <div key={offer._id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">{offer.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Type:</strong> {offer.type}
                  </div>
                  <div>
                    <strong>Value:</strong> {offer.value}
                  </div>
                  <div>
                    <strong>Code:</strong> {offer.code || 'N/A'}
                  </div>
                  <div>
                    <strong>Active:</strong> {offer.isActive ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Start:</strong> {new Date(offer.startDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>End:</strong> {new Date(offer.endDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Current Time:</strong> {new Date().toLocaleString()}
                  </div>
                  <div>
                    <strong>Is Valid Now:</strong> {
                      new Date(offer.startDate) <= new Date() && 
                      new Date(offer.endDate) >= new Date() 
                        ? 'Yes' 
                        : 'No'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <h3 className="font-bold mb-2">Debugging Tips:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check if offer isActive is true</li>
          <li>Check if current time is between startDate and endDate</li>
          <li>Check if usageLimit is not exceeded</li>
          <li>Check browser console for API responses</li>
          <li>Verify MongoDB connection</li>
        </ul>
      </div>
    </div>
  )
}
