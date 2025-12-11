import connectDB from '../../../../lib/mongodb'
import Product from '../../../../models/Product'
import Seller from '../../../../models/Seller'
import { withSellerAuth } from '../../../../middleware/sellerAuth'

async function handler(req, res) {
  await connectDB()

  const { id } = req.query

  // Verify product belongs to this seller
  const product = await Product.findOne({ _id: id, sellerId: req.seller._id })

  if (!product) {
    return res.status(404).json({ message: 'Product not found or unauthorized' })
  }

  if (req.method === 'GET') {
    // Get single product
    res.status(200).json({ success: true, product })
  } else if (req.method === 'PUT') {
    // Update product
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { ...req.body, sellerId: req.seller._id },
        { new: true, runValidators: true }
      )

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct,
      })
    } catch (error) {
      console.error('Update product error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else if (req.method === 'DELETE') {
    // Delete product
    try {
      await Product.findByIdAndDelete(id)

      // Update seller's total products count
      await Seller.findByIdAndUpdate(req.seller._id, {
        $inc: { totalProducts: -1 },
      })

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      })
    } catch (error) {
      console.error('Delete product error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withSellerAuth(handler)
