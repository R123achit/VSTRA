# Upgrade Guide: From Basic to Production API

This guide helps you migrate from your existing basic API to the production-grade version.

## 🎯 What's New in Production Version

### Architecture Improvements
✅ **Layered Architecture:** Separated routes, services, models, and config
✅ **Dependency Injection:** Search engine loaded once via singleton pattern
✅ **Clean Code Structure:** Modular, maintainable, and scalable

### Performance Enhancements
✅ **LRU Caching:** Repeated queries cached for faster responses
✅ **Optimized Batch Search:** Efficient multi-query processing
✅ **Single Model Load:** Model and index loaded once at startup

### New API Features
✅ **Pagination:** Page-based navigation with metadata
✅ **Advanced Filtering:** Price range, category, brand filters
✅ **Sorting Options:** Sort by similarity, price (asc/desc)
✅ **Category/Brand Endpoints:** List available filters

### Security & Validation
✅ **Pydantic Models:** Automatic request/response validation
✅ **Rate Limiting:** Protect against abuse
✅ **Input Sanitization:** Prevent injection attacks

### Monitoring & Logging
✅ **Structured Logging:** JSON logs with request tracking
✅ **Performance Metrics:** Response time monitoring
✅ **Health Checks:** Service status endpoint

### Deployment
✅ **Docker Support:** Containerized deployment
✅ **Environment Config:** Flexible configuration via .env
✅ **Production Ready:** Gunicorn, health checks, monitoring

---

## 📊 Comparison Table

| Feature | Basic API | Production API |
|---------|-----------|----------------|
| Architecture | Single file | Layered (routes/services/models) |
| Model Loading | ❌ May reload | ✅ Once at startup (singleton) |
| Caching | ❌ No | ✅ LRU cache with TTL |
| Pagination | ❌ No | ✅ Yes (page, page_size) |
| Filtering | ❌ No | ✅ Price, category, brand |
| Sorting | ❌ Similarity only | ✅ Similarity + price |
| Rate Limiting | ❌ No | ✅ Configurable |
| Logging | ❌ Basic | ✅ Structured JSON |
| Validation | ⚠️ Manual | ✅ Automatic (Pydantic) |
| Error Handling | ⚠️ Basic | ✅ Comprehensive |
| Docker | ❌ No | ✅ Yes + Docker Compose |
| Monitoring | ❌ No | ✅ Health checks + metrics |
| Documentation | ⚠️ Basic | ✅ Comprehensive |

---

## 🔄 Migration Steps

### Step 1: Backup Current API

```bash
# Backup your current API
cp -r data/ data_backup/
cp api_fastapi.py api_fastapi_backup.py
```

### Step 2: Install Production API

```bash
# Clone or copy production_api folder
cd production_api

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your paths
nano .env
```

Update these critical settings:
```env
FAISS_INDEX_PATH=C:\Users\rachi\VSTRA\Data\product_index.faiss
PRODUCTS_CSV_PATH=C:\Users\rachi\VSTRA\Data\cleaned_products.csv
EMBEDDINGS_PATH=C:\Users\rachi\VSTRA\Data\embeddings.npy
```

### Step 4: Test Locally

```bash
# Start the server
python -m app.main

# In another terminal, run tests
python test_api.py
```

### Step 5: Update Frontend

Update your frontend API calls to use new endpoints:

**Old:**
```javascript
POST /search
{
  "query": "blue saree",
  "top_k": 10
}
```

**New:**
```javascript
POST /api/v1/search
{
  "query": "blue saree",
  "top_k": 10,
  "page": 1,
  "page_size": 20,
  "min_price": null,
  "max_price": null,
  "category": null,
  "brand": null,
  "sort_by": "similarity"
}
```

### Step 6: Deploy

Choose your deployment method:
- Docker: `docker-compose up -d`
- Gunicorn: See DEPLOYMENT.md
- Cloud: Follow platform-specific guide

---

## 🔌 API Endpoint Changes

### Search Endpoint

**Old Endpoint:**
```
POST /search
```

**New Endpoint:**
```
POST /api/v1/search
```

**Request Changes:**
```json
{
  "query": "blue saree",
  "top_k": 10,
  // NEW FIELDS:
  "page": 1,
  "page_size": 20,
  "min_price": 500,
  "max_price": 2000,
  "category": "saree",
  "brand": "Blue Wish",
  "sort_by": "similarity"  // or "price_asc", "price_desc"
}
```

**Response Changes:**
```json
{
  "success": true,
  "query": "blue saree",
  "total_results": 45,
  "products": [...],
  // NEW FIELDS:
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {...},
  "execution_time_ms": 125.5
}
```

### New Endpoints

```
GET  /api/v1/health          # Health check
GET  /api/v1/categories      # List categories
GET  /api/v1/brands          # List brands
POST /api/v1/batch-search    # Batch search
GET  /metrics                # Metrics
```

---

## 💻 Code Migration Examples

### Frontend (React)

**Old Code:**
```javascript
const searchProducts = async (query) => {
  const response = await fetch('http://localhost:8000/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: 10 })
  });
  return response.json();
};
```

**New Code:**
```javascript
const searchProducts = async (query, filters = {}) => {
  const response = await fetch('http://localhost:8000/api/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      top_k: 10,
      page: filters.page || 1,
      page_size: filters.pageSize || 20,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      category: filters.category,
      brand: filters.brand,
      sort_by: filters.sortBy || 'similarity'
    })
  });
  
  const data = await response.json();
  
  return {
    products: data.products,
    pagination: data.pagination,
    totalResults: data.total_results,
    executionTime: data.execution_time_ms
  };
};
```

### Backend (Node.js)

**Old Code:**
```javascript
app.get('/api/products', async (req, res) => {
  const { q } = req.query;
  
  const response = await axios.post('http://localhost:8000/search', {
    query: q,
    top_k: 10
  });
  
  res.json(response.data);
});
```

**New Code:**
```javascript
app.get('/api/products', async (req, res) => {
  const { q, page, minPrice, maxPrice, category, sortBy } = req.query;
  
  const response = await axios.post('http://localhost:8000/api/v1/search', {
    query: q,
    top_k: 20,
    page: parseInt(page) || 1,
    page_size: 20,
    min_price: minPrice ? parseFloat(minPrice) : null,
    max_price: maxPrice ? parseFloat(maxPrice) : null,
    category: category || null,
    sort_by: sortBy || 'similarity'
  });
  
  res.json({
    products: response.data.products,
    pagination: response.data.pagination,
    filters: response.data.filters_applied
  });
});
```

---

## ⚙️ Configuration Migration

### Old Configuration (Hardcoded)

```python
# api_fastapi.py
FAISS_INDEX_PATH = "C:\\Users\\rachi\\VSTRA\\Data\\product_index.faiss"
MODEL_NAME = "all-MiniLM-L6-v2"
```

### New Configuration (Environment Variables)

```env
# .env
FAISS_INDEX_PATH=C:\Users\rachi\VSTRA\Data\product_index.faiss
MODEL_NAME=all-MiniLM-L6-v2
ENABLE_CACHE=True
RATE_LIMIT_ENABLED=True
```

---

## 🧪 Testing Migration

### 1. Test Basic Functionality

```bash
# Old API
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "blue saree", "top_k": 5}'

# New API
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "blue saree", "top_k": 5}'
```

### 2. Test New Features

```bash
# Pagination
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "saree",
    "top_k": 20,
    "page": 2,
    "page_size": 10
  }'

# Filtering
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "saree",
    "top_k": 10,
    "min_price": 500,
    "max_price": 2000,
    "category": "saree"
  }'

# Sorting
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "trouser",
    "top_k": 10,
    "sort_by": "price_asc"
  }'
```

### 3. Run Automated Tests

```bash
python test_api.py
```

---

## 🚨 Breaking Changes

### 1. API Prefix

All endpoints now use `/api/v1` prefix:
- Old: `/search`
- New: `/api/v1/search`

### 2. Response Structure

Pagination metadata added to all search responses.

### 3. Error Responses

More detailed error messages with request IDs.

### 4. Rate Limiting

Requests may be rate-limited (configurable).

---

## 🔧 Troubleshooting

### Issue: "Module not found" errors

```bash
# Make sure you're in the right directory
cd production_api

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Search service not ready"

```bash
# Check data file paths in .env
cat .env | grep PATH

# Verify files exist
ls -lh C:\Users\rachi\VSTRA\Data\
```

### Issue: Frontend getting 404

```bash
# Update API base URL
OLD: http://localhost:8000/search
NEW: http://localhost:8000/api/v1/search
```

### Issue: CORS errors

```bash
# Update CORS_ORIGINS in .env
CORS_ORIGINS=https://yourfrontend.com
```

---

## 📈 Performance Comparison

Run benchmarks to compare:

```bash
# Old API
ab -n 100 -c 10 -p search.json -T application/json http://localhost:8000/search

# New API (with caching)
ab -n 100 -c 10 -p search.json -T application/json http://localhost:8000/api/v1/search
```

Expected improvements:
- 30-50% faster with caching
- Better concurrent request handling
- Lower memory usage per request

---

## ✅ Migration Checklist

- [ ] Backup current API and data
- [ ] Install production API
- [ ] Configure environment variables
- [ ] Test locally
- [ ] Update frontend API calls
- [ ] Test all new features
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Run load tests
- [ ] Deploy to production
- [ ] Monitor logs and metrics
- [ ] Update team documentation

---

## 🎓 Learning Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Pydantic:** https://docs.pydantic.dev/
- **Docker:** https://docs.docker.com/
- **FAISS:** https://github.com/facebookresearch/faiss

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f api`
2. Review configuration: `cat .env`
3. Test endpoints: `python test_api.py`
4. Check API docs: http://localhost:8000/docs

---

**Happy Upgrading! 🚀**
