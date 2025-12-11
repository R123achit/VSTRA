# 🧪 Multi-Seller System - API Testing Guide

## 📋 Prerequisites

- MongoDB running
- Server running on `http://localhost:3000`
- Postman or similar API testing tool
- Admin account created

---

## 🔐 Authentication Tokens

You'll need these tokens for testing:
- `ADMIN_TOKEN` - From admin login
- `SELLER_TOKEN` - From seller login
- `USER_TOKEN` - From user login

---

## 1️⃣ Seller Registration Flow

### Step 1: Register New Seller

```http
POST http://localhost:3000/api/seller/auth/register
Content-Type: application/json

{
  "businessName": "Fashion Hub Store",
  "email": "fashionhub@example.com",
  "phone": "9876543210",
  "password": "seller123",
  "gstNumber": "22AAAAA0000A1Z5",
  "panNumber": "ABCDE1234F",
  "bankDetails": {
    "accountHolderName": "Fashion Hub",
    "accountNumber": "1234567890123456",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank of India",
    "branch": "Mumbai Main"
  },
  "pickupAddress": {
    "addressLine1": "123 Fashion Street",
    "addressLine2": "Near Mall",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Seller registration successful. Awaiting admin approval.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "seller": {
    "id": "...",
    "businessName": "Fashion Hub Store",
    "email": "fashionhub@example.com",
    "status": "pending"
  }
}
```

Save the `token` as `SELLER_TOKEN` and `seller.id` as `SELLER_ID`.

---

## 2️⃣ Admin Approval Flow

### Step 2: Admin Views Pending Sellers

```http
GET http://localhost:3000/api/admin/sellers?status=pending
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "sellers": [
    {
      "_id": "...",
      "businessName": "Fashion Hub Store",
      "email": "fashionhub@example.com",
      "status": "pending",
      "gstNumber": "22AAAAA0000A1Z5",
      "totalProducts": 0,
      "totalOrders": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "stats": [
    { "_id": "pending", "count": 1 },
    { "_id": "approved", "count": 5 }
  ],
  "total": 1
}
```

### Step 3: Admin Approves Seller

```http
POST http://localhost:3000/api/admin/sellers/approve
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "sellerId": "{{SELLER_ID}}",
  "approved": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Seller approved successfully",
  "seller": {
    "_id": "...",
    "businessName": "Fashion Hub Store",
    "status": "approved"
  }
}
```

---

## 3️⃣ Seller Login & Dashboard

### Step 4: Seller Login

```http
POST http://localhost:3000/api/seller/auth/login
Content-Type: application/json

{
  "email": "fashionhub@example.com",
  "password": "seller123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "seller": {
    "id": "...",
    "businessName": "Fashion Hub Store",
    "email": "fashionhub@example.com",
    "status": "approved",
    "rating": 0,
    "totalProducts": 0,
    "totalOrders": 0
  }
}
```

### Step 5: Get Seller Analytics

```http
GET http://localhost:3000/api/seller/analytics
Authorization: Bearer {{SELLER_TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "analytics": {
    "products": {
      "total": 0,
      "totalStock": 0,
      "outOfStock": 0
    },
    "orders": {
      "total": 0,
      "byStatus": [],
      "last30Days": 0
    },
    "earnings": {
      "totalSales": 0,
      "totalCommission": 0,
      "totalEarnings": 0,
      "pendingSettlement": 0,
      "paidSettlement": 0,
      "last30DaysRevenue": 0
    },
    "topProducts": [],
    "seller": {
      "rating": 0,
      "numReviews": 0,
      "commissionRate": 10
    }
  }
}
```

---

## 4️⃣ Product Management

### Step 6: Add Product

```http
POST http://localhost:3000/api/seller/products
Authorization: Bearer {{SELLER_TOKEN}}
Content-Type: application/json

{
  "name": "Premium Cotton T-Shirt",
  "description": "High quality 100% cotton t-shirt, perfect for casual wear",
  "brand": "Fashion Hub",
  "price": 799,
  "compareAtPrice": 1299,
  "category": "men",
  "subcategory": "t-shirts",
  "images": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"
  ],
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "colors": [
    { "name": "Black", "hex": "#000000" },
    { "name": "White", "hex": "#FFFFFF" },
    { "name": "Navy", "hex": "#000080" }
  ],
  "stock": 100,
  "material": "100% Cotton",
  "fit": "Regular Fit",
  "neckType": "Round Neck",
  "sleeveType": "Half Sleeve"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product added successfully",
  "product": {
    "_id": "...",
    "name": "Premium Cotton T-Shirt",
    "sellerId": "...",
    "price": 799,
    "stock": 100,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Save `product._id` as `PRODUCT_ID`.

### Step 7: Get All Seller Products

```http
GET http://localhost:3000/api/seller/products?page=1&limit=20
Authorization: Bearer {{SELLER_TOKEN}}
```

### Step 8: Update Product

```http
PUT http://localhost:3000/api/seller/products/{{PRODUCT_ID}}
Authorization: Bearer {{SELLER_TOKEN}}
Content-Type: application/json

{
  "price": 699,
  "stock": 150
}
```

### Step 9: Update Stock Only

```http
PUT http://localhost:3000/api/seller/products/stock
Authorization: Bearer {{SELLER_TOKEN}}
Content-Type: application/json

{
  "productId": "{{PRODUCT_ID}}",
  "stock": 200
}
```

---

## 5️⃣ Order Flow & Commission

### Step 10: Customer Places Order

```http
POST http://localhost:3000/api/orders
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "{{PRODUCT_ID}}",
      "name": "Premium Cotton T-Shirt",
      "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      "price": 699,
      "quantity": 2,
      "size": "L",
      "color": "Black"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "addressLine1": "456 Customer Street",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India"
  },
  "paymentMethod": "card",
  "itemsPrice": 1398,
  "taxPrice": 252,
  "shippingPrice": 50,
  "totalPrice": 1700
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "orderItems": [...],
    "totalPrice": 1700,
    "status": "pending"
  }
}
```

**Note:** Commission is automatically calculated in the background!

Save `data._id` as `ORDER_ID`.

### Step 11: Seller Views Orders

```http
GET http://localhost:3000/api/seller/orders
Authorization: Bearer {{SELLER_TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "...",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {...},
          "name": "Premium Cotton T-Shirt",
          "quantity": 2,
          "price": 699
        }
      ],
      "status": "pending",
      "sellerTotal": 1398,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Step 12: Seller Updates Order Status

```http
PUT http://localhost:3000/api/seller/orders/{{ORDER_ID}}
Authorization: Bearer {{SELLER_TOKEN}}
Content-Type: application/json

{
  "status": "processing"
}
```

### Step 13: Seller Marks as Shipped

```http
PUT http://localhost:3000/api/seller/orders/{{ORDER_ID}}
Authorization: Bearer {{SELLER_TOKEN}}
Content-Type: application/json

{
  "status": "shipped",
  "trackingId": "TRACK123456789"
}
```

---

## 6️⃣ Earnings & Commission

### Step 14: Seller Views Earnings

```http
GET http://localhost:3000/api/seller/earnings
Authorization: Bearer {{SELLER_TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "commissions": [
    {
      "_id": "...",
      "orderId": {...},
      "productId": {...},
      "orderAmount": 1398,
      "commissionRate": 10,
      "commissionAmount": 139.8,
      "sellerEarnings": 1258.2,
      "finalSettlement": 1258.2,
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "summary": {
    "totalSales": 1398,
    "totalCommission": 139.8,
    "totalEarnings": 1258.2,
    "totalDeductions": 0,
    "totalSettlement": 1258.2
  },
  "total": 1
}
```

---

## 7️⃣ Admin Commission Management

### Step 15: Admin Views All Commissions

```http
GET http://localhost:3000/api/admin/commissions
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "commissions": [...],
  "platformSummary": {
    "totalOrders": 1,
    "totalSales": 1398,
    "totalCommissionEarned": 139.8,
    "totalSellerPayouts": 1258.2,
    "pendingPayouts": 1258.2
  },
  "total": 1
}
```

### Step 16: Admin Settles Payment

```http
POST http://localhost:3000/api/admin/commissions/settle
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "commissionId": "{{COMMISSION_ID}}",
  "transactionId": "TXN_20240101_001"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Commission settled successfully",
  "commission": {
    "_id": "...",
    "status": "paid",
    "settlementDate": "2024-01-01T00:00:00.000Z",
    "transactionId": "TXN_20240101_001"
  }
}
```

### Step 17: Bulk Settle for Seller

```http
POST http://localhost:3000/api/admin/commissions/settle
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "bulkSettle": true,
  "sellerId": "{{SELLER_ID}}",
  "transactionId": "BULK_TXN_20240101"
}
```

---

## 8️⃣ Admin Seller Management

### Step 18: Set Commission Rate

**For specific seller:**
```http
PUT http://localhost:3000/api/admin/sellers/commission
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "sellerId": "{{SELLER_ID}}",
  "commissionRate": 12
}
```

**For all sellers:**
```http
PUT http://localhost:3000/api/admin/sellers/commission
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "applyToAll": true,
  "commissionRate": 15
}
```

### Step 19: Block Seller

```http
PUT http://localhost:3000/api/admin/sellers/{{SELLER_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "status": "blocked"
}
```

### Step 20: View Seller Products (Admin)

```http
GET http://localhost:3000/api/admin/sellers/products?sellerId={{SELLER_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```

### Step 21: Delete Seller

```http
DELETE http://localhost:3000/api/admin/sellers/{{SELLER_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Note:** This will also delete all seller's products!

---

## 🧪 Test Scenarios

### Scenario 1: Complete Seller Journey
1. Register seller → Pending status
2. Admin approves → Approved status
3. Seller logs in → Gets token
4. Seller adds products → Products visible
5. Customer orders → Commission calculated
6. Seller ships → Status updated
7. Admin settles → Seller gets paid

### Scenario 2: Commission Calculation
```
Order Amount: ₹1398
Commission Rate: 10%
Platform Earnings: ₹139.80
Seller Earnings: ₹1258.20
```

### Scenario 3: Multiple Sellers
1. Register 3 sellers
2. Each adds 5 products
3. Customer orders from all 3
4. Each seller manages their orders
5. Admin settles all commissions

---

## 🐛 Common Issues

### Issue 1: "Authentication required"
- Check if token is included in Authorization header
- Format: `Bearer <token>`

### Issue 2: "Seller access required"
- Using user token instead of seller token
- Get new token from seller login

### Issue 3: "Your account is pending approval"
- Seller not approved yet
- Admin needs to approve first

### Issue 4: "Product not found or unauthorized"
- Trying to access another seller's product
- Check sellerId matches

---

## ✅ Success Checklist

- [ ] Seller can register
- [ ] Admin can approve sellers
- [ ] Seller can login
- [ ] Seller can add products
- [ ] Seller can view orders
- [ ] Commission calculated automatically
- [ ] Seller can view earnings
- [ ] Admin can view all commissions
- [ ] Admin can settle payments
- [ ] Admin can manage sellers

---

## 📊 Expected Database Records

After complete flow:

**Sellers Collection:**
```javascript
{
  businessName: "Fashion Hub Store",
  status: "approved",
  totalProducts: 1,
  totalOrders: 1,
  totalSales: 1398,
  totalEarnings: 1258.2
}
```

**Products Collection:**
```javascript
{
  name: "Premium Cotton T-Shirt",
  sellerId: ObjectId("..."),
  price: 699,
  stock: 98 // Reduced by 2
}
```

**Orders Collection:**
```javascript
{
  orderItems: [{
    product: ObjectId("..."),
    quantity: 2
  }],
  status: "shipped"
}
```

**Commissions Collection:**
```javascript
{
  orderId: ObjectId("..."),
  sellerId: ObjectId("..."),
  orderAmount: 1398,
  commissionAmount: 139.8,
  sellerEarnings: 1258.2,
  status: "paid"
}
```

---

**Happy Testing! 🚀**
