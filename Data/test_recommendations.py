"""
Product Recommendation Tester
Tests the FAISS index by finding similar products
"""

import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

def search_similar_products(query_text, top_k=5):
    """
    Search for similar products using FAISS index
    Args:
        query_text: Product description to search for
        top_k: Number of similar products to return
    """
    
    # File paths
    csv_file = r"C:\Users\rachi\VSTRA\Data\cleaned_products.csv"
    index_file = r"C:\Users\rachi\VSTRA\Data\product_index.faiss"
    
    print(f"Searching for: '{query_text}'")
    print("-" * 60)
    
    # Load data
    df = pd.read_csv(csv_file)
    df['combined'] = df['combined'].fillna('')
    df = df[df['combined'].str.strip() != '']
    
    # Load model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Load FAISS index
    index = faiss.read_index(index_file)
    
    # Generate query embedding
    query_embedding = model.encode([query_text], convert_to_numpy=True).astype('float32')
    
    # Search
    distances, indices = index.search(query_embedding, top_k)
    
    # Display results
    print(f"\nTop {top_k} similar products:\n")
    for i, (idx, distance) in enumerate(zip(indices[0], distances[0]), 1):
        product = df.iloc[idx]
        print(f"{i}. Distance: {distance:.4f}")
        if 'title' in df.columns:
            print(f"   Title: {product['title']}")
        if 'brand' in df.columns:
            print(f"   Brand: {product['brand']}")
        if 'category' in df.columns:
            print(f"   Category: {product['category']}")
        if 'sold_price' in df.columns:
            print(f"   Price: ₹{product['sold_price']}")
        print()

if __name__ == "__main__":
    # Test with sample queries
    test_queries = [
        "blue cotton saree",
        "black trouser men",
        "sports bra women"
    ]
    
    for query in test_queries:
        search_similar_products(query, top_k=3)
        print("=" * 60)
        print()
