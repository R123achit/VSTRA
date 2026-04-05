# Semantic Search Integration Guide

## Overview
Your Vstra e-commerce website now includes AI-powered semantic search using FAISS and sentence-transformers. This allows users to search for products using natural language descriptions.

## What Was Done

### 1. Removed Testing File
- Deleted `website.html` (standalone testing interface)

### 2. Created Components
- **`components/SemanticSearch.js`**: Beautiful modal component for AI search
  - Natural language search input
  - Example queries for quick testing
  - Real-time product results with images
  - Responsive grid layout

### 3. Created API Endpoint
- **`pages/api/search/semantic.js`**: Backend API that connects to Python FastAPI
  - Calls your Python semantic search engine
  - Falls back to regular text search if Python API is unavailable
  - Returns formatted product results

### 4. Updated Navbar
- Added AI search button (sparkle icon) in the navigation bar
- Opens semantic search modal when clicked
- Only visible on desktop (hidden on mobile for cleaner UI)

## How to Use

### Step 1: Start the Python API Server

Navigate to your Data directory and start the FastAPI server:

```bash
cd Data
python api_fastapi.py
```

The server will start on `http://localhost:8000`

You should see:
```
🚀 Starting FastAPI Product Search Server
📍 Server will be available at:
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
```

### Step 2: Configure Environment Variable (Optional)

If your Python API runs on a different port or host, create/update `.env.local`:

```env
PYTHON_API_URL=http://localhost:8000
```

### Step 3: Start Your Next.js Application

```bash
npm run dev
```

### Step 4: Test the Integration

1. Open your website in a browser
2. Look for the sparkle icon (✨) in the navigation bar
3. Click it to open the AI search modal
4. Try example queries like:
   - "blue cotton saree for women"
   - "black formal trouser men"
   - "sports bra women"
   - "red silk saree wedding"

## Features

### Natural Language Search
Users can search using descriptive phrases instead of exact product names:
- ✅ "comfortable running shoes for men" 
- ✅ "elegant evening dress for party"
- ✅ "casual cotton shirt blue color"

### Semantic Understanding
The AI understands context and finds similar products even if exact words don't match:
- Search: "workout clothes" → Finds: activewear, sports bras, gym shorts
- Search: "formal office wear" → Finds: blazers, trousers, dress shirts

### Fallback Mechanism
If the Python API is unavailable, the system automatically falls back to regular text search, ensuring your website always works.

## File Structure

```
VSTRA/
├── components/
│   ├── SemanticSearch.js          # AI search modal component
│   └── Navbar.js                  # Updated with AI search button
├── pages/
│   └── api/
│       └── search/
│           └── semantic.js        # API endpoint for semantic search
├── Data/
│   ├── api_fastapi.py            # Python FastAPI server
│   ├── semantic_search.py        # Search engine logic
│   ├── product_index.faiss       # FAISS index file
│   ├── cleaned_products.csv      # Product data
│   └── embeddings.npy            # Product embeddings
└── SEMANTIC_SEARCH_INTEGRATION.md # This file
```

## API Endpoints

### POST /api/search/semantic
Search for products using natural language.

**Request:**
```json
{
  "query": "blue cotton saree for women",
  "top_k": 10
}
```

**Response:**
```json
{
  "success": true,
  "query": "blue cotton saree for women",
  "total": 10,
  "products": [
    {
      "_id": "...",
      "name": "Blue Cotton Saree",
      "price": 1299,
      "images": ["..."],
      "category": "women",
      ...
    }
  ],
  "source": "semantic_search"
}
```

### GET /api/search/semantic
Alternative GET endpoint for browser testing.

**Example:**
```
http://localhost:3000/api/search/semantic?q=blue%20saree&top_k=5
```

## Troubleshooting

### Python API Not Starting
**Error:** `ModuleNotFoundError: No module named 'faiss'`

**Solution:**
```bash
cd Data
pip install -r requirements.txt
```

### FAISS Index Not Found
**Error:** `FileNotFoundError: FAISS index not found`

**Solution:** Generate the index:
```bash
cd Data
python generate_embeddings.py
```

### API Connection Failed
**Error:** Search returns fallback results

**Check:**
1. Is Python API running? Visit `http://localhost:8000`
2. Check console for error messages
3. Verify `PYTHON_API_URL` in `.env.local`

### No Results Found
**Possible causes:**
1. Product database is empty
2. Search query is too specific
3. FAISS index doesn't match current products

**Solution:** Try broader search terms or regenerate embeddings

## Performance Tips

### For Production

1. **Update CORS settings** in `api_fastapi.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Disable auto-reload** in `api_fastapi.py`:
```python
uvicorn.run(
    "api_fastapi:app",
    host="0.0.0.0",
    port=8000,
    reload=False,  # Disable in production
    log_level="info"
)
```

3. **Use environment variables** for file paths in `semantic_search.py`

4. **Deploy Python API separately** (e.g., on AWS, Heroku, or Railway)

5. **Add caching** for frequently searched queries

## Next Steps

### Enhancements You Can Add

1. **Search History**: Track popular searches
2. **Autocomplete**: Show suggestions as user types
3. **Filters**: Add price range, category filters to semantic search
4. **Analytics**: Track which searches lead to purchases
5. **Personalization**: Use user history to improve results
6. **Voice Search**: Add speech-to-text for voice queries
7. **Image Search**: Search by uploading product images

### Integration with Existing Features

The semantic search works alongside your existing features:
- Regular search bar still works
- Category filters still apply
- Shopping cart integration
- Wishlist functionality
- User authentication

## Support

For issues or questions:
1. Check the Python API logs
2. Check browser console for errors
3. Verify all dependencies are installed
4. Ensure FAISS index is generated

## Credits

- **FAISS**: Facebook AI Similarity Search
- **Sentence Transformers**: Hugging Face
- **FastAPI**: Modern Python web framework
- **Next.js**: React framework for production
