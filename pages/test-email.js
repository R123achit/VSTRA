import { useState } from 'react'
import Head from 'next/head'
import axios from 'axios'

export default function TestEmail() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleTest = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post('/api/test-email', { email })
      setResult({
        success: true,
        message: response.data.message,
        details: response.data
      })
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send test email',
        details: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Test Email Configuration - VSTRA</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">📧 Test Email</h1>
          <p className="text-gray-600 mb-6">
            Test your email configuration by sending a test email
          </p>

          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {result.success ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold mb-2 ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.details && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Setup Checklist:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Enable 2-Step Verification in Gmail</li>
              <li>✓ Generate App Password</li>
              <li>✓ Update EMAIL_USER in .env.local</li>
              <li>✓ Update EMAIL_PASSWORD in .env.local</li>
              <li>✓ Restart development server</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-black"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
