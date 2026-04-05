"""
Search Service Layer
Handles all search-related business logic with caching and filtering
"""

import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Tuple, Optional, Dict, Any
from functools import lru_cache
import hashlib
import time

from ..core.config import settings
from ..core.logging import logger


class SearchCache:
    """Simple LRU cache for search results"""
    
    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, Tuple[np.ndarray, np.ndarray, float]] = {}
        self.max_size = max_size
    
    def _generate_key(self, query: str, top_k: int) -> str:
        """Generate cache key from query and top_k"""
        key_str = f"{query}:{top_k}"
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, query: str, top_k: int) -> Optional[Tuple[np.ndarray, np.ndarray]]:
        """Get cached result if available and not expired"""
        key = self._generate_key(query, top_k)
        
        if key in self.cache:
            distances, indices, timestamp = self.cache[key]
            
            # Check if cache is still valid
            if time.time() - timestamp < settings.CACHE_TTL:
                logger.info(f"Cache hit for query: {query[:50]}")
                return distances, indices
            else:
                # Remove expired entry
                del self.cache[key]
        
        return None
    
    def set(self, query: str, top_k: int, distances: np.ndarray, indices: np.ndarray):
        """Cache search result"""
        key = self._generate_key(query, top_k)
        
        # Implement simple LRU by removing oldest if at capacity
        if len(self.cache) >= self.max_size:
            # Remove oldest entry (first item)
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        
        self.cache[key] = (distances, indices, time.time())


class SearchService:
    """
    Search service with FAISS index and ML model.
    Implements singleton pattern to ensure single instance.
    """
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SearchService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize search service (called only once)"""
        if self._initialized:
            return
        
        logger.info("Initializing Search Service...")
        
        self.model: Optional[SentenceTransformer] = None
        self.index: Optional[faiss.Index] = None
        self.products_df: Optional[pd.DataFrame] = None
        self.cache = SearchCache(max_size=settings.CACHE_MAX_SIZE) if settings.ENABLE_CACHE else None
        
        self._load_model()
        self._load_index()
        self._load_products()
        
        self._initialized = True
        logger.info("Search Service initialized successfully")
    
    def _load_model(self):
        """Load sentence-transformers model"""
        try:
            logger.info(f"Loading model: {settings.MODEL_NAME}")
            self.model = SentenceTransformer(settings.MODEL_NAME)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise RuntimeError(f"Model loading failed: {str(e)}")
    
    def _load_index(self):
        """Load FAISS index"""
        try:
            logger.info(f"Loading FAISS index from: {settings.FAISS_INDEX_PATH}")
            self.index = faiss.read_index(settings.FAISS_INDEX_PATH)
            logger.info(f"FAISS index loaded: {self.index.ntotal} vectors")
        except Exception as e:
            logger.error(f"Failed to load FAISS index: {str(e)}")
            raise RuntimeError(f"FAISS index loading failed: {str(e)}")
    
    def _load_products(self):
        """Load product data"""
        try:
            logger.info(f"Loading products from: {settings.PRODUCTS_CSV_PATH}")
            self.products_df = pd.read_csv(settings.PRODUCTS_CSV_PATH)
            
            # Clean data
            self.products_df['combined'] = self.products_df['combined'].fillna('')
            self.products_df = self.products_df[self.products_df['combined'].str.strip() != '']
            self.products_df.reset_index(drop=True, inplace=True)
            
            logger.info(f"Loaded {len(self.products_df)} products")
        except Exception as e:
            logger.error(f"Failed to load products: {str(e)}")
            raise RuntimeError(f"Product data loading failed: {str(e)}")
    
    def search(
        self,
        query: str,
        top_k: int = 10,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None
    ) -> Tuple[np.ndarray, np.ndarray, pd.DataFrame]:
        """
        Search for similar products with optional filters.
        
        Returns:
            Tuple of (distances, indices, filtered_products_df)
        """
        start_time = time.time()
        
        # Check cache first
        if self.cache and not any([min_price, max_price, category, brand]):
            cached_result = self.cache.get(query, top_k)
            if cached_result is not None:
                distances, indices = cached_result
                products = self._get_products_by_indices(indices)
                return distances, indices, products
        
        # Generate query embedding
        query_embedding = self.model.encode(
            [query],
            convert_to_numpy=True,
            show_progress_bar=False
        ).astype('float32')
        
        # Search FAISS index with larger k for filtering
        search_k = min(top_k * 5, self.index.ntotal)  # Get more results for filtering
        distances, indices = self.index.search(query_embedding, search_k)
        
        # Flatten arrays
        distances = distances[0]
        indices = indices[0]
        
        # Get products
        products = self._get_products_by_indices(indices)
        
        # Apply filters
        if min_price is not None:
            mask = products['sold_price'] >= min_price
            products = products[mask]
            distances = distances[mask.values]
            indices = indices[mask.values]
        
        if max_price is not None:
            mask = products['sold_price'] <= max_price
            products = products[mask]
            distances = distances[mask.values]
            indices = indices[mask.values]
        
        if category is not None:
            mask = products['category'].str.lower() == category.lower()
            products = products[mask]
            distances = distances[mask.values]
            indices = indices[mask.values]
        
        if brand is not None:
            mask = products['brand'].str.lower() == brand.lower()
            products = products[mask]
            distances = distances[mask.values]
            indices = indices[mask.values]
        
        # Limit to top_k after filtering
        if len(products) > top_k:
            products = products.iloc[:top_k]
            distances = distances[:top_k]
            indices = indices[:top_k]
        
        # Cache result if no filters applied
        if self.cache and not any([min_price, max_price, category, brand]):
            self.cache.set(query, top_k, distances, indices)
        
        elapsed = (time.time() - start_time) * 1000
        logger.info(f"Search completed in {elapsed:.2f}ms, found {len(products)} results")
        
        return distances, indices, products
    
    def batch_search(
        self,
        queries: List[str],
        top_k: int = 10
    ) -> List[Tuple[np.ndarray, np.ndarray, pd.DataFrame]]:
        """
        Search multiple queries efficiently.
        
        Returns:
            List of (distances, indices, products) for each query
        """
        start_time = time.time()
        
        # Generate embeddings for all queries at once
        query_embeddings = self.model.encode(
            queries,
            convert_to_numpy=True,
            show_progress_bar=False,
            batch_size=32
        ).astype('float32')
        
        # Search FAISS index
        distances, indices = self.index.search(query_embeddings, top_k)
        
        # Get products for each query
        results = []
        for i in range(len(queries)):
            products = self._get_products_by_indices(indices[i])
            results.append((distances[i], indices[i], products))
        
        elapsed = (time.time() - start_time) * 1000
        logger.info(f"Batch search completed in {elapsed:.2f}ms for {len(queries)} queries")
        
        return results
    
    def _get_products_by_indices(self, indices: np.ndarray) -> pd.DataFrame:
        """Get product data by indices"""
        valid_indices = indices[indices < len(self.products_df)]
        return self.products_df.iloc[valid_indices].copy()
    
    def get_total_products(self) -> int:
        """Get total number of indexed products"""
        return len(self.products_df) if self.products_df is not None else 0
    
    def is_ready(self) -> bool:
        """Check if service is ready"""
        return all([
            self.model is not None,
            self.index is not None,
            self.products_df is not None
        ])


# Global service instance (singleton)
search_service = SearchService()
