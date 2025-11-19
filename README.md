# VSTRA - Premium Ecommerce Platform

A modern, full-stack ecommerce website built with Next.js, MongoDB, and premium UI/UX design.

![VSTRA](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

## 🚀 Features

### Frontend
- ✅ Modern, responsive design (mobile, tablet, desktop)
- ✅ Smooth animations (Framer Motion + GSAP)
- ✅ Premium UI/UX (Apple-inspired design)
- ✅ Product browsing with advanced filters
- ✅ Shopping cart with persistent storage
- ✅ User authentication (JWT)
- ✅ Order management
- ✅ Account dashboard

### Backend
- ✅ MongoDB database
- ✅ RESTful API (Next.js API routes)
- ✅ User authentication & authorization
- ✅ Product management
- ✅ Order processing
- ✅ Secure password hashing (bcrypt)

### Performance
- ✅ Optimized for 60fps scrolling
- ✅ Fast page loads (< 2s)
- ✅ Lazy loading images
- ✅ Code splitting
- ✅ Production-ready

## 📦 Tech Stack

- **Framework**: Next.js 14
- **Database**: MongoDB + Mongoose
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **State Management**: Zustand
- **Authentication**: JWT + bcryptjs
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/vstra-ecommerce.git
cd vstra-ecommerce
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/vstra-ecommerce
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
ADMIN_EMAIL=admin@vstra.com
ADMIN_PASSWORD=admin123
```

4. **Start MongoDB**
```bash
mongod
```

5. **Seed the database**
Visit: `http://localhost:3000/api/seed-500`
Or: `http://localhost:3000/admin/seed-500`

6. **Run development server**
```bash
npm run dev
```

7. **Open browser**
Visit: `http://localhost:3000`

## 📁 Project Structure

```
vstra-ecommerce/
├── components/          # React components
│   ├── Navbar.js
│   ├── Hero.js
│   ├── Featured.js
│   └── ...
├── pages/              # Next.js pages
│   ├── index.js        # Home page
│   ├── shop.js         # Shop page
│   ├── cart.js         # Cart page
│   ├── checkout.js     # Checkout
│   ├── product/[id].js # Product detail
│   ├── auth/           # Authentication
│   └── api/            # API routes
├── models/             # MongoDB models
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── lib/                # Utilities
│   ├── mongodb.js
│   └── auth.js
├── store/              # Zustand stores
│   └── useStore.js
├── styles/             # Global styles
│   └── globals.css
└── public/             # Static files
```

## 🎯 Key Features

### 1. Product Management
- 500+ premium products
- Multiple categories (Men, Women, Accessories, New Arrivals)
- Advanced filtering (category, price, size, search)
- Product ratings and reviews

### 2. Shopping Experience
- Add to cart
- Update quantities
- Remove items
- Persistent cart (localStorage)
- Real-time cart count

### 3. User Authentication
- Register new account
- Login with JWT
- Secure password hashing
- Protected routes
- User dashboard

### 4. Order Management
- Place orders
- View order history
- Order status tracking
- Shipping information

### 5. Responsive Design
- Mobile-first approach
- Hamburger menu on mobile
- Touch-friendly interface
- Optimized for all devices

## 🔐 Admin Features

### Seed Database
- `/admin/seed` - Seed 8 sample products
- `/admin/seed-premium` - Seed 100+ products
- `/admin/seed-500` - Seed 500 products
- `/admin/check` - Check database status

### Demo Credentials
```
Email: admin@vstra.com
Password: admin123
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy!

3. **Setup MongoDB Atlas**
- Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Update `MONGODB_URI` in Vercel

### Environment Variables (Production)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vstra
JWT_SECRET=production-secret-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=production-nextauth-secret
```

## 📊 Performance

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Scroll FPS**: 55-60fps
- **Bundle Size**: ~350KB (gzipped)

## 🎨 Design

- Apple-inspired minimalism
- High contrast black & white theme
- Premium typography (Inter font)
- Smooth animations
- Luxury aesthetic

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Framer Motion for smooth animations
- MongoDB for the database
- Unsplash for product images

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

**VSTRA** — Redefine Your Style

Made with ❤️ using Next.js, MongoDB, and modern web technologies
