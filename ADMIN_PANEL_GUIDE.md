# VSTRA Admin Panel - Complete Guide

## 🎯 Overview
The VSTRA admin panel is a comprehensive dashboard for managing your ecommerce store. It includes product management, order tracking, user management, and analytics.

## 🔐 Access Admin Panel

### Default Admin Credentials
- **Email**: admin@vstra.com
- **Password**: admin123

### Admin URL
```
http://localhost:3000/admin/dashboard
```

## 📊 Features

### 1. Dashboard (`/admin/dashboard`)
- **Real-time Statistics**
  - Total Products
  - Total Orders
  - Total Revenue
  - Total Users
- **Quick Actions**
  - Add Product
  - Manage Products
  - View Orders
  - Seed Products
  - Analytics
  - Manage Users

### 2. Product Management (`/admin/products`)
- **View All Products**
  - Search by name
  - Filter by category
  - View product details
- **Edit Products** (`/admin/edit-product/[id]`)
  - Update name, description, price
  - Change category and stock
  - Manage product images
  - Toggle featured status
- **Delete Products**
  - Single product deletion
  - Confirmation dialog
- **Add New Products** (`/admin/add-product`)
  - Complete product form
  - Multiple image support
  - Category selection

### 3. Order Management (`/admin/orders`)
- **View All Orders**
  - Customer information
  - Order date and items
  - Total price
- **Update Order Status**
  - Pending
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- **View Order Details**
  - Customer info
  - Shipping address
  - Order items breakdown

### 4. User Management (`/admin/users`)
- **View All Users**
  - Name and email
  - Registration date
  - Current role
- **Change User Roles**
  - Promote to Admin
  - Demote to User
- **Delete Users**
  - Remove user accounts
  - Cannot delete yourself

### 5. Analytics (`/admin/analytics`)
- **Recent Orders**
  - Last 5 orders
  - Customer names
  - Order totals
- **Low Stock Alert**
  - Products with < 10 items
  - Sorted by stock level
- **Top Rated Products**
  - Highest rated items
  - Review counts
  - Product images

### 6. Database Seeding
- **Seed 500 Products** (`/admin/seed-500`)
  - Adds 500 premium products
  - Various categories
  - Realistic data
- **Seed Premium** (`/admin/seed-premium`)
  - Curated premium collection
- **Basic Seed** (`/admin/seed`)
  - Essential products

## 🛠️ API Routes

### Admin Stats
```
GET /api/admin/stats
Authorization: Bearer {token}
```

### Manage Products
```
GET    /api/products
POST   /api/products
PUT    /api/products/[id]
DELETE /api/products/[id]
```

### Manage Orders
```
GET    /api/admin/orders
PUT    /api/admin/orders/[id]
DELETE /api/admin/orders/[id]
```

### Manage Users
```
GET    /api/admin/users
PUT    /api/admin/users/[id]
DELETE /api/admin/users/[id]
```

### Analytics
```
GET /api/admin/analytics
Authorization: Bearer {token}
```

### Bulk Operations
```
POST /api/admin/bulk-delete
Body: { productIds: [...] }
```

## 🔒 Security

### Admin Authentication
- All admin routes check for valid JWT token
- User role must be 'admin'
- Unauthorized access redirects to login

### Protected API Routes
```javascript
const token = req.headers.authorization?.split(' ')[1]
const decoded = verifyToken(token)
if (!decoded || decoded.role !== 'admin') {
  return res.status(403).json({ message: 'Admin access required' })
}
```

## 🎨 UI Features

### Responsive Design
- Mobile-friendly navigation
- Responsive tables
- Touch-friendly buttons

### Real-time Updates
- Toast notifications
- Loading states
- Error handling

### Color-coded Status
- **Green**: High stock, delivered orders
- **Yellow**: Medium stock, pending orders
- **Red**: Low stock, cancelled orders
- **Blue**: Processing orders
- **Purple**: Featured products, shipped orders

## 📝 How to Use

### Adding a Product
1. Go to `/admin/dashboard`
2. Click "Add Product"
3. Fill in product details
4. Add image URLs
5. Set category and stock
6. Click "Add Product"

### Managing Orders
1. Go to `/admin/orders`
2. View all customer orders
3. Change status using dropdown
4. Click "View Details" for more info

### Managing Users
1. Go to `/admin/users`
2. View all registered users
3. Change role using dropdown
4. Delete users if needed

### Viewing Analytics
1. Go to `/admin/analytics`
2. Check recent orders
3. Monitor low stock items
4. View top products

## 🚀 Quick Start

1. **Login as Admin**
   ```
   Email: admin@vstra.com
   Password: admin123
   ```

2. **Seed Products**
   - Go to Dashboard
   - Click "Seed Products"
   - Wait for completion

3. **Start Managing**
   - View products
   - Process orders
   - Monitor analytics

## 💡 Tips

- **Regular Monitoring**: Check low stock alerts daily
- **Order Processing**: Update order status promptly
- **Product Images**: Use high-quality image URLs
- **Featured Products**: Mark bestsellers as featured
- **User Roles**: Be careful when changing admin roles
- **Backup**: Export data regularly

## 🐛 Troubleshooting

### Can't Access Admin Panel
- Ensure you're logged in
- Check if user role is 'admin'
- Clear browser cache

### Stats Not Loading
- Check MongoDB connection
- Verify API routes are working
- Check browser console for errors

### Products Not Showing
- Seed database first
- Check MongoDB connection
- Verify products collection exists

## 📱 Mobile Access

The admin panel is fully responsive:
- Hamburger menu on mobile
- Scrollable tables
- Touch-friendly buttons
- Optimized layouts

## 🔄 Future Enhancements

- Export orders to CSV
- Bulk product upload
- Advanced analytics charts
- Email notifications
- Product reviews management
- Inventory tracking
- Sales reports
- Customer insights

---

**Need Help?** Check the main README.md or contact support.
