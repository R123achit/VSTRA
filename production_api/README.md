# Production-Grade Product Search API

A scalable, high-performance semantic search API built with FastAPI, FAISS, and sentence-transformers.

## 🌟 Features

### Architecture
- ✅ Clean layered architecture (routes, services, models, config)
- ✅ Dependency injection for search engine
- ✅ Singleton pattern for model/index loading
- ✅ Modular, maintainable codebase

### Performance
- ✅ Model and FAISS index loaded once at startup
- ✅ LRU caching for repeated queries
- ✅ Optimized batch search
- ✅ Response time < 200ms

### API Features
- ✅ Pagination (page, page_size)
- ✅ Filtering (price range, category, brand)
- ✅ Sorting (similarity, price low→high, high→low)
- ✅ Batch search endpoint
- ✅ Category and brand listing

### Security & Validation
- ✅ Pydantic models for request/response validation
- ✅ Rate limiting middleware
- ✅ Input validation and sanitization
- ✅ Error handling

### Monitoring & Logging
- ✅ Structured JSON logging
- ✅ Request timing and metrics
- ✅ Health check endpoint
- ✅ Request ID tracking

### Deployment
- ✅ Docker support
- ✅ Docker Compose with Redis
- ✅ Environment variable configuration
- ✅ Production-ready setup

## 📁 Project Structure

```
production_api/
├── app/
│   ├── api/
│   │   └── routes.py           # API endpoints
│   ├── core/
│   │   ├── config.py           # Configuration management
│   │   └── logging.py          # Logging setup
│   ├── middleware/
│   │   ├── rate_limit.py       # Rate limiting
│   │   └── request_logging.py  # Request logging
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   ├── services/
│   │   └── search_service.py   # Search business logic
│   └── main.py                 # FastAPI application
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
└── README.md                   # This file
```

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
```bash
cd production_api
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
# Copy example env file
copy .env.example .env

# Edit .env with your paths
```

3. **Run the Server**
```bash
# Development mode
python -m app.main

# Or with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. **Access API**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

### Docker Deployment

1. **Build and Run**
```bash
docker-compose up -d
```

2. **View Logs**
```bash
docker-compose logs -f api
```

3. **Stop**
```bash
docker-compose down
```

## 📡 API Endpoints

### Search Products
```bash
POST /api/v1/search
```

**Request:**
```json
{
  "query": "blue cotton saree for women",
  "top_k": 10,
  "page": 1,
  "page_size": 20,
  "min_price": 100,
  "max_price": 5000,
  "category": "saree",
  "brand": "Blue Wish",
  "sort_by": "similarity"
}
```

**Response:**
```json
{
  "success": true,
  "query": "blue cotton saree for women",
  "total_results": 45,
  "products": [...],
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

### Batch Search
```bash
POST /api/v1/batch-search
```

### Get Categories
```bash
GET /api/v1/categories
```

### Get Brands
```bash
GET /api/v1/brands
```

### Health Check
```bash
GET /api/v1/health
```

## ⚙️ Configuration

Edit `.env` file:

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Paths
FAISS_INDEX_PATH=/path/to/product_index.faiss
PRODUCTS_CSV_PATH=/path/to/cleaned_products.csv

# Performance
ENABLE_CACHE=True
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Security
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## 🔧 Advanced Features

### Caching

Built-in LRU cache for repeated queries:
- Configurable TTL (default: 1 hour)
- Configurable max size (default: 1000 entries)
- Automatic cache invalidation

### Rate Limiting

Protects API from abuse:
- Configurable requests per window
- Per-client IP tracking
- Automatic cleanup

### Logging

Structured JSON logging:
- Request/response tracking
- Execution time monitoring
- Error tracking with stack traces
- Request ID for tracing

### Pagination

Efficient pagination:
- Page-based navigation
- Configurable page size
- Total count and page metadata

### Filtering & Sorting

Multiple filter options:
- Price range (min/max)
- Category
- Brand
- Sort by similarity or price

## 📊 Performance Metrics

- **Startup Time:** ~5-10 seconds
- **Search Latency:** 50-200ms
- **Memory Usage:** ~200MB
- **Throughput:** 100+ req/s (single worker)

## 🚢 Deployment Options

### 1. Docker (Recommended)

```bash
docker-compose up -d
```

### 2. Gunicorn (Production)

```bash
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### 3. Render.com

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

### 4. AWS EC2

1. Launch EC2 instance (t3.medium or larger)
2. Install Docker
3. Clone repository
4. Run `docker-compose up -d`
5. Configure security group (port 8000)

### 5. Railway.app

1. Create new project
2. Connect GitHub repository
3. Railway auto-detects Dockerfile
4. Add environment variables
5. Deploy

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Test search
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "blue saree", "top_k": 5}'

# Test with filters
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "saree",
    "top_k": 10,
    "min_price": 500,
    "max_price": 2000,
    "category": "saree",
    "sort_by": "price_asc"
  }'
```

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:8000/api/v1/health
```

### Metrics

```bash
curl http://localhost:8000/metrics
```

### Logs

```bash
# Docker
docker-compose logs -f api

# Local
# Logs output to stdout
```

## 🔒 Security Best Practices

1. **Environment Variables:** Never commit `.env` file
2. **CORS:** Restrict origins in production
3. **Rate Limiting:** Enable and configure appropriately
4. **HTTPS:** Use reverse proxy (nginx) with SSL
5. **Authentication:** Add API key or JWT authentication
6. **Input Validation:** Already implemented with Pydantic

## 🐛 Troubleshooting

### Issue: Service won't start
- Check if data files exist at configured paths
- Verify Python version (3.9+)
- Check logs for detailed error messages

### Issue: Slow responses
- Enable caching (`ENABLE_CACHE=True`)
- Increase workers in production
- Check if model is loaded once (not per request)

### Issue: Out of memory
- Reduce `CACHE_MAX_SIZE`
- Use smaller model
- Increase server RAM

## 📚 Documentation

- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI Spec:** http://localhost:8000/openapi.json

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow PEP 8 style guide

## 📄 License

MIT License

## 🆘 Support

For issues or questions:
- Check API docs at `/docs`
- Review logs for errors
- Open an issue on GitHub

---

**Built with ❤️ using FastAPI, FAISS, and sentence-transformers**
