import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/useStore'

export default function TestAuth() {
  const { user, token, isAuthenticated } = useAuthStore()
  const [localToken, setLocalToken] = useState(null)

  useEffect(() => {
    setLocalToken(localStorage.getItem('token'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-3xl font-bold mb-6">🔍 Auth Debug Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h2 className="font-bold mb-2">Authentication Status:</h2>
            <p className={`text-lg ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-bold mb-2">User Data:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-bold mb-2">Token (from Zustand):</h2>
            <p className="text-xs break-all">{token || 'No token'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-bold mb-2">Token (from localStorage):</h2>
            <p className="text-xs break-all">{localToken || 'No token'}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded">
            <h2 className="font-bold mb-2">User Role:</h2>
            <p className="text-lg font-bold">
              {user?.role || 'No role'}
            </p>
            {user?.role === 'admin' ? (
              <p className="text-green-600 mt-2">✅ You are an admin!</p>
            ) : (
              <p className="text-red-600 mt-2">❌ You are not an admin</p>
            )}
          </div>

          <div className="flex gap-4">
            <a href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded">
              Go to Login
            </a>
            <a href="/admin/setup" className="px-4 py-2 bg-green-600 text-white rounded">
              Create Admin
            </a>
            <a href="/admin/dashboard" className="px-4 py-2 bg-black text-white rounded">
              Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
