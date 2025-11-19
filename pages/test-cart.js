import { useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { useCartStore } from '../store/useStore'
import toast, { Toaster } from 'react-hot-toast'

export default function TestCart() {
  const { items, addToCart, removeFromCart, getCartCount, getCartTotal, clearCart } = useCartStore()
  const [testProduct] = useState({
    _id: 'test-123',
    name: 'Test Product',
    price: 99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    size: 'M',
    color: 'Black',
  })

  const handleAddToCart = () => {
    addToCart(testProduct)
    toast.success('Item added to cart!')
  }

  return (
    <>
      <Head>
        <title>Test Cart - VSTRA</title>
      </Head>
      <Toaster position="top-center" />
      <Navbar />

      <main className="pt-32 pb-20 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Cart Test Page</h1>

          <div className="bg-white p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Cart Status</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-100 rounded text-center">
                <p className="text-3xl font-bold">{getCartCount()}</p>
                <p className="text-sm text-gray-600">Items in Cart</p>
              </div>
              <div className="p-4 bg-gray-100 rounded text-center">
                <p className="text-3xl font-bold">${getCartTotal().toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Price</p>
              </div>
              <div className="p-4 bg-gray-100 rounded text-center">
                <p className="text-3xl font-bold">{items.length}</p>
                <p className="text-sm text-gray-600">Unique Items</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-900"
              >
                Add Test Product to Cart
              </button>
              <button
                onClick={clearCart}
                className="w-full border-2 border-red-600 text-red-600 py-3 font-semibold hover:bg-red-600 hover:text-white"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Cart Items</h2>
            {items.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${item.price}</p>
                      <button
                        onClick={() => removeFromCart(item._id, item.size, item.color)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded">
            <h3 className="font-bold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Add Test Product to Cart" button</li>
              <li>Check the navbar - you should see a red badge with the count</li>
              <li>The cart count should increase each time you click</li>
              <li>Click the cart icon in navbar to view full cart</li>
              <li>Use "Clear Cart" to reset</li>
            </ol>
          </div>
        </div>
      </main>
    </>
  )
}
