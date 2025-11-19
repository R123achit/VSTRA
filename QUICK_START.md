# 🚀 VSTRA - Quick Start Guide

## Step 1: Install Dependencies

Run the installation script:

```bash
# Windows
INSTALL.bat

# Or manually
npm install
```

This will install all required packages:
- Next.js, React
- MongoDB, Mongoose
- Authentication (JWT, bcryptjs)
- State Management (Zustand)
- UI Libraries (Framer Motion, GSAP, Three.js)
- HTTP Client (Axios)
- Notifications (React Hot Toast)

---

## Step 2: Setup MongoDB

### Option A: Local MongoDB (Recommended for Development)

**Windows:**
```bash
# Install using winget
winget install MongoDB.Server

# Or download from
https://www.mongodb.com/try/download/community

# Start MongoDB
mongod
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vstra
   ```

---

## Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## Step 4: Seed Database

**Important:** You must seed the database before using the app!

### Method 1: Browser
Visit: http://localhost:3000/api/seed

### Method 2: Command Line
```bash
curl -X POST http://localhost:3000/api/seed
```

### Method 3: Postman/Insomnia
```
POST http://localhost:3000/api/seed
```

This will create:
- ✅ 8 sample products
- ✅ Admin user (admin@vstra.com / admin123)

---

## Step 5: Test the Application

### 1. Browse Products
- Visit homepage: http://localhost:3000
- Click "Shop Now" or navigate to /shop
- Filter by category, sort by price

### 2. View Product Details
- Click any product
- Select size and color
- Add to cart

### 3. Shopping Cart
- Click cart icon in navbar
- Update quantities
- Remove items
- Proceed to checkout

### 4. Login/Register
- Click "Login" in navbar
- Use demo account:
  - Email: `admin@vstra.com`
  - Password: `admin123`
- Or register new account

### 5. Place Order
- Add items to cart
- Go to checkout
- Fill shipping information
- Place order
- View in "My Orders"

---

## 🎯 All Features

### Public Features
- ✅ Beautiful landing page with animations
- ✅ Product browsing with filters
- ✅ Product search and sorting
- ✅ Product detail pages
- ✅ Shopping cart (persisted)
- ✅ User registration
- ✅ User login

### Protected Features (Require Login)
- ✅ Checkout process
- ✅ Order placement
- ✅ Order history
- ✅ User profile

### Admin Features (Coming Soon)
- 📝 Product management
- 📝 Order management
- 📝 User management

---

## 📁 Important Files

```
.env.local              # Environment variables
package.json            # Dependencies
models/                 # Database models
pages/api/              # API endpoints
pages/shop.js           # Shop page
pages/cart.js           # Cart page
pages/checkout.js       # Checkout page
pages/orders.js         # Orders page
store/useStore.js       # State management
```

---

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/vstra-ecommerce

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this

# Admin Credentials
ADMIN_EMAIL=admin@vstra.com
ADMIN_PASSWORD=admin123
```

---

## 🐛 Common Issues

### Issue: "Module not found: Can't resolve 'react-hot-toast'"
**Solution:** Run `npm install`

### Issue: "MongoDB connection error"
**Solution:** 
1. Make sure MongoDB is running: `mongod`
2. Check MONGODB_URI in .env.local
3. For Atlas, check connection string and whitelist IP

### Issue: "No products showing"
**Solution:** Seed the database first (POST /api/seed)

### Issue: "Authentication not working"
**Solution:** 
1. Clear browser localStorage
2. Check JWT_SECRET in .env.local
3. Re-login

### Issue: "Cart not persisting"
**Solution:** 
1. Check browser localStorage
2. Clear cache and reload
3. Make sure Zustand is installed

---

## 📚 API Endpoints

### Authentication
```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
```

### Products
```
GET  /api/products       - Get all products
GET  /api/products/[id]  - Get single product
POST /api/products       - Create product
PUT  /api/products/[id]  - Update product
DELETE /api/products/[id] - Delete product
```

### Orders
```
GET  /api/orders         - Get user orders (protected)
POST /api/orders         - Create order (protected)
```

### Seed
```
POST /api/seed           - Seed database
```

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'vstra-black': '#0a0a0a',
  'vstra-gray': '#1a1a1a',
  'vstra-light': '#f5f5f5',
}
```

### Add Products
Use the API or MongoDB directly:
```javascript
POST /api/products
{
  "name": "New Product",
  "price": 99,
  "category": "men",
  "images": ["url"],
  "sizes": ["S", "M", "L"],
  "stock": 50
}
```

### Modify Styles
- Global styles: `styles/globals.css`
- Component styles: Tailwind classes in components

---

## 🚀 Production Deployment

### 1. Build
```bash
npm run build
npm start
```

### 2. Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### 3. Environment Variables
Add all .env.local variables to Vercel dashboard

### 4. Use MongoDB Atlas
Switch to cloud database for production

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB installed/configured
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Database seeded (POST /api/seed)
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can login/register
- [ ] Can place orders

---

## 🎉 You're Ready!

Your full-stack ecommerce website is now running!

**Homepage:** http://localhost:3000
**Shop:** http://localhost:3000/shop
**Login:** http://localhost:3000/auth/login

**Demo Account:**
- Email: admin@vstra.com
- Password: admin123

---

**Need Help?** Check FULLSTACK_SETUP.md for detailed documentation.

**VSTRA** — Premium Ecommerce Platform
