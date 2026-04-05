"""
Advanced Recommendation Engine for E-commerce
Provides multiple types of recommendations like Amazon/Flipkart
"""

import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple, Optional
from collections import Counter
import os
import math


class RecommendationEngine:
    """
    Multi-strategy recommendation engine supporting:
    1. Similar Products (Content-based using FAISS)
    2. Frequently Bought Together (Collaborative filtering)
    3. Personalized Recommendations (User history-based)
    4. Trending Products (Popularity-based)
    """
    
    def __init__(
        self,
        index_path: str = r"C:\Users\rachi\VSTRA\Data\product_index.faiss",
        csv_path: str = r"C:\Users\rachi\VSTRA\Data\cleaned_products.csv",
        model_name: str = "all-MiniLM-L6-v2"
    ):
        """Initialize recommendation engine"""
        self.index_path = index_path
        self.csv_path = csv_path
        self.model_name = model_name
        
        # Load resources
        self._load_data()
        self._load_index()
        self._load_model()
        
        print(f"✓ Recommendation Engine initialized with {len(self.df)} products")
    
    def _load_data(self):
        """Load product data"""
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"Product CSV not found at: {self.csv_path}")
        
        self.df = pd.read_csv(self.csv_path)
        self.df['combined'] = self.df['combined'].fillna('')
        self.df = self.df[self.df['combined'].str.strip() != '']
        self.df.reset_index(drop=True, inplace=True)
    
    def _load_index(self):
        """Load FAISS index"""
        if not os.path.exists(self.index_path):
            raise FileNotFoundError(f"FAISS index not found at: {self.index_path}")
        
        self.index = faiss.read_index(self.index_path)
    
    def _load_model(self):
        """Load sentence transformer model"""
        self.model = SentenceTransformer(self.model_name)
    
    def _clean_product_dict(self, product: Dict) -> Dict:
        """
        Clean product dictionary by replacing NaN/None values with appropriate defaults
        This prevents JSON serialization errors
        """
        cleaned = {}
        for key, value in product.items():
            # Handle NaN values
            if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
                # Use appropriate defaults based on field type
                if 'price' in key.lower():
                    cleaned[key] = 0
                elif 'rating' in key.lower():
                    cleaned[key] = 0
                else:
                    cleaned[key] = ''
            # Handle None values
            elif value is None:
                if 'price' in key.lower() or 'rating' in key.lower():
                    cleaned[key] = 0
                else:
                    cleaned[key] = ''
            # Handle numpy types
            elif isinstance(value, (np.integer, np.floating)):
                if math.isnan(float(value)) or math.isinf(float(value)):
                    cleaned[key] = 0 if 'price' in key.lower() or 'rating' in key.lower() else ''
                else:
                    cleaned[key] = int(value) if isinstance(value, np.integer) else float(value)
            else:
                cleaned[key] = value
        
        return cleaned
    
    def get_similar_products(
        self,
        product_id: int,
        top_k: int = 10,
        exclude_same_product: bool = True
    ) -> List[Dict]:
        """
        Get similar products based on content similarity (FAISS)
        
        Args:
            product_id: Index of the product in dataset
            top_k: Number of similar products to return
            exclude_same_product: Whether to exclude the input product
            
        Returns:
            List of similar products with metadata
        """
        try:
            # Validate product_id
            if product_id < 0 or product_id >= len(self.df):
                return []
            
            # Get current product details for better filtering
            current_product = self.df.iloc[product_id]
            current_title = current_product.get('title', '').lower()
            
            # Get product embedding (already in FAISS index)
            # Search for similar products
            query_vector = self.index.reconstruct(int(product_id))
            query_vector = query_vector.reshape(1, -1).astype('float32')
            
            # Search for more products to account for filtering
            search_k = min(top_k * 3, len(self.df))  # Get 3x to filter duplicates
            distances, indices = self.index.search(query_vector, search_k)
            
            # Format results with deduplication
            results = []
            seen_titles = set()
            
            for idx, distance in zip(indices[0], distances[0]):
                # Skip the same product if requested
                if exclude_same_product and idx == product_id:
                    continue
                
                if idx >= len(self.df):
                    continue
                
                product = self.df.iloc[idx].to_dict()
                product_title = product.get('title', '').lower()
                
                # Skip if we've seen this exact title (duplicate products)
                if product_title in seen_titles:
                    continue
                
                # Skip if title is too similar to current product (likely same product)
                if product_title == current_title:
                    continue
                
                seen_titles.add(product_title)
                product['similarity_score'] = float(distance)
                product['recommendation_type'] = 'similar'
                product['index_id'] = int(idx)  # Add index for reference
                
                # Clean NaN values before adding to results
                cleaned_product = self._clean_product_dict(product)
                results.append(cleaned_product)
                
                if len(results) >= top_k:
                    break
            
            return results
            
        except Exception as e:
            print(f"Error in get_similar_products: {str(e)}")
            return []
    
    def get_frequently_bought_together(
        self,
        product_id: int,
        top_k: int = 5
    ) -> List[Dict]:
        """
        Get products frequently bought together
        Uses category and price similarity as proxy for collaborative filtering
        
        Args:
            product_id: Index of the product
            top_k: Number of products to return
            
        Returns:
            List of complementary products
        """
        try:
            if product_id < 0 or product_id >= len(self.df):
                return []
            
            current_product = self.df.iloc[product_id]
            current_category = current_product.get('category', '')
            current_price = current_product.get('sold_price', 0)
            current_title = current_product.get('title', '').lower()
            
            # Find complementary products
            # Strategy: Different subcategory, similar price range, same main category
            complementary = []
            seen_titles = set([current_title])
            
            for idx, row in self.df.iterrows():
                if idx == product_id:
                    continue
                
                product_title = row.get('title', '').lower()
                
                # Skip duplicates
                if product_title in seen_titles:
                    continue
                
                # Same main category but different subcategory
                if row.get('category', '') == current_category:
                    price_diff = abs(row.get('sold_price', 0) - current_price)
                    
                    # Similar price range (within 50%)
                    if price_diff < current_price * 0.5:
                        product = row.to_dict()
                        product['price_similarity'] = 1 - (price_diff / (current_price + 1))
                        product['recommendation_type'] = 'frequently_bought_together'
                        product['index_id'] = int(idx)
                        
                        # Clean NaN values before adding
                        cleaned_product = self._clean_product_dict(product)
                        complementary.append(cleaned_product)
                        seen_titles.add(product_title)
            
            # Sort by price similarity and return top_k
            complementary.sort(key=lambda x: x['price_similarity'], reverse=True)
            return complementary[:top_k]
            
        except Exception as e:
            print(f"Error in get_frequently_bought_together: {str(e)}")
            return []
    
    def get_personalized_recommendations(
        self,
        user_history: List[int],
        top_k: int = 10
    ) -> List[Dict]:
        """
        Get personalized recommendations based on user's browsing/purchase history
        
        Args:
            user_history: List of product IDs user has viewed/purchased
            top_k: Number of recommendations
            
        Returns:
            List of personalized product recommendations
        """
        try:
            if not user_history:
                return self.get_trending_products(top_k)
            
            # Get embeddings for all products in history
            history_embeddings = []
            history_titles = set()
            
            for prod_id in user_history:
                if 0 <= prod_id < len(self.df):
                    embedding = self.index.reconstruct(int(prod_id))
                    history_embeddings.append(embedding)
                    # Track titles to avoid recommending same products
                    title = self.df.iloc[prod_id].get('title', '').lower()
                    history_titles.add(title)
            
            if not history_embeddings:
                return []
            
            # Average the embeddings to get user preference vector
            user_preference = np.mean(history_embeddings, axis=0)
            user_preference = user_preference.reshape(1, -1).astype('float32')
            
            # Search for products matching user preferences
            search_k = min(top_k * 3, len(self.df))
            distances, indices = self.index.search(user_preference, search_k)
            
            # Filter out products already in history and duplicates
            results = []
            seen_titles = history_titles.copy()
            
            for idx, distance in zip(indices[0], distances[0]):
                if idx in user_history:
                    continue
                
                if idx >= len(self.df):
                    continue
                
                product = self.df.iloc[idx].to_dict()
                product_title = product.get('title', '').lower()
                
                # Skip if already seen
                if product_title in seen_titles:
                    continue
                
                seen_titles.add(product_title)
                product['similarity_score'] = float(distance)
                product['recommendation_type'] = 'personalized'
                product['index_id'] = int(idx)
                
                # Clean NaN values before adding
                cleaned_product = self._clean_product_dict(product)
                results.append(cleaned_product)
                
                if len(results) >= top_k:
                    break
            
            return results
            
        except Exception as e:
            print(f"Error in get_personalized_recommendations: {str(e)}")
            return []
    
    def get_trending_products(
        self,
        top_k: int = 10,
        category: Optional[str] = None,
        exclude_titles: List[str] = None
    ) -> List[Dict]:
        """
        Get trending/popular products
        Uses price and category as proxy for popularity
        
        Args:
            top_k: Number of products to return
            category: Optional category filter
            exclude_titles: Titles to exclude
            
        Returns:
            List of trending products
        """
        try:
            df_filtered = self.df.copy()
            exclude_titles = exclude_titles or []
            exclude_titles_lower = [t.lower() for t in exclude_titles]
            
            if category:
                df_filtered = df_filtered[df_filtered['category'] == category]
            
            # Sort by price (assuming higher-priced items are premium/popular)
            # In production, you'd use actual view counts, sales data, etc.
            df_filtered = df_filtered.sort_values('sold_price', ascending=False)
            
            results = []
            seen_titles = set(exclude_titles_lower)
            
            for idx, row in df_filtered.iterrows():
                product_title = row.get('title', '').lower()
                
                # Skip duplicates
                if product_title in seen_titles:
                    continue
                
                seen_titles.add(product_title)
                product = row.to_dict()
                product['recommendation_type'] = 'trending'
                product['index_id'] = int(idx)
                
                # Clean NaN values before adding
                cleaned_product = self._clean_product_dict(product)
                results.append(cleaned_product)
                
                if len(results) >= top_k:
                    break
            
            return results
            
        except Exception as e:
            print(f"Error in get_trending_products: {str(e)}")
            return []
    
    def get_category_recommendations(
        self,
        category: str,
        exclude_ids: List[int] = None,
        top_k: int = 10
    ) -> List[Dict]:
        """
        Get top products from a specific category
        
        Args:
            category: Product category
            exclude_ids: Product IDs to exclude
            top_k: Number of products
            
        Returns:
            List of products from category
        """
        try:
            exclude_ids = exclude_ids or []
            
            df_filtered = self.df[self.df['category'] == category].copy()
            df_filtered = df_filtered[~df_filtered.index.isin(exclude_ids)]
            
            # Sort by price (or you could use ratings, sales, etc.)
            df_filtered = df_filtered.sort_values('sold_price', ascending=False)
            
            results = []
            for idx, row in df_filtered.head(top_k).iterrows():
                product = row.to_dict()
                product['recommendation_type'] = 'category'
                
                # Clean NaN values before adding
                cleaned_product = self._clean_product_dict(product)
                results.append(cleaned_product)
            
            return results
            
        except Exception as e:
            print(f"Error in get_category_recommendations: {str(e)}")
            return []
    
    def get_complete_recommendations(
        self,
        product_id: int,
        user_history: List[int] = None,
        top_k_per_type: int = 6
    ) -> Dict[str, List[Dict]]:
        """
        Get all types of recommendations for a product page
        Like Amazon's product page with multiple recommendation sections
        
        Args:
            product_id: Current product ID
            user_history: User's browsing/purchase history
            top_k_per_type: Number of items per recommendation type
            
        Returns:
            Dictionary with different recommendation types
        """
        user_history = user_history or []
        
        return {
            'similar_products': self.get_similar_products(product_id, top_k_per_type),
            'frequently_bought_together': self.get_frequently_bought_together(product_id, top_k_per_type),
            'personalized': self.get_personalized_recommendations(user_history, top_k_per_type),
            'trending': self.get_trending_products(top_k_per_type)
        }


# Example usage
if __name__ == "__main__":
    print("\n" + "="*60)
    print("RECOMMENDATION ENGINE TEST")
    print("="*60)
    
    # Initialize engine
    engine = RecommendationEngine()
    
    # Test 1: Similar products
    print("\n1. Similar Products (Product ID: 100)")
    print("-" * 60)
    similar = engine.get_similar_products(100, top_k=5)
    for i, prod in enumerate(similar, 1):
        print(f"{i}. {prod.get('title', 'N/A')[:50]} - ₹{prod.get('sold_price', 0)}")
    
    # Test 2: Frequently bought together
    print("\n2. Frequently Bought Together (Product ID: 100)")
    print("-" * 60)
    fbt = engine.get_frequently_bought_together(100, top_k=5)
    for i, prod in enumerate(fbt, 1):
        print(f"{i}. {prod.get('title', 'N/A')[:50]} - ₹{prod.get('sold_price', 0)}")
    
    # Test 3: Personalized recommendations
    print("\n3. Personalized Recommendations (History: [100, 200, 300])")
    print("-" * 60)
    personalized = engine.get_personalized_recommendations([100, 200, 300], top_k=5)
    for i, prod in enumerate(personalized, 1):
        print(f"{i}. {prod.get('title', 'N/A')[:50]} - ₹{prod.get('sold_price', 0)}")
    
    # Test 4: Complete recommendations
    print("\n4. Complete Recommendations for Product Page")
    print("-" * 60)
    complete = engine.get_complete_recommendations(100, [200, 300], top_k_per_type=3)
    for rec_type, products in complete.items():
        print(f"\n{rec_type.replace('_', ' ').title()}: {len(products)} products")
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60)
