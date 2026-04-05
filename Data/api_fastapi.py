"""
Production-Ready FastAPI Backend for Semantic Product Search
Integrates FAISS + sentence-transformers for real-time recommendations
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import uvicorn
from contextlib import asynccontextmanager

# Import your semantic search module
from semantic_search import ProductSearchEngine, ProductMapper
from recommendation_engine import RecommendationEngine


# ============================================
# REQUEST/RESPONSE MODELS
# ============================================

class SearchRequest(BaseModel):
    """Request model for product search"""
    query: str = Field(..., min_length=1, max_length=500, description="Search query")
    top_k: int = Field(10, ge=1, le=100, description="Number of results to return")
    
    @validator('query')
    def validate_query(cls, v):
        """Ensure query is not just whitespace"""
        if not v.strip():
            raise ValueError("Query cannot be empty or whitespace")
        return v.strip()


class ProductResponse(BaseModel):
    """Response model for a single product"""
    id: Optional[int] = Field(None, description="Product ID")
    title: str = Field(..., description="Product title")
    brand: Optional[str] = Field(None, description="Brand name")
    price: float = Field(..., description="Product price")
    category: Optional[str] = Field(None, description="Product category")
    image: Optional[str] = Field(None, description="Product image URL")
    url: Optional[str] = Field(None, description="Product page URL")
    similarity_score: float = Field(..., description="Similarity score (lower = more similar)")


class SearchResponse(BaseModel):
    """Response model for search results"""
    success: bool = Field(..., description="Whether search was successful")
    query: str = Field(..., description="Original search query")
    total_results: int = Field(..., description="Number of results returned")
    products: List[ProductResponse] = Field(..., description="List of matching products")


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")


# ============================================
# GLOBAL STATE (Loaded once at startup)
# ============================================

search_engine: Optional[ProductSearchEngine] = None
product_mapper: Optional[ProductMapper] = None
recommendation_engine: Optional[RecommendationEngine] = None


# ============================================
# LIFESPAN MANAGEMENT
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager - loads resources on startup, cleans up on shutdown
    """
    global search_engine, product_mapper, recommendation_engine
    
    print("🚀 Starting up API server...")
    print("📦 Loading FAISS index and ML model...")
    
    try:
        # Load search engine and mapper ONCE at startup
        search_engine = ProductSearchEngine()
        product_mapper = ProductMapper()
        recommendation_engine = RecommendationEngine()
        print("✅ Search engine initialized successfully")
        print("✅ Recommendation engine initialized successfully")
        print(f"✅ Loaded {len(product_mapper.df)} products")
        print("🎉 API ready to serve requests!")
    except Exception as e:
        print(f"❌ Failed to initialize: {str(e)}")
        raise
    
    yield  # Server runs here
    
    # Cleanup on shutdown
    print("🛑 Shutting down API server...")


# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="Product Search API",
    description="Semantic product search using FAISS and sentence-transformers",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration (allows frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Product Search API is running",
        "version": "1.0.0",
        "endpoints": {
            "search": "/search",
            "docs": "/docs",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "search_engine_loaded": search_engine is not None,
        "product_mapper_loaded": product_mapper is not None,
        "recommendation_engine_loaded": recommendation_engine is not None,
        "total_products": len(product_mapper.df) if product_mapper else 0
    }


@app.post("/search", response_model=SearchResponse)
async def search_products(request: SearchRequest):
    """
    Search for similar products using semantic search.
    
    Example request:
    ```json
    {
        "query": "blue cotton saree for women",
        "top_k": 10
    }
    ```
    """
    try:
        # Validate that search engine is loaded
        if search_engine is None or product_mapper is None:
            raise HTTPException(
                status_code=503,
                detail="Search engine not initialized"
            )
        
        # Perform semantic search
        distances, indices = search_engine.search(
            query=request.query,
            top_k=request.top_k
        )
        
        # Map indices to product data
        products_raw = product_mapper.get_products(indices, distances)
        
        # Format products for response
        products = []
        for idx, product in enumerate(products_raw):
            # Handle NaN values
            brand = product.get('brand', None)
            if brand is not None and (isinstance(brand, float) and str(brand) == 'nan'):
                brand = None
            
            category = product.get('category', None)
            if category is not None and (isinstance(category, float) and str(category) == 'nan'):
                category = None
            
            image = product.get('image_url', None)
            if image is not None and (isinstance(image, float) and str(image) == 'nan'):
                image = None
            
            url = product.get('product_url', None)
            if url is not None and (isinstance(url, float) and str(url) == 'nan'):
                url = None
            
            products.append(ProductResponse(
                id=int(indices[idx]),
                title=product.get('title', 'N/A'),
                brand=brand,
                price=float(product.get('sold_price', 0)),
                category=category,
                image=image,
                url=url,
                similarity_score=float(product.get('similarity_score', 0))
            ))
        
        return SearchResponse(
            success=True,
            query=request.query,
            total_results=len(products),
            products=products
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/search", response_model=SearchResponse)
async def search_products_get(
    q: str = Query(..., min_length=1, description="Search query"),
    top_k: int = Query(10, ge=1, le=100, description="Number of results")
):
    """
    GET version of search endpoint (for easy browser testing).
    
    Example: /search?q=blue%20saree&top_k=5
    """
    request = SearchRequest(query=q, top_k=top_k)
    return await search_products(request)


@app.post("/batch-search")
async def batch_search_products(queries: List[str], top_k: int = 10):
    """
    Search multiple queries at once (more efficient).
    
    Example request:
    ```json
    {
        "queries": ["blue saree", "black trouser", "sports bra"],
        "top_k": 5
    }
    ```
    """
    try:
        if search_engine is None or product_mapper is None:
            raise HTTPException(status_code=503, detail="Search engine not initialized")
        
        # Validate queries
        if not queries or len(queries) == 0:
            raise HTTPException(status_code=400, detail="No queries provided")
        
        if len(queries) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 queries allowed")
        
        # Perform batch search
        distances, indices = search_engine.batch_search(queries, top_k=top_k)
        
        # Format results
        results = []
        for i, query in enumerate(queries):
            products_raw = product_mapper.get_products(indices[i], distances[i])
            
            products = []
            for j, p in enumerate(products_raw):
                # Handle NaN values
                brand = p.get('brand', None)
                if brand is not None and (isinstance(brand, float) and str(brand) == 'nan'):
                    brand = None
                
                category = p.get('category', None)
                if category is not None and (isinstance(category, float) and str(category) == 'nan'):
                    category = None
                
                image = p.get('image_url', None)
                if image is not None and (isinstance(image, float) and str(image) == 'nan'):
                    image = None
                
                url = p.get('product_url', None)
                if url is not None and (isinstance(url, float) and str(url) == 'nan'):
                    url = None
                
                products.append(ProductResponse(
                    id=int(indices[i][j]),
                    title=p.get('title', 'N/A'),
                    brand=brand,
                    price=float(p.get('sold_price', 0)),
                    category=category,
                    image=image,
                    url=url,
                    similarity_score=float(p.get('similarity_score', 0))
                ))
            
            results.append({
                "query": query,
                "total_results": len(products),
                "products": products
            })
        
        return {
            "success": True,
            "total_queries": len(queries),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Starting FastAPI Product Search Server")
    print("="*60)
    print("\n📍 Server will be available at:")
    print("   - API: http://localhost:8000")
    print("   - Docs: http://localhost:8000/docs")
    print("   - ReDoc: http://localhost:8000/redoc")
    print("\n💡 Press CTRL+C to stop the server\n")
    
    uvicorn.run(
        "api_fastapi:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (disable in production)
        log_level="info"
    )


# ============================================
# RECOMMENDATION ENDPOINTS
# ============================================

@app.get("/recommendations/similar/{product_id}")
async def get_similar_products(
    product_id: int,
    top_k: int = Query(10, ge=1, le=50, description="Number of similar products")
):
    """
    Get similar products based on content similarity.
    Like "Customers who viewed this also viewed" on Amazon.
    
    Example: /recommendations/similar/100?top_k=10
    """
    try:
        if recommendation_engine is None:
            raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
        
        products = recommendation_engine.get_similar_products(product_id, top_k)
        
        return {
            "success": True,
            "product_id": product_id,
            "recommendation_type": "similar_products",
            "total_results": len(products),
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/frequently-bought-together/{product_id}")
async def get_frequently_bought_together(
    product_id: int,
    top_k: int = Query(5, ge=1, le=20, description="Number of products")
):
    """
    Get products frequently bought together.
    Like "Frequently bought together" on Amazon.
    
    Example: /recommendations/frequently-bought-together/100?top_k=5
    """
    try:
        if recommendation_engine is None:
            raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
        
        products = recommendation_engine.get_frequently_bought_together(product_id, top_k)
        
        return {
            "success": True,
            "product_id": product_id,
            "recommendation_type": "frequently_bought_together",
            "total_results": len(products),
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations/personalized")
async def get_personalized_recommendations(
    user_history: List[int] = Query(..., description="List of product IDs user has viewed/purchased"),
    top_k: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get personalized recommendations based on user history.
    Like "Recommended for you" on Amazon/Flipkart.
    
    Example: POST /recommendations/personalized
    Body: {"user_history": [100, 200, 300], "top_k": 10}
    """
    try:
        if recommendation_engine is None:
            raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
        
        products = recommendation_engine.get_personalized_recommendations(user_history, top_k)
        
        return {
            "success": True,
            "user_history": user_history,
            "recommendation_type": "personalized",
            "total_results": len(products),
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/trending")
async def get_trending_products(
    top_k: int = Query(10, ge=1, le=50, description="Number of products"),
    category: Optional[str] = Query(None, description="Optional category filter")
):
    """
    Get trending/popular products.
    Like "Trending now" or "Best sellers" on e-commerce sites.
    
    Example: /recommendations/trending?top_k=10&category=saree
    """
    try:
        if recommendation_engine is None:
            raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
        
        products = recommendation_engine.get_trending_products(top_k, category)
        
        return {
            "success": True,
            "recommendation_type": "trending",
            "category": category,
            "total_results": len(products),
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/complete/{product_id}")
async def get_complete_recommendations(
    product_id: int,
    user_history: Optional[str] = Query(None, description="Comma-separated product IDs"),
    top_k: int = Query(6, ge=1, le=20, description="Number of items per recommendation type")
):
    """
    Get all types of recommendations for a product page.
    Returns similar products, frequently bought together, personalized, and trending.
    Like a complete Amazon product page with all recommendation sections.
    
    Example: /recommendations/complete/100?user_history=200,300,400&top_k=6
    """
    try:
        if recommendation_engine is None:
            raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
        
        # Parse user history
        history = []
        if user_history:
            try:
                history = [int(x.strip()) for x in user_history.split(',') if x.strip()]
            except ValueError:
                pass
        
        recommendations = recommendation_engine.get_complete_recommendations(
            product_id,
            history,
            top_k
        )
        
        return {
            "success": True,
            "product_id": product_id,
            "user_history": history,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
