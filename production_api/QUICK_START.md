# Quick Start Guide - 5 Minutes to Production API

Get your production-grade API running in 5 minutes.

## ⚡ Super Quick Start (Docker)

```bash
# 1. Navigate to directory
cd production_api

# 2. Configure environment
cp .env.example .env
# Edit .env with your data file paths

# 3. Start services
docker-compose up -d

# 4. Test
curl http://localhost:8000/api/v1/health
```

**Done!** API is running at http://localhost:8000

---

## 🐍 Quick Start (Python)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your paths

# 3. Run server
python -m app.main

# 4. Test
curl http://localhost:8000/api/v1/health
```

**Done!** API is running at http://localhost:8000

---

## 🧪 Test It

### Browser
Open: http://localhost:8000/docs

### cURL
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "blue cotton saree", "top_k": 5}'
```

### Python Script
```bash
python test_api.py
```

---

## 📚 Next Steps

1. **Explore API Docs:** http://localhost:8000/docs
2. **Read Full Guide:** [README.md](README.md)
3. **Deploy:** [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Upgrade from Basic:** [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)

---

## 🎯 Key Features

✅ Pagination & Filtering
✅ Sorting (similarity, price)
✅ Rate Limiting
✅ Caching
✅ Structured Logging
✅ Docker Support
✅ Production Ready

---

## 🔧 Configuration

Edit `.env`:
```env
# Data paths
FAISS_INDEX_PATH=C:\Users\rachi\VSTRA\Data\product_index.faiss
PRODUCTS_CSV_PATH=C:\Users\rachi\VSTRA\Data\cleaned_products.csv

# Performance
ENABLE_CACHE=True
RATE_LIMIT_ENABLED=True

# Server
PORT=8000
DEBUG=False
```

---

## 📡 API Endpoints

```
POST /api/v1/search          # Search products
POST /api/v1/batch-search    # Batch search
GET  /api/v1/categories      # List categories
GET  /api/v1/brands          # List brands
GET  /api/v1/health          # Health check
```

---

## 🚨 Troubleshooting

**Port already in use?**
```bash
# Change port in .env
PORT=8001
```

**Can't find data files?**
```bash
# Check paths in .env
cat .env | grep PATH
```

**Module not found?**
```bash
pip install -r requirements.txt
```

---

## 💡 Pro Tips

1. Use Docker for easiest setup
2. Check `/docs` for interactive API testing
3. Enable caching for better performance
4. Monitor logs: `docker-compose logs -f api`

---

**You're all set! 🎉**

For detailed documentation, see [README.md](README.md)
