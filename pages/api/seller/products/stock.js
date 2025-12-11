import connectDB from '../../../../lib/mongodb'
import Product from '../../../../models/Product'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectDB()

  try {
    const { productId, stock } = req.body

    if (!productId || stock === undefined) {
      return res.status(400).json({ message: 'Product ID and stock are required' })
    }

    // Verify product belongs to this seller
    const product = await Product.findOne({ _id: productId, sellerId: req.seller._id })

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' })
    }

    product.stock = stock
    await product.save()

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      product,
    })
  } catch (error) {
    console.error('Update stock error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export default withSellerAuth(handler)
