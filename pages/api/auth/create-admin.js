import connectDB from '../../../lib/mongodb'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { email, password, secretKey } = req.body

    // Simple security check
    if (secretKey !== 'create-vstra-admin-2024') {
      return res.status(403).json({ success: false, message: 'Invalid secret key' })
    }

    // Check if ANY admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin account already exists. Only one admin is allowed for security.',
        data: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      })
    }

    // Check if user with this email exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      // Update existing user to admin
      existingUser.role = 'admin'
      existingUser.name = 'Admin'
      await existingUser.save()
      return res.status(200).json({ 
        success: true, 
        message: 'User promoted to admin role',
        data: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      })
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const admin = await User.create({
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin'
    })

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    res.status(500).json({ success: false, message: 'Server error: ' + error.message })
  }
}

