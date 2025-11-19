import connectDB from '../../lib/mongodb'
import Product from '../../models/Product'
import User from '../../models/User'

// Product templates for generation
const productTemplates = {
  men: {
    tshirts: [
      'Essential Crew Neck Tee', 'Premium V-Neck Tee', 'Classic Henley', 'Striped Tee',
      'Pocket Tee', 'Long Sleeve Tee', 'Graphic Tee', 'Performance Tee', 'Vintage Wash Tee',
      'Raglan Tee', 'Baseball Tee', 'Muscle Fit Tee', 'Oversized Tee', 'Slim Fit Tee'
    ],
    shirts: [
      'Oxford Shirt', 'Dress Shirt', 'Casual Shirt', 'Flannel Shirt', 'Denim Shirt',
      'Linen Shirt', 'Chambray Shirt', 'Button-Down Shirt', 'Camp Collar Shirt',
      'Western Shirt', 'Poplin Shirt', 'Twill Shirt', 'Corduroy Shirt'
    ],
    pants: [
      'Chinos', 'Dress Pants', 'Cargo Pants', 'Joggers', 'Khakis',
      'Corduroy Pants', 'Linen Pants', 'Work Pants', 'Track Pants'
    ],
    jeans: [
      'Slim Fit Jeans', 'Straight Leg Jeans', 'Skinny Jeans', 'Relaxed Fit Jeans',
      'Bootcut Jeans', 'Tapered Jeans', 'Distressed Jeans', 'Raw Denim'
    ],
    outerwear: [
      'Wool Coat', 'Peacoat', 'Trench Coat', 'Parka', 'Bomber Jacket',
      'Leather Jacket', 'Denim Jacket', 'Blazer', 'Sport Coat', 'Windbreaker',
      'Puffer Jacket', 'Field Jacket', 'Harrington Jacket', 'Coach Jacket'
    ],
    sweaters: [
      'Crew Neck Sweater', 'V-Neck Sweater', 'Cardigan', 'Turtleneck',
      'Quarter-Zip Sweater', 'Shawl Collar Sweater', 'Cable Knit Sweater'
    ]
  },
  women: {
    dresses: [
      'Midi Dress', 'Maxi Dress', 'Mini Dress', 'Wrap Dress', 'Shift Dress',
      'A-Line Dress', 'Bodycon Dress', 'Shirt Dress', 'Slip Dress', 'T-Shirt Dress',
      'Sweater Dress', 'Cocktail Dress', 'Evening Gown', 'Sun Dress'
    ],
    tops: [
      'Blouse', 'Tank Top', 'Camisole', 'Crop Top', 'Tunic', 'Peplum Top',
      'Off-Shoulder Top', 'Halter Top', 'Button-Up Blouse', 'Silk Top'
    ],
    bottoms: [
      'Skinny Jeans', 'Mom Jeans', 'Boyfriend Jeans', 'Wide Leg Pants',
      'Palazzo Pants', 'Culottes', 'Leggings', 'Pencil Skirt', 'A-Line Skirt',
      'Pleated Skirt', 'Mini Skirt', 'Midi Skirt', 'Maxi Skirt'
    ],
    outerwear: [
      'Trench Coat', 'Wool Coat', 'Blazer', 'Cardigan', 'Leather Jacket',
      'Denim Jacket', 'Bomber Jacket', 'Puffer Coat', 'Cape Coat'
    ]
  },
  accessories: {
    shoes: [
      'Sneakers', 'Loafers', 'Oxford Shoes', 'Derby Shoes', 'Chelsea Boots',
      'Ankle Boots', 'Knee-High Boots', 'Sandals', 'Slides', 'Mules',
      'Pumps', 'Flats', 'Espadrilles', 'Running Shoes', 'Training Shoes'
    ],
    bags: [
      'Tote Bag', 'Crossbody Bag', 'Shoulder Bag', 'Backpack', 'Messenger Bag',
      'Clutch', 'Satchel', 'Hobo Bag', 'Bucket Bag', 'Belt Bag'
    ],
    accessories: [
      'Watch', 'Sunglasses', 'Belt', 'Wallet', 'Scarf', 'Hat', 'Beanie',
      'Cap', 'Necklace', 'Bracelet', 'Earrings', 'Ring', 'Tie', 'Bow Tie'
    ]
  }
}

const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Khaki', hex: '#C3B091' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Light Blue', hex: '#ADD8E6' },
  { name: 'Green', hex: '#008000' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Tan', hex: '#D2B48C' }
]

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const images = {
  men: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80',
    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80'
  ],
  women: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    'https://images.unsplash.com/photo-1564257577-d18b7a3e5b0f?w=600&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80'
  ],
  accessories: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'
  ]
}

function generateProducts() {
  const products = []
  let productId = 1

  // Generate Men's Products (200 items)
  Object.entries(productTemplates.men).forEach(([subcategory, items]) => {
    items.forEach(itemName => {
      for (let i = 0; i < 3; i++) {
        const colorSet = colors.slice(i * 3, i * 3 + 3)
        const price = Math.floor(Math.random() * (400 - 79 + 1)) + 79
        const compareAtPrice = Math.random() > 0.7 ? Math.floor(price * 1.3) : null
        
        products.push({
          name: `${itemName} ${colorSet[0].name}`,
          description: `Premium ${itemName.toLowerCase()} crafted with attention to detail. Perfect for ${subcategory === 'outerwear' ? 'layering and style' : 'everyday wear'}. Made from high-quality materials for lasting comfort.`,
          price,
          compareAtPrice,
          category: 'men',
          subcategory,
          images: [images.men[Math.floor(Math.random() * images.men.length)]],
          sizes: sizes.slice(Math.floor(Math.random() * 2)),
          colors: colorSet,
          stock: Math.floor(Math.random() * (200 - 30 + 1)) + 30,
          featured: Math.random() > 0.9,
          rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
          numReviews: Math.floor(Math.random() * (200 - 20 + 1)) + 20,
        })
        productId++
        if (products.length >= 500) return
      }
    })
  })

  // Generate Women's Products (200 items)
  Object.entries(productTemplates.women).forEach(([subcategory, items]) => {
    items.forEach(itemName => {
      for (let i = 0; i < 3; i++) {
        const colorSet = colors.slice(i * 2, i * 2 + 2)
        const price = Math.floor(Math.random() * (450 - 89 + 1)) + 89
        const compareAtPrice = Math.random() > 0.7 ? Math.floor(price * 1.3) : null
        
        products.push({
          name: `${itemName} ${colorSet[0].name}`,
          description: `Elegant ${itemName.toLowerCase()} designed for the modern woman. Features premium fabric and flattering fit. Perfect for ${subcategory === 'dresses' ? 'special occasions' : 'versatile styling'}.`,
          price,
          compareAtPrice,
          category: 'women',
          subcategory,
          images: [images.women[Math.floor(Math.random() * images.women.length)]],
          sizes: ['XS', 'S', 'M', 'L', 'XL'].slice(Math.floor(Math.random() * 2)),
          colors: colorSet,
          stock: Math.floor(Math.random() * (180 - 25 + 1)) + 25,
          featured: Math.random() > 0.9,
          rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
          numReviews: Math.floor(Math.random() * (220 - 15 + 1)) + 15,
        })
        productId++
        if (products.length >= 500) return
      }
    })
  })

  // Generate Accessories (100 items)
  Object.entries(productTemplates.accessories).forEach(([subcategory, items]) => {
    items.forEach(itemName => {
      for (let i = 0; i < 2; i++) {
        const colorSet = colors.slice(i * 2, i * 2 + 2)
        const price = Math.floor(Math.random() * (500 - 99 + 1)) + 99
        const compareAtPrice = Math.random() > 0.7 ? Math.floor(price * 1.25) : null
        
        products.push({
          name: `${itemName} ${colorSet[0].name}`,
          description: `Premium ${itemName.toLowerCase()} that completes your look. Crafted with quality materials and attention to detail. ${subcategory === 'shoes' ? 'Comfortable all-day wear' : 'Versatile and stylish'}.`,
          price,
          compareAtPrice,
          category: 'accessories',
          subcategory,
          images: [images.accessories[Math.floor(Math.random() * images.accessories.length)]],
          sizes: subcategory === 'shoes' ? ['S', 'M', 'L'] : ['M'],
          colors: colorSet,
          stock: Math.floor(Math.random() * (150 - 20 + 1)) + 20,
          featured: Math.random() > 0.85,
          rating: parseFloat((Math.random() * (5 - 4.2) + 4.2).toFixed(1)),
          numReviews: Math.floor(Math.random() * (180 - 25 + 1)) + 25,
        })
        productId++
        if (products.length >= 500) return
      }
    })
  })

  return products.slice(0, 500)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    await connectDB()

    console.log('Generating 500 products...')
    const products = generateProducts()

    console.log('Clearing existing products...')
    await Product.deleteMany({})
    
    console.log('Inserting products...')
    const insertedProducts = await Product.insertMany(products)

    // Create admin user if doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vstra.com'
    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
      })
    }

    const categoryCount = {
      men: insertedProducts.filter(p => p.category === 'men').length,
      women: insertedProducts.filter(p => p.category === 'women').length,
      accessories: insertedProducts.filter(p => p.category === 'accessories').length,
    }

    res.status(200).json({
      success: true,
      message: `Successfully seeded ${insertedProducts.length} products!`,
      data: {
        total: insertedProducts.length,
        categories: categoryCount,
        featured: insertedProducts.filter(p => p.featured).length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
