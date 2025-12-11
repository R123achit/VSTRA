import connectDB from '../../../lib/mongodb'
import Wallet from '../../../models/Wallet'
import { authMiddleware } from '../../../lib/auth'

async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    // Get wallet balance and transactions
    try {
      let wallet = await Wallet.findOne({ userId: req.userId })
      
      // Create wallet if doesn't exist
      if (!wallet) {
        wallet = await Wallet.create({
          userId: req.userId,
          balance: 0,
          transactions: []
        })
      }

      res.status(200).json({
        success: true,
        wallet: {
          balance: wallet.balance,
          transactions: wallet.transactions.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          ).slice(0, 50) // Last 50 transactions
        }
      })
    } catch (error) {
      console.error('Get wallet error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else if (req.method === 'POST') {
    // Add money to wallet
    try {
      const { amount, paymentId } = req.body

      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid amount' 
        })
      }

      let wallet = await Wallet.findOne({ userId: req.userId })
      
      if (!wallet) {
        wallet = await Wallet.create({
          userId: req.userId,
          balance: 0,
          transactions: []
        })
      }

      await wallet.addMoney(
        amount,
        `Added money to wallet`,
        paymentId || `WALLET-${Date.now()}`
      )

      res.status(200).json({
        success: true,
        message: `₹${amount} added to your wallet successfully`,
        balance: wallet.balance
      })
    } catch (error) {
      console.error('Add money error:', error)
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to add money' 
      })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}

export default authMiddleware(handler)
