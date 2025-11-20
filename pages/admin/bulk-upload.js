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
    
    if (lines.length < 2) {
      toast.error('CSV file is empty or invalid')
      return
    }
    
    const firstLine = lines[0].split(',').map(h => h.trim())
    
    // Check if first line is headers (contains text like "name", "description", etc.)
    const isHeader = firstLine[0].toLowerCase().includes('name') || 
                     firstLine[0].toLowerCase() === 'name' ||
                     firstLine.some(h => ['name', 'description', 'price', 'category'].includes(h.toLowerCase()))
    
    const startIndex = isHeader ? 1 : 0
    
    if (isHeader) {
      console.log('CSV Headers detected:', firstLine)
    } else {
      console.log('No headers detected, treating first line as data')
    }
    
    const parsedProducts = []
    const errors = []
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      if (values.length < 5) {
        errors.push(`Row ${i + 1}: Not enough columns (need at least 5)`)
        continue
      }

      // Parse and clean the data
      const name = values[0]?.trim() || ''
      const description = values[1]?.trim() || ''
      const priceStr = values[2]?.trim() || '0'
      const category = values[3]?.trim().toLowerCase() || 'men'
      const stockStr = values[4]?.trim() || '0'
      const imagesStr = values[5]?.trim() || ''
      const sizesStr = values[6]?.trim() || ''
      const featuredStr = values[7]?.trim().toLowerCase() || 'false'
      
      // Validate category
      const validCategories = ['men', 'women', 'new-arrivals', 'accessories']
      const finalCategory = validCategories.includes(category) ? category : 'men'
      
      // Parse images
      const imageArray = imagesStr ? imagesStr.split('|').map(img => img.trim()).filter(img => img) : []
      if (imageArray.length === 0) {
        imageArray.push('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80')
      }
      
      // Parse sizes - convert numbers to strings if needed
      let sizesArray = sizesStr ? sizesStr.split('|').map(s => s.trim()).filter(s => s) : []
      
      // If sizes are numbers (like shoe sizes), keep them as is, otherwise use standard sizes
      if (sizesArray.length === 0) {
        sizesArray = ['M', 'L', 'XL']
      }
      
      const product = {
        name: name,
        description: description,
        price: parseFloat(priceStr) || 0,
        category: finalCategory,
        stock: parseInt(stockStr) || 0,
        images: imageArray,
        sizes: sizesArray,
        featured: featuredStr === 'true',
      }

      // Validation
      if (!product.name) {
        errors.push(`Row ${i + 1}: Missing product name`)
        continue
      }
      
      if (!product.description) {
        errors.push(`Row ${i + 1}: Missing description`)
        continue
      }
      
      if (product.price <= 0) {
        errors.push(`Row ${i + 1}: Invalid price (${values[2]})`)
        continue
      }
      
      if (product.stock < 0) {
        errors.push(`Row ${i + 1}: Invalid stock (${values[4]})`)
        continue
      }

      parsedProducts.push(product)
    }

    console.log('Parsed products:', parsedProducts)
    console.log('Parse errors:', errors)

    setProducts(parsedProducts)
    
    if (parsedProducts.length > 0) {
      toast.success(`✅ Parsed ${parsedProducts.length} valid products from CSV`)
    }
    
    if (errors.length > 0) {
      toast.error(`⚠️ ${errors.length} rows had errors (check console)`)
      console.error('CSV Parse Errors:', errors)
    }
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

    const confirmUpload = window.confirm(`Are you sure you want to upload ${products.length} products to the database?`)
    if (!confirmUpload) return

    setLoading(true)
    let successCount = 0
    let errorCount = 0
    const errors = []

    console.log('Starting bulk upload of', products.length, 'products')

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      
      try {
        console.log(`\n=== Uploading product ${i + 1}/${products.length} ===`)
        console.log('Product data:', JSON.stringify(product, null, 2))
        
        const response = await axios.post('/api/products', product, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Response status:', response.status)
        console.log('Response data:', response.data)
        
        if (response.data.success) {
          successCount++
          console.log(`✅ Product ${i + 1} uploaded successfully:`, response.data.data._id)
        } else {
          errorCount++
          errors.push(`${product.name}: ${response.data.message}`)
          console.error(`❌ Product ${i + 1} failed:`, response.data.message)
        }
      } catch (error) {
        errorCount++
        const errorMsg = error.response?.data?.message || error.message
        errors.push(`${product.name}: ${errorMsg}`)
        console.error(`❌ Error uploading product ${i + 1}:`)
        console.error('Error response:', error.response?.data)
        console.error('Error message:', error.message)
      }
      
      // Update progress
      toast.loading(`Uploading... ${i + 1}/${products.length}`, { id: 'upload-progress' })
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    toast.dismiss('upload-progress')

    console.log('\n=== Upload Summary ===')
    console.log(`Total: ${products.length}`)
    console.log(`Success: ${successCount}`)
    console.log(`Failed: ${errorCount}`)
    
    if (errors.length > 0) {
      console.error('Errors:', errors)
    }

    if (successCount > 0) {
      toast.success(`✅ Successfully uploaded ${successCount} out of ${products.length} products!`, {
        duration: 5000
      })
    }
    
    if (errorCount > 0) {
      toast.error(`❌ Failed to upload ${errorCount} products. Check console for details.`, {
        duration: 5000
      })
    }

    setLoading(false)

    if (successCount > 0) {
      setTimeout(() => {
        router.push('/admin/products')
      }, 3000)
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
                        <td className="px-4 py-2">₹{product.price}</td>
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

