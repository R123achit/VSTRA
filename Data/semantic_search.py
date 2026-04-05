"""
Production-Ready Semantic Search Module
Fast product search using FAISS and sentence-transformers
"""

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Tuple, Optional
import os


class ProductSearchEngine:
    """
    Efficient semantic search engine for product recommendations.
    Loads model and index once, reuses for multiple searches.
    """
    
    def __init__(
        self,
        index_path: str = r"C:\Users\rachi\VSTRA\Data\product_index.faiss",
        model_name: str = "all-MiniLM-L6-v2"
    ):
        """
        Initialize search engine by loading FAISS index and ML model.
        
        Args:
            index_path: Path to FAISS index file
            model_name: Name of sentence-transformers model
        """
        self.index_path = index_path
        self.model_name = model_name
        self.index = None
        self.model = None
        
        # Load resources
        self._load_index()
        self._load_model()
    
    def _load_index(self):
        """Load FAISS index from disk"""
        if not os.path.exists(self.index_path):
            raise FileNotFoundError(f"FAISS index not found at: {self.index_path}")
        
        self.index = faiss.read_index(self.index_path)
        print(f"✓ Loaded FAISS index with {self.index.ntotal} vectors")
    
    def _load_model(self):
        """Load sentence-transformers model"""
        try:
            self.model = SentenceTransformer(self.model_name)
            print(f"✓ Loaded model: {self.model_name}")
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {str(e)}")
    
    def _validate_query(self, query: str) -> bool:
        """
        Validate input query.
        
        Args:
            query: User search query
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not query or not isinstance(query, str):
            return False
        if len(query.strip()) == 0:
            return False
        return True
    
    def search(
        self,
        query: str,
        top_k: int = 10
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Search for similar products using semantic similarity.
        
        Args:
            query: User search query (e.g., "blue cotton saree")
            top_k: Number of results to return
            
        Returns:
            Tuple of (distances, indices):
                - distances: Array of similarity distances (lower = more similar)
                - indices: Array of product indices in original dataset
                
        Raises:
            ValueError: If query is invalid
            RuntimeError: If search fails
        """
        # Validate input
        if not self._validate_query(query):
            raise ValueError("Query must be a non-empty string")
        
        if top_k <= 0:
            raise ValueError("top_k must be positive")
        
        # Ensure top_k doesn't exceed index size
        top_k = min(top_k, self.index.ntotal)
        
        try:
            # Convert query to embedding
            query_embedding = self.model.encode(
                [query],
                convert_to_numpy=True,
                show_progress_bar=False
            ).astype('float32')
            
            # Search FAISS index
            distances, indices = self.index.search(query_embedding, top_k)
            
            # Return flattened arrays (remove batch dimension)
            return distances[0], indices[0]
            
        except Exception as e:
            raise RuntimeError(f"Search failed: {str(e)}")
    
    def batch_search(
        self,
        queries: List[str],
        top_k: int = 10
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Search multiple queries at once (more efficient).
        
        Args:
            queries: List of search queries
            top_k: Number of results per query
            
        Returns:
            Tuple of (distances, indices):
                - distances: 2D array [num_queries, top_k]
                - indices: 2D array [num_queries, top_k]
        """
        # Validate all queries
        valid_queries = [q for q in queries if self._validate_query(q)]
        
        if not valid_queries:
            raise ValueError("No valid queries provided")
        
        # Ensure top_k doesn't exceed index size
        top_k = min(top_k, self.index.ntotal)
        
        try:
            # Convert all queries to embeddings
            query_embeddings = self.model.encode(
                valid_queries,
                convert_to_numpy=True,
                show_progress_bar=False,
                batch_size=32
            ).astype('float32')
            
            # Search FAISS index
            distances, indices = self.index.search(query_embeddings, top_k)
            
            return distances, indices
            
        except Exception as e:
            raise RuntimeError(f"Batch search failed: {str(e)}")


class ProductMapper:
    """
    Maps FAISS indices back to actual product data.
    """
    
    def __init__(self, csv_path: str = r"C:\Users\rachi\VSTRA\Data\cleaned_products.csv"):
        """
        Initialize mapper with product data.
        
        Args:
            csv_path: Path to cleaned products CSV
        """
        import pandas as pd
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Product CSV not found at: {csv_path}")
        
        self.df = pd.read_csv(csv_path)
        # Remove empty combined entries (same as during embedding generation)
        self.df['combined'] = self.df['combined'].fillna('')
        self.df = self.df[self.df['combined'].str.strip() != '']
        self.df.reset_index(drop=True, inplace=True)
        
        print(f"✓ Loaded {len(self.df)} products")
    
    def get_products(
        self,
        indices: np.ndarray,
        distances: Optional[np.ndarray] = None
    ) -> List[dict]:
        """
        Convert FAISS indices to product information.
        
        Args:
            indices: Array of product indices from FAISS
            distances: Optional array of distances
            
        Returns:
            List of product dictionaries with metadata
        """
        results = []
        
        for i, idx in enumerate(indices):
            if idx >= len(self.df):
                continue
            
            product = self.df.iloc[idx].to_dict()
            
            # Add search metadata
            if distances is not None:
                product['similarity_score'] = float(distances[i])
            
            results.append(product)
        
        return results


# ============================================
# USAGE EXAMPLES
# ============================================

def example_single_search():
    """Example: Single query search"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Single Query Search")
    print("="*60)
    
    # Initialize search engine (loads model and index once)
    search_engine = ProductSearchEngine()
    
    # Initialize product mapper
    mapper = ProductMapper()
    
    # Perform search
    query = "blue cotton saree for women"
    print(f"\nSearching for: '{query}'")
    
    distances, indices = search_engine.search(query, top_k=5)
    
    # Map indices to products
    products = mapper.get_products(indices, distances)
    
    # Display results
    print(f"\nTop {len(products)} results:\n")
    for i, product in enumerate(products, 1):
        print(f"{i}. {product.get('title', 'N/A')}")
        print(f"   Brand: {product.get('brand', 'N/A')}")
        print(f"   Category: {product.get('category', 'N/A')}")
        print(f"   Price: ₹{product.get('sold_price', 0)}")
        print(f"   Similarity: {product.get('similarity_score', 0):.4f}")
        print()


def example_batch_search():
    """Example: Multiple queries at once"""
    print("\n" + "="*60)
    print("EXAMPLE 2: Batch Search")
    print("="*60)
    
    # Initialize once
    search_engine = ProductSearchEngine()
    mapper = ProductMapper()
    
    # Multiple queries
    queries = [
        "black trouser men formal",
        "sports bra women",
        "red silk saree wedding"
    ]
    
    # Batch search (more efficient)
    distances, indices = search_engine.batch_search(queries, top_k=3)
    
    # Process results for each query
    for i, query in enumerate(queries):
        print(f"\nQuery: '{query}'")
        print("-" * 40)
        
        products = mapper.get_products(indices[i], distances[i])
        
        for j, product in enumerate(products, 1):
            print(f"  {j}. {product.get('title', 'N/A')[:50]}...")
            print(f"     Price: ₹{product.get('sold_price', 0)} | Score: {product.get('similarity_score', 0):.4f}")


def example_api_integration():
    """Example: How to use in a backend API"""
    print("\n" + "="*60)
    print("EXAMPLE 3: API Integration Pattern")
    print("="*60)
    
    # Initialize ONCE at application startup (not per request!)
    global_search_engine = ProductSearchEngine()
    global_mapper = ProductMapper()
    
    def api_search_endpoint(user_query: str, limit: int = 10) -> dict:
        """
        Simulated API endpoint function.
        In production, this would be a Flask/FastAPI route.
        """
        try:
            # Perform search
            distances, indices = global_search_engine.search(user_query, top_k=limit)
            
            # Get product details
            products = global_mapper.get_products(indices, distances)
            
            # Return API response
            return {
                "success": True,
                "query": user_query,
                "total_results": len(products),
                "products": products
            }
            
        except ValueError as e:
            return {
                "success": False,
                "error": str(e)
            }
        except Exception as e:
            return {
                "success": False,
                "error": "Internal server error"
            }
    
    # Simulate API call
    response = api_search_endpoint("cotton shirt men", limit=3)
    
    print(f"\nAPI Response:")
    print(f"Success: {response['success']}")
    print(f"Query: {response.get('query')}")
    print(f"Results: {response.get('total_results')}")
    
    if response['success']:
        for product in response['products'][:3]:
            print(f"\n  - {product.get('title', 'N/A')[:60]}")


if __name__ == "__main__":
    # Run examples
    example_single_search()
    example_batch_search()
    example_api_integration()
