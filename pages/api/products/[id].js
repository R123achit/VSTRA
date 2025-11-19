import connectDB from '../../../lib/mongodb'
import Product from '../../../models/Product'

export default async function handler(req, res) {
  await connectDB()

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id)

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
      }

      res.status(200).json({ success: true, data: product })
    } catch (error) {
      console.error('Get product error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else if (req.method === 'PUT') {
    try {
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      })

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
      }

      res.status(200).json({ success: true, data: product })
    } catch (error) {
      console.error('Update product error:', error)
      res.status(400).json({ success: false, message: error.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      const product = await Product.findByIdAndDelete(id)

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
      }

      res.status(200).json({ success: true, data: {} })
    } catch (error) {
      console.error('Delete product error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
