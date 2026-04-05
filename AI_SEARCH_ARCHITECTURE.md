# 🏗️ AI Search Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VSTRA E-COMMERCE                             │
│                     AI-Powered Semantic Search                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐         ┌──────────────┐                          │
│  │   Navbar.js  │────────▶│ SemanticSearch│                          │
│  │              │         │    .js        │                          │
│  │  [✨ Button] │         │   (Modal)     │                          │
│  └──────────────┘         └───────┬───────┘                          │
│                                   │                                  │
│                                   │ axios.post()                     │
│                                   ▼                                  │
└───────────────────────────────────┼──────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────────┐
│                          API LAYER│                                  │
├───────────────────────────────────┼──────────────────────────────────┤
│                                   ▼                                  │
│              ┌────────────────────────────────┐                      │
│              │  /api/search/semantic.js       │                      │
│              │  (Next.js API Route)           │                      │
│              │                                │                      │
│              │  • Receives query              │                      │
│              │  • Calls Python API            │                      │
│              │  • Fallback to text search     │                      │
│              │  • Returns products            │                      │
│              └────────┬───────────────────────┘                      │
│                       │                                              │
│                       │ HTTP POST                                    │
│                       ▼                                              │
└───────────────────────┼──────────────────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────────────────┐
│                  PYTHON AI LAYER                                     │
├───────────────────────┼──────────────────────────────────────────────┤
│                       ▼                                              │
│       ┌───────────────────────────────────┐                          │
│       │   FastAPI Server (Port 8000)      │                          │
│       │   api_fastapi.py                  │                          │
│       │                                   │                          │
│       │   • POST /search                  │                          │
│       │   • GET /search                   │                          │
│       │   • POST /batch-search            │                          │
│       │   • GET /health                   │                          │
│       └───────────┬───────────────────────┘                          │
│                   │                                                  │
│                   │ Uses                                             │
│                   ▼                                                  │
│       ┌───────────────────────────────────┐                          │
│       │   semantic_search.py              │                          │
│       │                                   │                          │
│       │   ProductSearchEngine:            │                          │
│       │   • Loads FAISS index             │                          │
│       │   • Loads ML model                │                          │
│       │   • Converts query to embedding   │                          │
│       │   • Searches index                │                          │
│       │                                   │                          │
│       │   ProductMapper:                  │                          │
│       │   • Maps indices to products      │                          │
│       │   • Returns product details       │                          │
│       └───────────┬───────────────────────┘                          │
│                   │                                                  │
│                   │ Reads                                            │
│                   ▼                                                  │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────────────┐
│                DATA LAYER                                            │
├───────────────────┼──────────────────────────────────────────────────┤
│                   │                                                  │
│   ┌───────────────┴──────────┬──────────────┬──────────────┐        │
│   │                          │              │              │        │
│   ▼                          ▼              ▼              ▼        │
│ ┌──────────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│ │  FAISS   │    │  Embeddings  │  │   Products   │  │ MongoDB  │  │
│ │  Index   │    │    .npy      │  │    .csv      │  │          │  │
│ │          │    │              │  │              │  │ Products │  │
│ │ product_ │    │ Pre-computed │  │ Product data │  │ Reviews  │  │
│ │ index.   │    │ vectors for  │  │ for mapping  │  │ Orders   │  │
│ │ faiss    │    │ all products │  │ indices      │  │ Users    │  │
│ └──────────┘    └──────────────┘  └──────────────┘  └──────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Initiates Search

```
User clicks ✨ button
    ↓
Modal opens (SemanticSearch.js)
    ↓
User types: "blue cotton saree for women"
    ↓
User clicks "Search" or presses Enter
```

### 2. Frontend Processing

```
SemanticSearch.js
    ↓
Validates query (not empty)
    ↓
Shows loading state
    ↓
Makes API call:
    axios.post('/api/search/semantic', {
        query: "blue cotton saree for women",
        top_k: 12
    })
```

### 3. Next.js API Processing

```
/api/search/semantic.js receives request
    ↓
Extracts query and top_k
    ↓
Validates input
    ↓
Calls Python API:
    axios.post('http://localhost:8000/search', {
        query: query,
        top_k: top_k
    })
    ↓
If Python API fails:
    ↓
    Fallback to MongoDB text search:
    Product.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    })
```

### 4. Python AI Processing

```
FastAPI receives POST /search
    ↓
semantic_search.py
    ↓
ProductSearchEngine.search()
    ↓
1. Convert query to embedding:
   model.encode("blue cotton saree for women")
   → [0.123, -0.456, 0.789, ...]
    ↓
2. Search FAISS index:
   index.search(query_embedding, top_k=12)
   → distances: [0.12, 0.15, 0.18, ...]
   → indices: [42, 156, 89, ...]
    ↓
3. Map indices to products:
   ProductMapper.get_products(indices, distances)
   → Reads cleaned_products.csv
   → Returns product details
    ↓
4. Format response:
   {
       "success": true,
       "query": "blue cotton saree for women",
       "total_results": 12,
       "products": [...]
   }
```

### 5. Response Processing

```
Next.js API receives Python response
    ↓
Optionally enriches with MongoDB data
    ↓
Returns to frontend:
    {
        "success": true,
        "query": "blue cotton saree for women",
        "total": 12,
        "products": [...],
        "source": "semantic_search"
    }
```

### 6. Frontend Display

```
SemanticSearch.js receives response
    ↓
Hides loading state
    ↓
Updates results state
    ↓
Renders product grid:
    - Product images
    - Product names
    - Prices
    - Categories
    ↓
User clicks product
    ↓
Navigates to product detail page
```

## Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Navbar                                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ [Logo] [Search] [✨ AI] [❤️] [🛒] [👤]            │     │
│  └────────────────────────────────────────────────────┘     │
│                         │                                    │
│                         │ onClick                            │
│                         ▼                                    │
│  SemanticSearch Modal                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  🔍 AI-Powered Search                              │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │ Search: [blue cotton saree for women]    │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                    │     │
│  │  Try these:                                        │     │
│  │  [blue saree] [black trouser] [sports bra]        │     │
│  │                                                    │     │
│  │  Results:                                          │     │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │     │
│  │  │ 📦 │ │ 📦 │ │ 📦 │ │ 📦 │                     │     │
│  │  └────┘ └────┘ └────┘ └────┘                     │     │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │     │
│  │  │ 📦 │ │ 📦 │ │ 📦 │ │ 📦 │                     │     │
│  │  └────┘ └────┘ └────┘ └────┘                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Component State                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Navbar.js                                                   │
│  ├─ showSemanticSearch: boolean                             │
│  └─ setShowSemanticSearch: function                         │
│                                                              │
│  SemanticSearch.js                                           │
│  ├─ query: string                                            │
│  ├─ results: Product[]                                       │
│  ├─ loading: boolean                                         │
│  ├─ searched: boolean                                        │
│  ├─ setQuery: function                                       │
│  ├─ setResults: function                                     │
│  ├─ setLoading: function                                     │
│  └─ setSearched: function                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Scenarios                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Scenario 1: Python API Down                                │
│  ┌────────────────────────────────────────────────┐         │
│  │ Next.js API tries Python                       │         │
│  │         ↓                                      │         │
│  │ Connection Error                               │         │
│  │         ↓                                      │         │
│  │ Catch block triggered                          │         │
│  │         ↓                                      │         │
│  │ Fallback to MongoDB text search                │         │
│  │         ↓                                      │         │
│  │ Return results with warning                    │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  Scenario 2: No Results Found                               │
│  ┌────────────────────────────────────────────────┐         │
│  │ Search completes successfully                  │         │
│  │         ↓                                      │         │
│  │ products.length === 0                          │         │
│  │         ↓                                      │         │
│  │ Show "No products found" message               │         │
│  │         ↓                                      │         │
│  │ Suggest trying different query                 │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  Scenario 3: Invalid Query                                  │
│  ┌────────────────────────────────────────────────┐         │
│  │ User submits empty query                       │         │
│  │         ↓                                      │         │
│  │ Frontend validation fails                      │         │
│  │         ↓                                      │         │
│  │ API call prevented                             │         │
│  │         ↓                                      │         │
│  │ No error shown (button disabled)               │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                  Optimization Strategies                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Model Loading (Python)                                  │
│     ┌──────────────────────────────────────┐               │
│     │ Load once at startup                 │               │
│     │ Reuse for all requests               │               │
│     │ No repeated initialization           │               │
│     └──────────────────────────────────────┘               │
│                                                              │
│  2. FAISS Index                                             │
│     ┌──────────────────────────────────────┐               │
│     │ Pre-computed embeddings              │               │
│     │ O(log n) search complexity           │               │
│     │ Memory-mapped for large datasets     │               │
│     └──────────────────────────────────────┘               │
│                                                              │
│  3. API Caching (Future)                                    │
│     ┌──────────────────────────────────────┐               │
│     │ Cache frequent queries               │               │
│     │ Redis for distributed caching        │               │
│     │ TTL: 1 hour                          │               │
│     └──────────────────────────────────────┘               │
│                                                              │
│  4. Frontend Optimization                                   │
│     ┌──────────────────────────────────────┐               │
│     │ Debounce search input                │               │
│     │ Lazy load images                     │               │
│     │ Virtual scrolling for many results   │               │
│     └──────────────────────────────────────┘               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Measures                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Input Validation                                        │
│     • Query length limits (max 500 chars)                   │
│     • Sanitize special characters                           │
│     • Prevent SQL injection                                 │
│                                                              │
│  2. Rate Limiting                                           │
│     • Max 100 requests per minute per IP                    │
│     • Prevent abuse                                         │
│     • Protect API resources                                 │
│                                                              │
│  3. CORS Configuration                                      │
│     • Whitelist specific domains                            │
│     • No wildcard in production                             │
│     • Secure credentials                                    │
│                                                              │
│  4. API Authentication (Future)                             │
│     • API keys for Python API                               │
│     • JWT tokens for user sessions                          │
│     • OAuth for third-party access                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Production Setup                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Vercel)                                          │
│  ┌────────────────────────────────────────────────┐         │
│  │ Next.js App                                    │         │
│  │ • Static pages                                 │         │
│  │ • API routes                                   │         │
│  │ • CDN for assets                               │         │
│  └────────────────┬───────────────────────────────┘         │
│                   │                                          │
│                   │ HTTPS                                    │
│                   ▼                                          │
│  Python API (Heroku/Railway)                                │
│  ┌────────────────────────────────────────────────┐         │
│  │ FastAPI Server                                 │         │
│  │ • FAISS index                                  │         │
│  │ • ML model                                     │         │
│  │ • Auto-scaling                                 │         │
│  └────────────────┬───────────────────────────────┘         │
│                   │                                          │
│                   │ Reads                                    │
│                   ▼                                          │
│  Database (MongoDB Atlas)                                   │
│  ┌────────────────────────────────────────────────┐         │
│  │ Product Data                                   │         │
│  │ • Replicated                                   │         │
│  │ • Backed up                                    │         │
│  │ • Indexed                                      │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Monitoring & Analytics

```
┌─────────────────────────────────────────────────────────────┐
│                    Metrics to Track                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Search Metrics                                             │
│  • Total searches per day                                   │
│  • Average response time                                    │
│  • Success rate                                             │
│  • Fallback usage rate                                      │
│                                                              │
│  User Behavior                                              │
│  • Popular search queries                                   │
│  • Click-through rate                                       │
│  • Conversion rate                                          │
│  • Bounce rate                                              │
│                                                              │
│  System Health                                              │
│  • API uptime                                               │
│  • Error rate                                               │
│  • Memory usage                                             │
│  • CPU usage                                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**This architecture provides a scalable, maintainable, and performant AI search solution for Vstra e-commerce platform.**
