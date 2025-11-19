# VSTRA Full-Stack Ecommerce - Complete Setup Guide

## 🚀 What's Been Built

A complete, production-ready full-stack ecommerce website with:

### Backend (MongoDB + Next.js API)
- ✅ MongoDB database integration
- ✅ User authentication (JWT)
- ✅ Product management API
- ✅ Order management system
- ✅ Cart functionality
- ✅ RESTful API endpoints

### Frontend (Next.js + React)
- ✅ Landing page with animations
- ✅ Shop page with filters
- ✅ Product detail pages
- ✅ Shopping cart
- ✅ Checkout flow
- ✅ User authentication (Login/Register)
- ✅ Order history
- ✅ Responsive design

---

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or cloud)

---

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env.local`

### 3. Configure Environment Variables

The `.env.local` file is already created. Update if needed:

```env
MONGODB_URI=mongodb://localhost:27017/vstra-ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this
ADMIN_EMAIL=admin@vstra.com
ADMIN_PASSWORD=admin123
```

### 4. Seed Database

```bash
# Start the dev server first
npm run dev

# Then in another terminal or browser, call the seed API:
curl -X POST http://localhost:3000/api/seed

# Or visit in browser:
# http://localhost:3000/api/seed
```

This will:
- Create 8 sample products
- Create admin user (admin@vstra.com / admin123)

### 5. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🎯 Features & Pages

### Public Pages
- **/** - Landing page with hero, categories, featured products
- **/shop** - Product listing with filters and sorting
- **/product/[id]** - Product detail page
- **/cart** - Shopping cart
- **/auth/login** - User login
- **/auth/register** - User registration

### Protected Pages (Require Login)
- **/checkout** - Checkout and place order
- **/orders** - View order history
- **/account** - User account (coming soon)

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
```

### Products
```
GET /api/products - Get all products (with filters)
GET /api/products/[id] - Get single product
POST /api/products - Create product (admin)
PUT /api/products/[id] - Update product (admin)
DELETE /api/products/[id] - Delete product (admin)
```

### Orders
```
GET /api/orders - Get user orders (protected)
POST /api/orders - Create new order (protected)
```

### Seed
```
POST /api/seed - Seed database with sample data
```

---

## 📊 Database Models

### User
- name, email, password (hashed)
- role (user/admin)
- addresses
- avatar

### Product
- name, description, price
- category, subcategory
- images, sizes, colors
- stock, featured
- rating, reviews

### Order
- user, orderItems
- shippingAddress
- paymentMethod, paymentResult
- prices (items, tax, shipping, total)
- status, isPaid, isDelivered

---

## 🧪 Testing the Application

### 1. Register/Login
```
1. Go to /auth/register
2. Create account
3. Or use demo: admin@vstra.com / admin123
```

### 2. Browse Products
```
1. Visit /shop
2. Filter by category
3. Sort by price/rating
4. Click product to view details
```

### 3. Add to Cart
```
1. Select size and color
2. Click "Add to Cart"
3. View cart icon (shows count)
4. Go to /cart
```

### 4. Checkout
```
1. Click "Proceed to Checkout"
2. Fill shipping information
3. Click "Place Order"
4. View order in /orders
```

---

## 🎨 State Management

Using **Zustand** for:
- Cart state (persisted to localStorage)
- Auth state (persisted to localStorage)

```javascript
// Cart Store
useCartStore - addToCart, removeFromCart, updateQuantity, clearCart

// Auth Store
useAuthStore - login, logout, updateUser
```

---

## 🔐 Authentication Flow

1. User registers/logs in
2. Server returns JWT token
3. Token stored in Zustand (localStorage)
4. Token sent in Authorization header for protected routes
5. Server verifies token and returns user data

---

## 📱 Responsive Design

- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: 1024px+ (3-4 columns)

---

## 🚀 Production Deployment

### 1. Build for Production
```bash
npm run build
npm start
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Environment Variables
Add all `.env.local` variables to Vercel dashboard

### 4. MongoDB Atlas
Use MongoDB Atlas for production database

---

## 🔧 Customization

### Add New Products
```javascript
// Use the seed API or create via:
POST /api/products
{
  "name": "Product Name",
  "description": "Description",
  "price": 99,
  "category": "men",
  "images": ["url"],
  "sizes": ["S", "M", "L"],
  "colors": [{ "name": "Black", "hex": "#000000" }],
  "stock": 50
}
```

### Modify Styles
- Edit `tailwind.config.js` for colors/fonts
- Edit `styles/globals.css` for global styles
- Components use Tailwind classes

### Add Payment Gateway
- Integrate Stripe/PayPal in `/pages/checkout.js`
- Update Order model with payment details

---

## 📦 Project Structure

```
vstra-ecommerce/
├── components/          # React components
│   ├── Navbar.js
│   ├── Hero.js
│   ├── Featured.js
│   └── ...
├── pages/              # Next.js pages
│   ├── index.js        # Landing page
│   ├── shop.js         # Shop page
│   ├── cart.js         # Cart page
│   ├── checkout.js     # Checkout page
│   ├── orders.js       # Orders page
│   ├── product/[id].js # Product detail
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   └── api/            # API routes
│       ├── auth/
│       ├── products/
│       ├── orders/
│       └── seed.js
├── models/             # MongoDB models
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── lib/                # Utilities
│   ├── mongodb.js      # DB connection
│   └── auth.js         # JWT helpers
├── store/              # Zustand stores
│   └── useStore.js
└── styles/             # Global styles
    └── globals.css
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: Make sure MongoDB is running (mongod)
```

### Products Not Loading
```
Solution: Run the seed API first
POST http://localhost:3000/api/seed
```

### Cart Not Persisting
```
Solution: Check browser localStorage
Clear cache and reload
```

### Authentication Issues
```
Solution: Check JWT_SECRET in .env.local
Clear localStorage and login again
```

---

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **3D**: Three.js, React Three Fiber
- **Backend**: Next.js API Routes
- **Database**: MongoDB, Mongoose
- **Auth**: JWT, bcryptjs
- **State**: Zustand
- **HTTP**: Axios
- **Notifications**: React Hot Toast

---

## ✅ Next Steps

1. ✅ Run `npm install`
2. ✅ Start MongoDB
3. ✅ Run `npm run dev`
4. ✅ Seed database (POST /api/seed)
5. ✅ Test the application
6. 🎉 Start customizing!

---

**VSTRA** — Full-Stack Ecommerce Platform
Built with ❤️ using Next.js, MongoDB, and modern web technologies
