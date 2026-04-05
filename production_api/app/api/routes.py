"""
API Routes
All endpoint definitions with proper separation of concerns
"""

import time
import math
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List

from ..models.schemas import (
    SearchRequest,
    SearchResponse,
    BatchSearchRequest,
    BatchSearchResponse,
    ProductResponse,
    PaginationMeta,
    HealthResponse,
    SortOrder
)
from ..services.search_service import search_service
from ..core.config import settings
from ..core.logging import logger


router = APIRouter()

# Track service start time for uptime
service_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Returns service status and basic metrics.
    """
    return HealthResponse(
        status="healthy" if search_service.is_ready() else "unhealthy",
        version=settings.APP_VERSION,
        search_engine_loaded=search_service.is_ready(),
        total_products=search_service.get_total_products(),
        uptime_seconds=time.time() - service_start_time
    )


@router.post("/search", response_model=SearchResponse)
async def search_products(request: SearchRequest):
    """
    Search for products using semantic similarity.
    
    Supports:
    - Semantic search with FAISS
    - Filtering by price, category, brand
    - Pagination
    - Sorting by similarity or price
    """
    start_time = time.time()
    
    try:
        # Validate service is ready
        if not search_service.is_ready():
            raise HTTPException(
                status_code=503,
                detail="Search service not ready"
            )
        
        # Perform search with filters
        distances, indices, products_df = search_service.search(
            query=request.query,
            top_k=request.top_k * 2,  # Get more for pagination
            min_price=request.min_price,
            max_price=request.max_price,
            category=request.category,
            brand=request.brand
        )
        
        # Apply sorting
        if request.sort_by == SortOrder.PRICE_LOW_HIGH:
            sort_indices = products_df['sold_price'].argsort()
            products_df = products_df.iloc[sort_indices]
            distances = distances[sort_indices]
            indices = indices[sort_indices]
        elif request.sort_by == SortOrder.PRICE_HIGH_LOW:
            sort_indices = products_df['sold_price'].argsort()[::-1]
            products_df = products_df.iloc[sort_indices]
            distances = distances[sort_indices]
            indices = indices[sort_indices]
        # SIMILARITY is default (already sorted by FAISS)
        
        # Calculate pagination
        total_items = len(products_df)
        total_pages = math.ceil(total_items / request.page_size)
        start_idx = (request.page - 1) * request.page_size
        end_idx = start_idx + request.page_size
        
        # Get page of results
        page_products = products_df.iloc[start_idx:end_idx]
        page_distances = distances[start_idx:end_idx]
        page_indices = indices[start_idx:end_idx]
        
        # Format products
        products = []
        for i, (idx, row) in enumerate(page_products.iterrows()):
            products.append(ProductResponse(
                id=int(page_indices[i]),
                title=row.get('title', 'N/A'),
                brand=row.get('brand', None),
                price=float(row.get('sold_price', 0)),
                category=row.get('category', None),
                image=row.get('image_url', None),
                url=row.get('product_url', None),
                similarity_score=float(page_distances[i])
            ))
        
        # Create pagination metadata
        pagination = PaginationMeta(
            page=request.page,
            page_size=request.page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=request.page < total_pages,
            has_prev=request.page > 1
        )
        
        # Track filters applied
        filters_applied = {
            "min_price": request.min_price,
            "max_price": request.max_price,
            "category": request.category,
            "brand": request.brand,
            "sort_by": request.sort_by.value
        }
        
        execution_time = (time.time() - start_time) * 1000
        
        return SearchResponse(
            success=True,
            query=request.query,
            total_results=total_items,
            products=products,
            pagination=pagination,
            filters_applied=filters_applied,
            execution_time_ms=round(execution_time, 2)
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search", response_model=SearchResponse)
async def search_products_get(
    q: str = Query(..., min_length=1, description="Search query"),
    top_k: int = Query(10, ge=1, le=50, description="Number of results"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    min_price: float = Query(None, ge=0, description="Minimum price"),
    max_price: float = Query(None, ge=0, description="Maximum price"),
    category: str = Query(None, description="Category filter"),
    brand: str = Query(None, description="Brand filter"),
    sort_by: SortOrder = Query(SortOrder.SIMILARITY, description="Sort order")
):
    """
    GET version of search endpoint for easy browser testing.
    
    Example: /search?q=blue%20saree&top_k=10&page=1
    """
    request = SearchRequest(
        query=q,
        top_k=top_k,
        page=page,
        page_size=page_size,
        min_price=min_price,
        max_price=max_price,
        category=category,
        brand=brand,
        sort_by=sort_by
    )
    return await search_products(request)


@router.post("/batch-search", response_model=BatchSearchResponse)
async def batch_search_products(request: BatchSearchRequest):
    """
    Search multiple queries at once (more efficient).
    
    Useful for:
    - Bulk product recommendations
    - Related searches
    - A/B testing multiple queries
    """
    start_time = time.time()
    
    try:
        if not search_service.is_ready():
            raise HTTPException(
                status_code=503,
                detail="Search service not ready"
            )
        
        # Perform batch search
        results_list = search_service.batch_search(
            queries=request.queries,
            top_k=request.top_k
        )
        
        # Format results
        results = []
        for i, (distances, indices, products_df) in enumerate(results_list):
            products = []
            for j, (idx, row) in enumerate(products_df.iterrows()):
                products.append(ProductResponse(
                    id=int(indices[j]),
                    title=row.get('title', 'N/A'),
                    brand=row.get('brand', None),
                    price=float(row.get('sold_price', 0)),
                    category=row.get('category', None),
                    image=row.get('image_url', None),
                    url=row.get('product_url', None),
                    similarity_score=float(distances[j])
                ))
            
            results.append({
                "query": request.queries[i],
                "total_results": len(products),
                "products": [p.dict() for p in products]
            })
        
        execution_time = (time.time() - start_time) * 1000
        
        return BatchSearchResponse(
            success=True,
            total_queries=len(request.queries),
            results=results,
            execution_time_ms=round(execution_time, 2)
        )
        
    except Exception as e:
        logger.error(f"Batch search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/categories")
async def get_categories():
    """Get list of available product categories"""
    try:
        if not search_service.is_ready():
            raise HTTPException(status_code=503, detail="Search service not ready")
        
        categories = search_service.products_df['category'].dropna().unique().tolist()
        return {
            "success": True,
            "total": len(categories),
            "categories": sorted(categories)
        }
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/brands")
async def get_brands():
    """Get list of available brands"""
    try:
        if not search_service.is_ready():
            raise HTTPException(status_code=503, detail="Search service not ready")
        
        brands = search_service.products_df['brand'].dropna().unique().tolist()
        return {
            "success": True,
            "total": len(brands),
            "brands": sorted(brands)
        }
    except Exception as e:
        logger.error(f"Error fetching brands: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
