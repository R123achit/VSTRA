"""
Product Embeddings Generator
Generates ML embeddings and builds FAISS index for product recommendations
"""

import pandas as pd
import numpy as np
import os
from sentence_transformers import SentenceTransformer
import faiss

def main():
    """Main function to generate embeddings and build FAISS index"""
    
    # File paths
    input_file = r"C:\Users\rachi\VSTRA\Data\cleaned_products.csv"
    index_file = r"C:\Users\rachi\VSTRA\Data\product_index.faiss"
    embeddings_file = r"C:\Users\rachi\VSTRA\Data\embeddings.npy"
    
    print("="*60)
    print("PRODUCT EMBEDDINGS GENERATOR")
    print("="*60)
    
    # Step 1: Load data
    print("\n[1/5] Loading data...")
    if not os.path.exists(input_file):
        print(f"ERROR: Input file not found at {input_file}")
        return
    
    try:
        df = pd.read_csv(input_file)
        print(f"✓ Loaded {len(df)} products")
        
        # Check if combined column exists
        if 'combined' not in df.columns:
            print("ERROR: 'combined' column not found in CSV")
            print(f"Available columns: {', '.join(df.columns)}")
            return
        
        # Handle missing values
        df['combined'] = df['combined'].fillna('')
        
        # Remove empty entries
        df = df[df['combined'].str.strip() != '']
        print(f"✓ {len(df)} products with valid text")
        
        # Convert to list
        product_texts = df['combined'].tolist()
        
    except Exception as e:
        print(f"ERROR loading data: {str(e)}")
        return
    
    # Step 2: Load model
    print("\n[2/5] Loading model...")
    print("Model: all-MiniLM-L6-v2")
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✓ Model loaded successfully")
    except Exception as e:
        print(f"ERROR loading model: {str(e)}")
        print("Try installing: pip install sentence-transformers")
        return
    
    # Step 3: Generate embeddings
    print("\n[3/5] Generating embeddings...")
    print("This may take a few minutes...")
    try:
        embeddings = model.encode(
            product_texts,
            show_progress_bar=True,
            batch_size=32,
            convert_to_numpy=True
        )
        print(f"✓ Generated embeddings: shape {embeddings.shape}")
        
        # Convert to float32 for FAISS
        embeddings = embeddings.astype('float32')
        print(f"✓ Converted to float32")
        
    except Exception as e:
        print(f"ERROR generating embeddings: {str(e)}")
        return
    
    # Step 4: Build FAISS index
    print("\n[4/5] Building FAISS index...")
    try:
        # Get embedding dimension
        dimension = embeddings.shape[1]
        print(f"Embedding dimension: {dimension}")
        
        # Create L2 distance index
        index = faiss.IndexFlatL2(dimension)
        
        # Add embeddings to index
        index.add(embeddings)
        print(f"✓ Added {index.ntotal} vectors to index")
        
    except Exception as e:
        print(f"ERROR building index: {str(e)}")
        print("Try installing: pip install faiss-cpu")
        return
    
    # Step 5: Save files
    print("\n[5/5] Saving files...")
    try:
        # Create output directory if needed
        os.makedirs(os.path.dirname(index_file), exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(index, index_file)
        print(f"✓ Saved FAISS index: {index_file}")
        
        # Save embeddings
        np.save(embeddings_file, embeddings)
        print(f"✓ Saved embeddings: {embeddings_file}")
        
    except Exception as e:
        print(f"ERROR saving files: {str(e)}")
        return
    
    # Summary
    print("\n" + "="*60)
    print("SUCCESS! Embeddings and index created")
    print("="*60)
    print(f"Total products indexed: {len(embeddings)}")
    print(f"Embedding dimension: {dimension}")
    print(f"Index type: L2 (Euclidean distance)")
    print(f"\nOutput files:")
    print(f"  - {index_file}")
    print(f"  - {embeddings_file}")
    print("\nReady for similarity search!")

if __name__ == "__main__":
    main()
