import dbConnect from '../../../lib/mongodb'
import Wishlist from '../../../models/Wishlist'
import Product from '../../../models/Product'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

  try {
    const decoded = verifyToken(req)
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    switch (method) {
      case 'GET':
        try {
          let wishlist = await Wishlist.findOne({ user: decoded.userId }).populate('items.product')
          
          if (!wishlist) {
            wishlist = await Wishlist.create({ user: decoded.userId, items: [] })
          }

          res.status(200).json({ wishlist })
        } catch (error) {
          res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message })
        }
        break

      case 'POST':
        try {
          const { productId } = req.body

          if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' })
          }

          const product = await Product.findById(productId)
          if (!product) {
            return res.status(404).json({ message: 'Product not found' })
          }

          let wishlist = await Wishlist.findOne({ user: decoded.userId })

          if (!wishlist) {
            wishlist = await Wishlist.create({
              user: decoded.userId,
              items: [{ product: productId }],
            })
          } else {
            const exists = wishlist.items.some(
              (item) => item.product.toString() === productId
            )

            if (exists) {
              return res.status(400).json({ message: 'Product already in wishlist' })
            }

            wishlist.items.push({ product: productId })
            await wishlist.save()
          }

          await wishlist.populate('items.product')
          res.status(201).json({ wishlist })
        } catch (error) {
          res.status(500).json({ message: 'Failed to add to wishlist', error: error.message })
        }
        break

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
