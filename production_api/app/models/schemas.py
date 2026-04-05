"""
Pydantic Models for Request/Response Validation
Ensures type safety and automatic validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum


class SortOrder(str, Enum):
    """Sorting options"""
    SIMILARITY = "similarity"
    PRICE_LOW_HIGH = "price_asc"
    PRICE_HIGH_LOW = "price_desc"


class SearchRequest(BaseModel):
    """Request model for product search"""
    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Search query",
        example="blue cotton saree for women"
    )
    top_k: int = Field(
        10,
        ge=1,
        le=50,
        description="Number of results to return",
        example=10
    )
    page: int = Field(
        1,
        ge=1,
        description="Page number for pagination",
        example=1
    )
    page_size: int = Field(
        20,
        ge=1,
        le=100,
        description="Number of items per page",
        example=20
    )
    
    # Filters
    min_price: Optional[float] = Field(
        None,
        ge=0,
        description="Minimum price filter",
        example=100.0
    )
    max_price: Optional[float] = Field(
        None,
        ge=0,
        description="Maximum price filter",
        example=5000.0
    )
    category: Optional[str] = Field(
        None,
        description="Category filter",
        example="saree"
    )
    brand: Optional[str] = Field(
        None,
        description="Brand filter",
        example="Blue Wish"
    )
    
    # Sorting
    sort_by: SortOrder = Field(
        SortOrder.SIMILARITY,
        description="Sort order",
        example="similarity"
    )
    
    @validator('query')
    def validate_query(cls, v):
        """Ensure query is not just whitespace"""
        if not v.strip():
            raise ValueError("Query cannot be empty or whitespace")
        return v.strip()
    
    @validator('max_price')
    def validate_price_range(cls, v, values):
        """Ensure max_price > min_price"""
        if v is not None and 'min_price' in values and values['min_price'] is not None:
            if v < values['min_price']:
                raise ValueError("max_price must be greater than min_price")
        return v


class ProductResponse(BaseModel):
    """Response model for a single product"""
    id: int = Field(..., description="Product ID")
    title: str = Field(..., description="Product title")
    brand: Optional[str] = Field(None, description="Brand name")
    price: float = Field(..., description="Product price")
    category: Optional[str] = Field(None, description="Product category")
    image: Optional[str] = Field(None, description="Product image URL")
    url: Optional[str] = Field(None, description="Product page URL")
    similarity_score: float = Field(..., description="Similarity score (lower = more similar)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 12345,
                "title": "Printed Fashion Cotton Silk Saree",
                "brand": "Blue Wish",
                "price": 438.0,
                "category": "saree",
                "image": None,
                "url": None,
                "similarity_score": 0.3858
            }
        }


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_items: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_prev: bool = Field(..., description="Whether there is a previous page")


class SearchResponse(BaseModel):
    """Response model for search results"""
    success: bool = Field(..., description="Whether search was successful")
    query: str = Field(..., description="Original search query")
    total_results: int = Field(..., description="Total number of results found")
    products: List[ProductResponse] = Field(..., description="List of matching products")
    pagination: PaginationMeta = Field(..., description="Pagination information")
    filters_applied: dict = Field(..., description="Filters that were applied")
    execution_time_ms: float = Field(..., description="Query execution time in milliseconds")


class BatchSearchRequest(BaseModel):
    """Request model for batch search"""
    queries: List[str] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of search queries",
        example=["blue saree", "black trouser"]
    )
    top_k: int = Field(
        10,
        ge=1,
        le=50,
        description="Number of results per query"
    )
    
    @validator('queries')
    def validate_queries(cls, v):
        """Validate all queries"""
        if not v:
            raise ValueError("At least one query is required")
        
        # Remove empty queries
        valid_queries = [q.strip() for q in v if q.strip()]
        
        if not valid_queries:
            raise ValueError("All queries are empty")
        
        if len(valid_queries) > 50:
            raise ValueError("Maximum 50 queries allowed")
        
        return valid_queries


class BatchSearchResponse(BaseModel):
    """Response model for batch search"""
    success: bool = Field(..., description="Whether batch search was successful")
    total_queries: int = Field(..., description="Number of queries processed")
    results: List[dict] = Field(..., description="Results for each query")
    execution_time_ms: float = Field(..., description="Total execution time in milliseconds")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    search_engine_loaded: bool = Field(..., description="Whether search engine is loaded")
    total_products: int = Field(..., description="Total number of indexed products")
    uptime_seconds: float = Field(..., description="Service uptime in seconds")


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    request_id: Optional[str] = Field(None, description="Request ID for tracking")
