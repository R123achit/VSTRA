import connectDB from '../../lib/mongodb'
import Product from '../../models/Product'
import User from '../../models/User'

const sampleProducts = [
  {
    name: 'Minimal Black Tee',
    description: 'Premium cotton t-shirt with a minimalist design. Perfect for everyday wear.',
    price: 89,
    category: 'men',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#000000' }],
    stock: 50,
    featured: true,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: 'Classic White Shirt',
    description: 'Elegant white shirt made from premium fabric. Ideal for formal occasions.',
    price: 129,
    category: 'men',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    stock: 40,
    featured: true,
    rating: 4.8,
    numReviews: 24,
  },
  {
    name: 'Premium Denim',
    description: 'High-quality denim jeans with a modern fit. Comfortable and durable.',
    price: 199,
    category: 'men',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Blue', hex: '#1E3A8A' }],
    stock: 35,
    featured: true,
    rating: 4.7,
    numReviews: 18,
  },
  {
    name: 'Luxury Coat',
    description: 'Sophisticated coat for cold weather. Made with premium materials.',
    price: 349,
    category: 'men',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80'],
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#000000' }],
    stock: 20,
    featured: true,
    rating: 4.9,
    numReviews: 31,
  },
  {
    name: 'Designer Sneakers',
    description: 'Modern sneakers with exceptional comfort. Perfect for casual wear.',
    price: 249,
    category: 'accessories',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'],
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    stock: 45,
    featured: true,
    rating: 4.6,
    numReviews: 22,
  },
  {
    name: 'Silk Dress',
    description: 'Elegant silk dress for special occasions. Luxurious and comfortable.',
    price: 299,
    category: 'women',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'],
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Black', hex: '#000000' }],
    stock: 25,
    featured: true,
    rating: 4.8,
    numReviews: 15,
  },
  {
    name: 'Summer Dress',
    description: 'Light and breezy summer dress. Perfect for warm weather.',
    price: 159,
    category: 'women',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'],
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    stock: 30,
    featured: false,
    rating: 4.4,
    numReviews: 9,
  },
  {
    name: 'Casual Blazer',
    description: 'Versatile blazer for business casual looks. Modern fit.',
    price: 279,
    category: 'men',
    images: ['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80'],
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Navy', hex: '#1E3A8A' }],
    stock: 28,
    featured: false,
    rating: 4.5,
    numReviews: 14,
  },
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    await connectDB()

    // Clear existing data
    await Product.deleteMany({})
    
    // Insert sample products
    const products = await Product.insertMany(sampleProducts)

    // Create admin user if doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vstra.com'
    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        products: products.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
