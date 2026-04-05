import connectDB from '../../../lib/mongodb'
import Product from '../../../models/Product'

export default async function handler(req, res) {
  // Disable caching to always get fresh data
  // Updated: 2024-12-17 - Removed product limit to show all products
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
  
  await connectDB()

  if (req.method === 'GET') {
    try {
      const { category, subcategory, featured, search, sort, limit, page, sizes, colors, minPrice, maxPrice } = req.query

      let query = {}

      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') }
      }

      if (subcategory && subcategory !== 'all') {
        query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') }
      }

      if (featured === 'true') {
        query.featured = true
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      }

      if (sizes) {
        query.sizes = { $in: sizes.split(',') }
      }

      if (colors) {
        query['colors.name'] = { $in: colors.split(',') }
      }

      if (minPrice || maxPrice) {
        query.price = {}
        if (minPrice) query.price.$gte = Number(minPrice)
        if (maxPrice) query.price.$lte = Number(maxPrice)
      }

      let sortOption = {}
      if (sort === 'price-asc') sortOption = { price: 1 }
      else if (sort === 'price-desc') sortOption = { price: -1 }
      else if (sort === 'newest') sortOption = { createdAt: -1 }
      else if (sort === 'rating') sortOption = { rating: -1 }
      else sortOption = { createdAt: -1 }

      // Pagination
      const limitVal = limit ? parseInt(limit) : 20
      const pageVal = page ? parseInt(page) : 1
      const skipVal = (pageVal - 1) * limitVal

      const totalCount = await Product.countDocuments(query)
      const products = await Product.find(query)
        .sort(sortOption)
        .skip(skipVal)
        .limit(limitVal)

      res.status(200).json({
        success: true,
        count: products.length,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitVal),
        currentPage: pageVal,
        data: products,
      })
    } catch (error) {
      console.error('Get products error:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  } else if (req.method === 'POST') {
    try {
      console.log('\n=== POST /api/products ===')
      console.log('Request body:', JSON.stringify(req.body, null, 2))
      
      // Validate required fields
      const { name, description, price, category, images, stock } = req.body

      if (!name || !description || !price || !category || !images || stock === undefined) {
        console.error('Validation failed - missing fields')
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: name, description, price, category, images, stock' 
        })
      }

      // Check for duplicate product (same name and category)
      const existingProduct = await Product.findOne({ 
        name: name.trim(), 
        category: category 
      })
      
      if (existingProduct) {
        console.error('Duplicate product detected:', name, category)
        return res.status(409).json({
          success: false,
          message: `Product "${name}" already exists in ${category} category`,
          existingProductId: existingProduct._id
        })
      }

      // Ensure images is an array
      const imageArray = Array.isArray(images) ? images : [images]
      
      if (imageArray.length === 0 || !imageArray[0]) {
        console.error('No valid images provided')
        return res.status(400).json({
          success: false,
          message: 'At least one image URL is required'
        })
      }

      // Create product with validated data
      const productData = {
        ...req.body,
        images: imageArray,
        price: parseFloat(price),
        stock: parseInt(stock),
        compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : undefined,
        featured: req.body.featured || false,
        rating: 0,
        numReviews: 0,
      }

      console.log('Creating product with data:', JSON.stringify(productData, null, 2))

      const product = await Product.create(productData)
      
      console.log('✅ Product created successfully!')
      console.log('Product ID:', product._id)
      console.log('Product name:', product.name)
      
      res.status(201).json({ 
        success: true, 
        data: product,
        message: 'Product added successfully'
      })
    } catch (error) {
      console.error('Create product error:', error)
      
      // Handle duplicate key error from MongoDB
      if (error.code === 11000) {
        return res.status(409).json({ 
          success: false, 
          message: 'A product with this name already exists in this category',
        })
      }
      
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to create product',
        error: error.toString()
      })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}

