# Semantic Search API - Quick Reference

## Overview
Production-ready semantic search for product recommendations using FAISS and sentence-transformers.

## Files
- `semantic_search.py` - Main search module
- `product_index.faiss` - FAISS index (95MB)
- `embeddings.npy` - Product embeddings (95MB)
- `cleaned_products.csv` - Product data

## Quick Start

### 1. Basic Search
```python
from semantic_search import ProductSearchEngine, ProductMapper

# Initialize once (at app startup)
search_engine = ProductSearchEngine()
mapper = ProductMapper()

# Search
query = "blue cotton saree"
distances, indices = search_engine.search(query, top_k=10)

# Get product details
products = mapper.get_products(indices, distances)

for product in products:
    print(product['title'], product['sold_price'])
```

### 2. Batch Search (Multiple Queries)
```python
queries = ["black trouser", "sports bra", "silk saree"]
distances, indices = search_engine.batch_search(queries, top_k=5)

# Process each query's results
for i, query in enumerate(queries):
    products = mapper.get_products(indices[i], distances[i])
    print(f"Results for: {query}")
    for p in products:
        print(f"  - {p['title']}")
```

### 3. Flask API Integration
```python
from flask import Flask, request, jsonify
from semantic_search import ProductSearchEngine, ProductMapper

app = Flask(__name__)

# Initialize ONCE at startup (not per request!)
search_engine = ProductSearchEngine()
mapper = ProductMapper()

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))
    
    try:
        distances, indices = search_engine.search(query, top_k=limit)
        products = mapper.get_products(indices, distances)
        
        return jsonify({
            'success': True,
            'query': query,
            'results': products
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)
```

### 4. FastAPI Integration
```python
from fastapi import FastAPI, Query
from semantic_search import ProductSearchEngine, ProductMapper

app = FastAPI()

# Initialize at startup
search_engine = ProductSearchEngine()
mapper = ProductMapper()

@app.get("/search")
async def search(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        distances, indices = search_engine.search(q, top_k=limit)
        products = mapper.get_products(indices, distances)
        
        return {
            "success": True,
            "query": q,
            "total": len(products),
            "products": products
        }
    except ValueError as e:
        return {"success": False, "error": str(e)}
```

## API Reference

### ProductSearchEngine

#### `__init__(index_path, model_name)`
Initialize search engine.
- `index_path`: Path to FAISS index file
- `model_name`: Sentence-transformers model name (default: "all-MiniLM-L6-v2")

#### `search(query, top_k=10)`
Search for similar products.
- `query`: Search string (e.g., "blue cotton saree")
- `top_k`: Number of results to return
- Returns: `(distances, indices)` - numpy arrays

#### `batch_search(queries, top_k=10)`
Search multiple queries efficiently.
- `queries`: List of search strings
- `top_k`: Results per query
- Returns: `(distances, indices)` - 2D numpy arrays

### ProductMapper

#### `__init__(csv_path)`
Initialize with product data.
- `csv_path`: Path to cleaned products CSV

#### `get_products(indices, distances=None)`
Convert indices to product dictionaries.
- `indices`: Array of product indices from FAISS
- `distances`: Optional similarity scores
- Returns: List of product dictionaries

## Performance Tips

1. **Initialize Once**: Load model and index at application startup, not per request
2. **Batch Queries**: Use `batch_search()` for multiple queries (more efficient)
3. **Cache Results**: Consider caching popular queries
4. **Async Operations**: Wrap search in async functions for FastAPI
5. **Connection Pooling**: Use connection pooling for database queries

## Error Handling

```python
try:
    distances, indices = search_engine.search(query, top_k=10)
    products = mapper.get_products(indices, distances)
except ValueError as e:
    # Invalid input (empty query, negative top_k)
    print(f"Invalid input: {e}")
except RuntimeError as e:
    # Search failed
    print(f"Search error: {e}")
except FileNotFoundError as e:
    # Missing files
    print(f"File not found: {e}")
```

## Example Queries

Good queries:
- "blue cotton saree for women"
- "black formal trouser men"
- "sports bra women"
- "silk wedding saree red"
- "casual shirt men"

## Similarity Scores

- Lower distance = More similar
- Typical range: 0.0 to 2.0
- < 0.5: Very similar
- 0.5-1.0: Moderately similar
- > 1.0: Less similar

## Testing

Run the examples:
```bash
python semantic_search.py
```

## Production Checklist

- [ ] Load model/index once at startup
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Add logging
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Add caching layer
- [ ] Test with concurrent requests
- [ ] Optimize batch size
- [ ] Set up health checks

## Memory Usage

- FAISS Index: ~95 MB
- Model: ~90 MB
- Total: ~185 MB in memory

## Scaling

For high traffic:
1. Use Redis for caching
2. Deploy multiple instances
3. Consider GPU acceleration for encoding
4. Use async/await patterns
5. Implement request queuing
