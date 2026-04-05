# Backend API Integration Guide

## Overview
Production-ready REST APIs for semantic product search using FAISS and sentence-transformers.

## Available Implementations

### 1. FastAPI (Recommended) ⚡
- **File**: `api_fastapi.py`
- **Port**: 8000
- **Advantages**: Faster, automatic API docs, async support, type validation
- **Docs**: http://localhost:8000/docs

### 2. Flask 🌶️
- **File**: `api_flask.py`
- **Port**: 5000
- **Advantages**: Simpler, more mature ecosystem, easier to learn

---

## Installation

### Install Dependencies

```bash
# For FastAPI
pip install fastapi uvicorn pydantic

# For Flask
pip install flask flask-cors

# Common dependencies (already installed)
pip install pandas numpy sentence-transformers faiss-cpu
```

---

## Running the Server

### Option 1: FastAPI

```bash
cd data
python api_fastapi.py
```

Server starts at: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

### Option 2: Flask

```bash
cd data
python api_flask.py
```

Server starts at: http://localhost:5000

---

## API Endpoints

### 1. Health Check

**GET /** or **GET /api/health**

```bash
curl http://localhost:8000/
```

Response:
```json
{
  "status": "online",
  "message": "Product Search API is running",
  "version": "1.0.0"
}
```

---

### 2. Product Search (POST)

**POST /search** (FastAPI) or **POST /api/search** (Flask)

#### Request Body:
```json
{
  "query": "blue cotton saree for women",
  "top_k": 10
}
```

#### cURL Example (FastAPI):
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "blue cotton saree for women",
    "top_k": 5
  }'
```

#### cURL Example (Flask):
```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "black trouser men formal",
    "top_k": 10
  }'
```

#### Response:
```json
{
  "success": true,
  "query": "blue cotton saree for women",
  "total_results": 5,
  "products": [
    {
      "id": 12345,
      "title": "Printed Fashion Cotton Silk Saree",
      "brand": "Blue Wish",
      "price": 438.0,
      "category": "saree",
      "image": null,
      "url": null,
      "similarity_score": 0.3858
    },
    {
      "id": 12346,
      "title": "Cotton Blend Saree",
      "brand": "Saree Mall",
      "price": 599.0,
      "category": "saree",
      "image": null,
      "url": null,
      "similarity_score": 0.4521
    }
  ]
}
```

---

### 3. Product Search (GET)

**GET /search?q=query&top_k=10**

Easier for browser testing.

#### cURL Example:
```bash
# FastAPI
curl "http://localhost:8000/search?q=sports%20bra%20women&top_k=5"

# Flask
curl "http://localhost:5000/api/search?q=sports%20bra%20women&top_k=5"
```

---

### 4. Batch Search (POST)

Search multiple queries at once (more efficient).

**POST /batch-search** (FastAPI) or **POST /api/batch-search** (Flask)

#### Request Body:
```json
{
  "queries": ["blue saree", "black trouser", "sports bra"],
  "top_k": 3
}
```

#### cURL Example:
```bash
curl -X POST http://localhost:8000/batch-search \
  -H "Content-Type: application/json" \
  -d '{
    "queries": ["blue saree", "black trouser", "sports bra"],
    "top_k": 3
  }'
```

#### Response:
```json
{
  "success": true,
  "total_queries": 3,
  "results": [
    {
      "query": "blue saree",
      "total_results": 3,
      "products": [...]
    },
    {
      "query": "black trouser",
      "total_results": 3,
      "products": [...]
    },
    {
      "query": "sports bra",
      "total_results": 3,
      "products": [...]
    }
  ]
}
```

---

## Frontend Integration

### React Example

```javascript
// SearchComponent.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // or 5000 for Flask

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/search`, {
        query: query,
        top_k: 10
      });
      
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <button onClick={searchProducts} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      <div className="results">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.title}</h3>
            <p>Brand: {product.brand}</p>
            <p>Price: ₹{product.price}</p>
            <p>Category: {product.category}</p>
            <small>Score: {product.similarity_score.toFixed(4)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSearch;
```

### Fetch API Example

```javascript
async function searchProducts(query, topK = 10) {
  const response = await fetch('http://localhost:8000/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      top_k: topK
    })
  });

  const data = await response.json();
  
  if (data.success) {
    return data.products;
  } else {
    throw new Error(data.error);
  }
}

// Usage
searchProducts('blue cotton saree', 10)
  .then(products => console.log(products))
  .catch(error => console.error(error));
```

### jQuery Example

```javascript
$.ajax({
  url: 'http://localhost:8000/search',
  method: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({
    query: 'sports bra women',
    top_k: 10
  }),
  success: function(response) {
    if (response.success) {
      console.log('Found products:', response.products);
    }
  },
  error: function(error) {
    console.error('Search failed:', error);
  }
});
```

---

## Node.js Backend Integration

```javascript
const axios = require('axios');

async function searchProducts(query, topK = 10) {
  try {
    const response = await axios.post('http://localhost:8000/search', {
      query: query,
      top_k: topK
    });
    
    return response.data;
  } catch (error) {
    console.error('Search error:', error.message);
    throw error;
  }
}

// Usage in Express route
app.get('/api/products/search', async (req, res) => {
  const { q, limit } = req.query;
  
  try {
    const results = await searchProducts(q, limit || 10);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Query parameter is required and cannot be empty"
}
```

### Common Error Codes

- **400**: Bad Request (invalid input)
- **404**: Endpoint not found
- **500**: Internal server error
- **503**: Service unavailable (search engine not loaded)

### Frontend Error Handling

```javascript
try {
  const response = await axios.post(`${API_URL}/search`, {
    query: query,
    top_k: 10
  });
  
  if (response.data.success) {
    // Handle success
    setProducts(response.data.products);
  } else {
    // Handle API error
    alert(response.data.error);
  }
} catch (error) {
  // Handle network error
  if (error.response) {
    // Server responded with error
    console.error('Server error:', error.response.data);
  } else if (error.request) {
    // No response received
    console.error('Network error: No response from server');
  } else {
    // Request setup error
    console.error('Error:', error.message);
  }
}
```

---

## Testing

### Test with cURL

```bash
# Test health
curl http://localhost:8000/health

# Test search
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test product", "top_k": 5}'

# Test GET search
curl "http://localhost:8000/search?q=test&top_k=5"
```

### Test with Python

```python
import requests

# Test search
response = requests.post('http://localhost:8000/search', json={
    'query': 'blue cotton saree',
    'top_k': 10
})

print(response.json())
```

### Test with Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:8000/search`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "query": "blue cotton saree",
  "top_k": 10
}
```
6. Send request

---

## Production Deployment

### Environment Variables

Create `.env` file:
```
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=https://yourfrontend.com
INDEX_PATH=/path/to/product_index.faiss
CSV_PATH=/path/to/cleaned_products.csv
```

### FastAPI Production

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn api_fastapi:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Flask Production

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn api_flask:app -w 4 --bind 0.0.0.0:5000
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "api_fastapi:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Performance Tips

1. **Load Once**: Model and index loaded at startup (already implemented)
2. **Connection Pooling**: Use connection pooling for database queries
3. **Caching**: Cache popular queries with Redis
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Monitoring**: Add logging and monitoring (Prometheus, Grafana)
6. **Load Balancing**: Use nginx or similar for load balancing

---

## CORS Configuration

### Allow Specific Origins (Production)

**FastAPI:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourfrontend.com"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)
```

**Flask:**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourfrontend.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## Troubleshooting

### Issue: CORS Error
**Solution**: Ensure CORS is enabled and frontend origin is allowed

### Issue: 503 Service Unavailable
**Solution**: Check if FAISS index and model loaded successfully at startup

### Issue: Slow Response
**Solution**: 
- Check if model is loaded once (not per request)
- Reduce `top_k` value
- Use batch search for multiple queries

### Issue: Connection Refused
**Solution**: Ensure server is running and firewall allows the port

---

## Next Steps

1. ✅ Start the API server
2. ✅ Test with cURL or Postman
3. ✅ Integrate with your React frontend
4. ✅ Add authentication if needed
5. ✅ Deploy to production server
6. ✅ Set up monitoring and logging

---

## Support

For issues or questions:
- Check API docs: http://localhost:8000/docs (FastAPI)
- Review logs for error messages
- Test endpoints with cURL first
