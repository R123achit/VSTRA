import connectDB from '../../../../lib/mongodb'
import Product from '../../../../models/Product'
import Seller from '../../../../models/Seller'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    // Get all products for this seller
    try {
      const { page = 1, limit = 20, search, category } = req.query
      
      const query = { sellerId: req.seller._id }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      }
      
      if (category) {
        query.category = category
      }

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const count = await Product.countDocuments(query)

      res.status(200).json({
        success: true,
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    } catch (error) {
      console.error('Get seller products error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else if (req.method === 'POST') {
    // Add new product
    try {
      const productData = {
        ...req.body,
        sellerId: req.seller._id,
      }

      const product = await Product.create(productData)

      // Update seller's total products count
      await Seller.findByIdAndUpdate(req.seller._id, {
        $inc: { totalProducts: 1 },
      })

      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        product,
      })
    } catch (error) {
      console.error('Add product error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withSellerAuth(handler)
