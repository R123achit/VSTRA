# 🚀 Multi-Seller System - Quick Start Guide

## ✅ What's Been Implemented

### 1. Database Models ✓
- `models/Seller.js` - Complete seller information
- `models/Commission.js` - Commission tracking & settlements
- `models/Product.js` - Updated with sellerId field
- `models/User.js` - Updated with seller role

### 2. Authentication APIs ✓
- `POST /api/seller/auth/register` - Seller registration
- `POST /api/seller/auth/login` - Seller login
- `middleware/sellerAuth.js` - Seller authentication middleware
- `middleware/adminAuth.js` - Admin authentication middleware

### 3. Seller Dashboard APIs ✓
**Product Management:**
- `GET /api/seller/products` - List all products
- `POST /api/seller/products` - Add new product
- `GET /api/seller/products/[id]` - Get product details
- `PUT /api/seller/products/[id]` - Update product
- `DELETE /api/seller/products/[id]` - Delete product
- `PUT /api/seller/products/stock` - Update stock

**Order Management:**
- `GET /api/seller/orders` - List orders
- `GET /api/seller/orders/[id]` - Order details
- `PUT /api/seller/orders/[id]` - Update order status

**Earnings & Analytics:**
- `GET /api/seller/earnings` - Earnings & commissions
- `GET /api/seller/analytics` - Performance analytics

### 4. Admin APIs ✓
**Seller Management:**
- `GET /api/admin/sellers` - List all sellers
- `GET /api/admin/sellers/[id]` - Seller details
- `PUT /api/admin/sellers/[id]` - Update seller
- `DELETE /api/admin/sellers/[id]` - Delete seller
- `POST /api/admin/sellers/approve` - Approve/reject seller
- `PUT /api/admin/sellers/commission` - Set commission rate
- `GET /api/admin/sellers/products` - View seller products

**Commission Management:**
- `GET /api/admin/commissions` - List all commissions
- `POST /api/admin/commissions/settle` - Settle payments

### 5. Utilities ✓
- `utils/commission.js` - Commission calculation functions
- Automatic commission calculation on order creation

### 6. Frontend Pages ✓
- `/seller-register` - Seller registration page
- `/seller-login` - Seller login page

---

## 🎯 Next Steps (What You Need to Build)

### 1. Seller Dashboard Pages

Create these pages in your `pages/seller/` directory:

#### `/seller/dashboard.js`
```jsx
- Overview stats (products, orders, earnings)
- Recent orders
- Quick actions
- Performance charts
```

#### `/seller/products.js`
```jsx
- Product list with search/filter
- Add product form/modal
- Edit/delete actions
- Stock management
- Bulk operations
```

#### `/seller/orders.js`
```jsx
- Order list with filters (status, date)
- Order details modal
- Status update buttons
- Tracking ID input
- Print invoice
```

#### `/seller/earnings.js`
```jsx
- Earnings summary cards
- Commission breakdown table
- Settlement history
- Pending payments
- Download reports
```

#### `/seller/analytics.js`
```jsx
- Sales charts
- Top products
- Order trends
- Performance metrics
```

### 2. Admin Panel Updates

Add to your existing admin panel:

#### `/admin/sellers.js`
```jsx
- Seller list with status filters
- Approve/reject buttons
- View seller details
- Block/unblock sellers
- Commission rate editor
```

#### `/admin/seller/[id].js`
```jsx
- Seller profile
- Products list
- Orders history
- Earnings summary
- Actions (approve, block, delete)
```

#### `/admin/commissions.js`
```jsx
- Commission list
- Platform earnings summary
- Pending settlements
- Settle payment button
- Export reports
```

### 3. Update Product Display

Modify your product pages to show:

```jsx
// In product card/detail page
{product.sellerId && (
  <div className="seller-info">
    <span>Sold by: {sellerName}</span>
    <span>Rating: {sellerRating} ⭐</span>
  </div>
)}
```

### 4. Update Navbar

Add seller links:

```jsx
<nav>
  <a href="/seller-login">Sell on VSTRA</a>
  <a href="/seller-register">Become a Seller</a>
</nav>
```

---

## 🧪 Testing the System

### Step 1: Register a Test Seller

```bash
# Use Postman or your frontend
POST http://localhost:3000/api/seller/auth/register

Body:
{
  "businessName": "Test Fashion Store",
  "email": "seller@test.com",
  "phone": "9876543210",
  "password": "password123",
  "gstNumber": "22AAAAA0000A1Z5",
  "panNumber": "ABCDE1234F",
  "bankDetails": {
    "accountHolderName": "Test Seller",
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank",
    "branch": "Main Branch"
  },
  "pickupAddress": {
    "addressLine1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  }
}
```

### Step 2: Approve Seller (Admin)

```bash
POST http://localhost:3000/api/admin/sellers/approve
Authorization: Bearer <admin_token>

Body:
{
  "sellerId": "<seller_id>",
  "approved": true
}
```

### Step 3: Seller Login

```bash
POST http://localhost:3000/api/seller/auth/login

Body:
{
  "email": "seller@test.com",
  "password": "password123"
}

# Save the returned token
```

### Step 4: Add Product (Seller)

```bash
POST http://localhost:3000/api/seller/products
Authorization: Bearer <seller_token>

Body:
{
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 499,
  "category": "men",
  "images": ["https://example.com/image.jpg"],
  "sizes": ["S", "M", "L", "XL"],
  "stock": 50
}
```

### Step 5: Place Order (Customer)

```bash
# Customer places order with seller's product
# Commission will be automatically calculated
```

### Step 6: Check Commission

```bash
GET http://localhost:3000/api/seller/earnings
Authorization: Bearer <seller_token>

# Or as admin
GET http://localhost:3000/api/admin/commissions
Authorization: Bearer <admin_token>
```

---

## 📊 Commission Flow Example

```
Customer Order: ₹1000
├── Platform Commission (10%): ₹100
└── Seller Earnings (90%): ₹900
    ├── Deductions (if any): ₹0
    └── Final Settlement: ₹900
```

---

## 🔧 Configuration

### Set Commission Rate

**Global (All Sellers):**
```bash
PUT /api/admin/sellers/commission
{
  "applyToAll": true,
  "commissionRate": 12
}
```

**Per Seller:**
```bash
PUT /api/admin/sellers/commission
{
  "sellerId": "<seller_id>",
  "commissionRate": 8
}
```

---

## 🎨 UI Components You'll Need

### 1. Seller Dashboard Layout
```jsx
<SellerLayout>
  <Sidebar>
    - Dashboard
    - Products
    - Orders
    - Earnings
    - Analytics
    - Settings
  </Sidebar>
  <MainContent>
    {children}
  </MainContent>
</SellerLayout>
```

### 2. Product Form Component
```jsx
<ProductForm>
  - Name, Description
  - Price, Compare Price
  - Category, Subcategory
  - Images (multiple upload)
  - Sizes, Colors
  - Stock
  - Submit/Cancel
</ProductForm>
```

### 3. Order Card Component
```jsx
<OrderCard>
  - Order number
  - Customer info
  - Products
  - Status badge
  - Action buttons
  - Tracking input
</OrderCard>
```

### 4. Earnings Card Component
```jsx
<EarningsCard>
  - Total sales
  - Commission deducted
  - Net earnings
  - Pending settlement
  - Paid amount
</EarningsCard>
```

---

## 🚨 Important Notes

### Security
- ✅ All seller APIs require authentication
- ✅ Sellers can only access their own data
- ✅ Admin has full control
- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens for authentication

### Commission Calculation
- ✅ Automatic on order creation
- ✅ Stored in Commission model
- ✅ Tracks all deductions
- ✅ Settlement status tracking

### Order Flow
1. Customer places order
2. Commission calculated automatically
3. Seller sees order in dashboard
4. Seller updates status
5. Admin settles payment
6. Seller receives money

---

## 📱 Mobile Responsive

Make sure all seller pages are mobile-friendly:
- Responsive tables (horizontal scroll or cards)
- Touch-friendly buttons
- Collapsible sidebar
- Mobile-optimized forms

---

## 🎯 Success Metrics

Track these KPIs:
- Number of active sellers
- Products uploaded per seller
- Orders per seller
- Platform commission earned
- Seller satisfaction (ratings)
- Customer satisfaction

---

## 🐛 Troubleshooting

### Seller Can't Login
- Check if seller is approved (status: 'approved')
- Verify email and password
- Check JWT_SECRET in .env

### Commission Not Calculated
- Verify product has sellerId
- Check order creation logs
- Ensure utils/commission.js is imported

### Products Not Showing
- Check if seller is approved
- Verify sellerId in product
- Check API authentication

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify API responses
4. Test with Postman
5. Review database records

---

## 🎉 You're Ready!

The backend is complete. Now build the frontend:
1. Create seller dashboard pages
2. Update admin panel
3. Add seller info to product pages
4. Test the complete flow
5. Deploy and scale!

**Happy Selling! 🚀**
