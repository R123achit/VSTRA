"""
Main FastAPI Application
Production-grade setup with middleware, error handling, and monitoring
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

from .core.config import settings
from .core.logging import logger
from .api.routes import router
from .middleware.rate_limit import RateLimitMiddleware
from .middleware.request_logging import RequestLoggingMiddleware
from .services.search_service import search_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    Ensures search service is initialized before accepting requests.
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("Initializing search service...")
    
    try:
        # Search service is already initialized as singleton
        if not search_service.is_ready():
            raise RuntimeError("Search service failed to initialize")
        
        logger.info("✅ Search service ready")
        logger.info(f"✅ Indexed {search_service.get_total_products()} products")
        logger.info(f"🚀 API ready to serve requests on {settings.HOST}:{settings.PORT}")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise
    
    yield  # Application runs here
    
    # Shutdown
    logger.info("Shutting down application...")
    logger.info("Cleanup complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade semantic product search API using FAISS and sentence-transformers",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# ============================================
# MIDDLEWARE CONFIGURATION
# ============================================

# CORS Middleware (must be first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Rate Limiting Middleware
if settings.RATE_LIMIT_ENABLED:
    app.add_middleware(
        RateLimitMiddleware,
        requests=settings.RATE_LIMIT_REQUESTS,
        window=settings.RATE_LIMIT_WINDOW
    )


# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": "Endpoint not found",
            "path": str(request.url.path)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error"
        }
    )


@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc):
    """Handle rate limit errors"""
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "Rate limit exceeded",
            "detail": str(exc.detail) if hasattr(exc, 'detail') else "Too many requests"
        },
        headers=exc.headers if hasattr(exc, 'headers') else {}
    )


# ============================================
# ROUTES
# ============================================

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
        "endpoints": {
            "search": f"{settings.API_PREFIX}/search",
            "batch_search": f"{settings.API_PREFIX}/batch-search",
            "categories": f"{settings.API_PREFIX}/categories",
            "brands": f"{settings.API_PREFIX}/brands"
        }
    }


# Include API routes with prefix
app.include_router(router, prefix=settings.API_PREFIX, tags=["search"])


# ============================================
# METRICS ENDPOINT (Optional)
# ============================================

@app.get("/metrics")
async def metrics():
    """
    Basic metrics endpoint.
    In production, use Prometheus or similar.
    """
    return {
        "total_products": search_service.get_total_products(),
        "cache_enabled": settings.ENABLE_CACHE,
        "rate_limit_enabled": settings.RATE_LIMIT_ENABLED,
        "service_ready": search_service.is_ready()
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
