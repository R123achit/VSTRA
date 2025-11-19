import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function BulkUpload() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [csvText, setCsvText] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, user])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      setCsvText(text)
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    const parsedProducts = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length < 5) continue // Skip invalid rows

      const product = {
        name: values[0] || '',
        description: values[1] || '',
        price: parseFloat(values[2]) || 0,
        category: values[3] || 'men',
        stock: parseInt(values[4]) || 0,
        images: values[5] ? values[5].split('|').map(img => img.trim()) : [],
        sizes: values[6] ? values[6].split('|').map(s => s.trim()) : ['M', 'L'],
        featured: values[7]?.toLowerCase() === 'true' || false,
      }

      if (product.name && product.price > 0) {
        parsedProducts.push(product)
      }
    }

    setProducts(parsedProducts)
    toast.success(`Parsed ${parsedProducts.length} products from CSV`)
  }

  const handleTextInput = () => {
    if (!csvText.trim()) {
      toast.error('Please enter CSV data')
      return
    }
    parseCSV(csvText)
  }

  const handleUpload = async () => {
    if (products.length === 0) {
      toast.error('No products to upload')
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const product of products) {
        try {
          await axios.post('/api/products', product)
          successCount++
        } catch (error) {
          errorCount++
          console.error('Error uploading product:', error)
        }
      }

      toast.success(`✅ Uploaded ${successCount} products successfully!`)
      if (errorCount > 0) {
        toast.error(`❌ Failed to upload ${errorCount} products`)
      }

      setTimeout(() => {
        router.push('/admin/products')
      }, 2000)
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,description,price,category,stock,images,sizes,featured
Premium T-Shirt,High quality cotton t-shirt,29.99,men,100,https://images.unsplash.com/photo-1.jpg,S|M|L|XL,false
Elegant Dress,Beautiful summer dress,79.99,women,50,https://images.unsplash.com/photo-2.jpg,XS|S|M|L,true
Classic Jeans,Comfortable denim jeans,59.99,men,75,https://images.unsplash.com/photo-3.jpg,28|30|32|34,false`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Template downloaded!')
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>Bulk Upload Products - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-black text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard">
                <h1 className="text-2xl font-bold cursor-pointer">VSTRA Admin</h1>
              </Link>
              <div className="flex gap-4">
                <Link href="/admin/products">
                  <button className="text-sm bg-gray-700 text-white px-4 py-2 hover:bg-gray-600">
                    View Products
                  </button>
                </Link>
                <Link href="/">
                  <button className="text-sm bg-white text-black px-4 py-2 hover:bg-gray-200">
                    View Site
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-4xl font-bold mb-8">📦 Bulk Upload Products</h2>

          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-3">📋 How to Use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Download the CSV template below</li>
              <li>Fill in your product data (Excel or Google Sheets)</li>
              <li>Save as CSV file</li>
              <li>Upload the CSV file or paste the content</li>
              <li>Review parsed products</li>
              <li>Click "Upload All Products"</li>
            </ol>
          </div>

          {/* Download Template */}
          <div className="bg-white shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">1️⃣ Download Template</h3>
            <button
              onClick={downloadTemplate}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-semibold"
            >
              📥 Download CSV Template
            </button>
            <p className="text-sm text-gray-600 mt-3">
              Template includes: name, description, price, category, stock, images, sizes, featured
            </p>
          </div>

          {/* Upload Methods */}
          <div className="bg-white shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">2️⃣ Upload Your Products</h3>
            
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Upload CSV File:</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <div className="text-center my-4 text-gray-500">OR</div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">Paste CSV Content:</label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="name,description,price,category,stock,images,sizes,featured
Premium T-Shirt,High quality cotton,29.99,men,100,https://image.jpg,S|M|L,false"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-black font-mono text-sm"
                rows="8"
              />
              <button
                onClick={handleTextInput}
                className="mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Parse CSV Text
              </button>
            </div>
          </div>

          {/* Preview */}
          {products.length > 0 && (
            <div className="bg-white shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">3️⃣ Preview Products ({products.length})</h3>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Stock</th>
                      <th className="px-4 py-2 text-left">Images</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2 font-semibold">{product.name}</td>
                        <td className="px-4 py-2">${product.price}</td>
                        <td className="px-4 py-2">{product.category}</td>
                        <td className="px-4 py-2">{product.stock}</td>
                        <td className="px-4 py-2">{product.images.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {products.length > 0 && (
            <div className="bg-white shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">4️⃣ Upload to Database</h3>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded font-semibold hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading {products.length} products...
                  </span>
                ) : (
                  `🚀 Upload All ${products.length} Products`
                )}
              </button>
            </div>
          )}

          {/* CSV Format Guide */}
          <div className="bg-gray-100 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-bold mb-3">📖 CSV Format Guide:</h3>
            <div className="text-sm space-y-2 font-mono bg-white p-4 rounded">
              <p><strong>name</strong> - Product name (required)</p>
              <p><strong>description</strong> - Product description (required)</p>
              <p><strong>price</strong> - Price in dollars (required, e.g., 29.99)</p>
              <p><strong>category</strong> - men, women, new-arrivals, accessories</p>
              <p><strong>stock</strong> - Number of items (required, e.g., 100)</p>
              <p><strong>images</strong> - Image URLs separated by | (e.g., url1.jpg|url2.jpg)</p>
              <p><strong>sizes</strong> - Sizes separated by | (e.g., S|M|L|XL)</p>
              <p><strong>featured</strong> - true or false</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
