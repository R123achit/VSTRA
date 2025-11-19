import dbConnect from '../../../lib/mongodb'
import Review from '../../../models/Review'
import Product from '../../../models/Product'
import Order from '../../../models/Order'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

  try {
    switch (method) {
      case 'POST':
        try {
          const decoded = verifyToken(req)
          if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' })
          }

          const { productId, rating, title, comment, images } = req.body

          if (!productId || !rating || !title || !comment) {
            return res.status(400).json({ message: 'Missing required fields' })
          }

          if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' })
          }

          const product = await Product.findById(productId)
          if (!product) {
            return res.status(404).json({ message: 'Product not found' })
          }

          // Check if user already reviewed this product
          const existingReview = await Review.findOne({
            product: productId,
            user: decoded.userId,
          })

          if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' })
          }

          // Check if user purchased this product
          const order = await Order.findOne({
            user: decoded.userId,
            'items.product': productId,
            status: 'delivered',
          })

          const review = await Review.create({
            product: productId,
            user: decoded.userId,
            rating,
            title,
            comment,
            images: images || [],
            verifiedPurchase: !!order,
          })

          // Update product rating
          const reviews = await Review.find({ product: productId })
          const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          product.rating = avgRating
          product.numReviews = reviews.length
          await product.save()

          await review.populate('user', 'name avatar')

          res.status(201).json({ review })
        } catch (error) {
          res.status(500).json({ message: 'Failed to create review', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
