# Frontend Integration Guide

## ✅ Yes, You're Ready to Use Product Recommendations!

Your backend API is production-ready. Here's how to integrate it with your website.

---

## 🚀 Quick Integration (3 Steps)

### Step 1: Start Your API

```bash
# Option 1: Production API
cd production_api
python -m app.main

# Option 2: Basic API (if you prefer)
cd data
python api_fastapi.py
```

API will be available at: `http://localhost:8000`

### Step 2: Add Component to Your Next.js App

**With Tailwind CSS:**
```bash
# Copy ProductSearch.jsx to your Next.js app
cp ProductSearch.jsx your-nextjs-app/app/components/
```

**Without Tailwind CSS:**
```bash
# Use the no-Tailwind version
cp ProductSearch-NoTailwind.jsx your-nextjs-app/app/components/ProductSearch.jsx
```

### Step 3: Use in Your Page

```jsx
// app/search/page.js
import ProductSearch from '@/components/ProductSearch';

export default function SearchPage() {
  return <ProductSearch />;
}
```

**Done!** Visit `http://localhost:3000/search`

---

## 📁 File Options

### Option 1: With Tailwind CSS
**File:** `ProductSearch.jsx`
- Modern, responsive design
- Requires Tailwind CSS installed
- Best for production

### Option 2: Without Tailwind CSS
**File:** `ProductSearch-NoTailwind.jsx`
- Pure CSS-in-JS styling
- No dependencies needed
- Works immediately

---

## 🎨 Component Features

✅ **Search Input:** Natural language queries
✅ **Real-time Search:** Instant results
✅ **Loading State:** Spinner while fetching
✅ **Product Grid:** Responsive layout
✅ **Product Cards:** Image, title, brand, price, category
✅ **Empty State:** Handles no results
✅ **Error Handling:** Graceful error messages

---

## 🔌 API Integration

The component connects to your backend:

```javascript
fetch('http://localhost:8000/api/v1/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'blue cotton saree',
    top_k: 10
  })
})
```

**Response Format:**
```json
{
  "success": true,
  "query": "blue cotton saree",
  "total_results": 10,
  "products": [
    {
      "id": 12345,
      "title": "Printed Fashion Cotton Silk Saree",
      "brand": "Blue Wish",
      "price": 438.0,
      "category": "saree",
      "image": null,
      "similarity_score": 0.3858
    }
  ]
}
```

---

## 🎯 Example Searches

Try these queries:
- "blue cotton saree for women"
- "black formal trouser men"
- "sports bra women"
- "red silk saree wedding"
- "casual shirt men"

---

## ⚙️ Customization

### Change Number of Results

```javascript
body: JSON.stringify({
  query: query,
  top_k: 20  // Change from 10 to 20
})
```

### Add Filters (Production API Only)

```javascript
body: JSON.stringify({
  query: query,
  top_k: 10,
  min_price: 500,
  max_price: 2000,
  category: 'saree',
  sort_by: 'price_asc'
})
```

### Change API URL

```javascript
// For production deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

fetch(`${API_URL}/api/v1/search`, {
  // ...
})
```

---

## 🎨 Styling Customization

### Colors

**Tailwind Version:**
```jsx
// Change primary color from blue to purple
className="bg-purple-600 hover:bg-purple-700"
```

**No-Tailwind Version:**
```javascript
button: {
  backgroundColor: '#7c3aed',  // Purple instead of blue
}
```

### Grid Layout

**Tailwind Version:**
```jsx
// Change from 4 columns to 3
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
```

**No-Tailwind Version:**
```javascript
grid: {
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
}
```

---

## 🚨 CORS Configuration

If you get CORS errors, update your API:

**Production API:**
```env
# In .env
CORS_ORIGINS=http://localhost:3000,https://yourwebsite.com
```

**Basic API:**
```python
# In api_fastapi.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    ...
)
```

---

## 📱 Mobile Responsive

Both components are fully responsive:
- **Mobile:** 1 column
- **Tablet:** 2 columns
- **Desktop:** 3-4 columns

---

## 🧪 Testing

### 1. Test API First

```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "blue saree", "top_k": 5}'
```

### 2. Test Component

```bash
# Start Next.js dev server
npm run dev

# Visit http://localhost:3000/search
```

### 3. Check Browser Console

Open DevTools (F12) to see:
- API requests
- Response data
- Any errors

---

## 🔧 Troubleshooting

### Issue: "Failed to fetch"

**Solution:** Make sure API is running
```bash
curl http://localhost:8000/api/v1/health
```

### Issue: CORS Error

**Solution:** Update CORS settings in API (see above)

### Issue: No results showing

**Solution:** Check browser console for errors
- Verify API response format
- Check if `data.success` is true
- Verify `data.products` is an array

### Issue: Images not showing

**Solution:** Images are optional. The component shows a placeholder if no image URL.

---

## 🎯 Production Deployment

### 1. Deploy API

```bash
# See DEPLOYMENT.md in production_api folder
# Options: Render, Railway, AWS, etc.
```

### 2. Update API URL

```javascript
// In your component or .env.local
const API_URL = 'https://your-api.onrender.com';
```

### 3. Deploy Next.js

```bash
# Vercel (easiest)
vercel deploy

# Or Netlify, AWS, etc.
```

---

## 📊 Performance Tips

1. **Add Debouncing** (optional):
```javascript
import { useDebounce } from 'use-debounce';

const [debouncedQuery] = useDebounce(query, 500);
```

2. **Add Caching** (optional):
```javascript
const [cache, setCache] = useState({});

// Check cache before fetching
if (cache[query]) {
  setProducts(cache[query]);
  return;
}
```

3. **Lazy Load Images** (optional):
```jsx
<img
  src={product.image}
  loading="lazy"
  alt={product.title}
/>
```

---

## 🎨 Advanced Features (Optional)

### Add Pagination

```javascript
const [page, setPage] = useState(1);

// In fetch
body: JSON.stringify({
  query: query,
  top_k: 20,
  page: page,
  page_size: 10
})
```

### Add Filters UI

```jsx
<select onChange={(e) => setCategory(e.target.value)}>
  <option value="">All Categories</option>
  <option value="saree">Saree</option>
  <option value="trouser">Trouser</option>
</select>
```

### Add Sort Options

```jsx
<select onChange={(e) => setSortBy(e.target.value)}>
  <option value="similarity">Best Match</option>
  <option value="price_asc">Price: Low to High</option>
  <option value="price_desc">Price: High to Low</option>
</select>
```

---

## ✅ Integration Checklist

- [ ] API is running (test with curl)
- [ ] Component added to Next.js app
- [ ] CORS configured correctly
- [ ] Component renders without errors
- [ ] Search returns results
- [ ] Loading state works
- [ ] Empty state shows correctly
- [ ] Product cards display properly
- [ ] Mobile responsive
- [ ] Ready for production

---

## 🎉 You're All Set!

Your product recommendation system is ready to use on your website!

**What you have:**
- ✅ Production-grade API
- ✅ React/Next.js component
- ✅ Real-time semantic search
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

**Next steps:**
1. Start your API
2. Add component to your app
3. Test it out
4. Deploy to production

---

## 📞 Need Help?

- **API Issues:** Check `production_api/README.md`
- **Component Issues:** Check browser console
- **CORS Issues:** Update API CORS settings
- **Deployment:** See `production_api/DEPLOYMENT.md`

---

**Happy Building! 🚀**
