"""
Configuration Management
Centralized configuration using environment variables
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # API Settings
    APP_NAME: str = "Product Search API"
    APP_VERSION: str = "2.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    
    # CORS Settings
    CORS_ORIGINS: list = ["*"]  # In production, specify exact origins
    
    # Search Engine Settings
    FAISS_INDEX_PATH: str = r"C:\Users\rachi\VSTRA\Data\product_index.faiss"
    EMBEDDINGS_PATH: str = r"C:\Users\rachi\VSTRA\Data\embeddings.npy"
    PRODUCTS_CSV_PATH: str = r"C:\Users\rachi\VSTRA\Data\cleaned_products.csv"
    MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # Search Limits
    MAX_TOP_K: int = 50
    DEFAULT_TOP_K: int = 10
    MAX_BATCH_QUERIES: int = 50
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Caching
    ENABLE_CACHE: bool = True
    CACHE_TTL: int = 3600  # 1 hour in seconds
    CACHE_MAX_SIZE: int = 1000  # LRU cache size
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100  # requests per window
    RATE_LIMIT_WINDOW: int = 60  # window in seconds
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json or text
    
    # Redis (Optional - for distributed caching)
    REDIS_URL: Optional[str] = None
    REDIS_ENABLED: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to ensure settings are loaded only once.
    """
    return Settings()


# Global settings instance
settings = get_settings()
