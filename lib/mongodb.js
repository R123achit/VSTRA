import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vstra-ecommerce'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // If already connected, return the connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully')
        return mongoose
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ Failed to establish MongoDB connection:', e.message)
    throw e
  }

  return cached.conn
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
  cached.conn = null
  cached.promise = null
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
  cached.conn = null
  cached.promise = null
})

export default connectDB
