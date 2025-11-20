import dbConnect from '../../../lib/mongodb'
import Order from '../../../models/Order'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  await dbConnect()

  // Verify authentication
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  let decoded
  try {
    decoded = verifyToken(token)
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  switch (method) {
    case 'GET':
      try {
        const order = await Order.findById(id).lean()
        
        if (!order) {
          return res.status(404).json({ message: 'Order not found' })
        }

        // Check if user owns this order or is admin
        if (order.user.toString() !== decoded.userId && decoded.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied' })
        }

        // Transform order to match frontend expectations
        const transformedOrder = {
          _id: order._id,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt || order.createdAt,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
          totalAmount: order.totalPrice,
          items: order.orderItems.map(item => ({
            _id: item._id,
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.shippingAddress, // Use same as shipping if no billing
          paymentMethod: order.paymentMethod,
          trackingNumber: order.trackingNumber,
          shippingCost: order.shippingPrice,
          tax: order.taxPrice
        }

        res.status(200).json(transformedOrder)
      } catch (error) {
        console.error('Error fetching order:', error)
        res.status(500).json({ message: 'Error fetching order' })
      }
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
