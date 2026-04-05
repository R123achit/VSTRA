'use client';

import { useState } from 'react';

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchProducts = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          top_k: 10
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        console.error('Search failed:', data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Product Search</h1>
          <p style={styles.subtitle}>Find products using natural language search</p>
        </div>

        {/* Search Box */}
        <form onSubmit={searchProducts} style={styles.searchForm}>
          <div style={styles.searchBox}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products... (e.g., blue cotton saree for women)"
              style={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              style={{
                ...styles.button,
                ...(loading || !query.trim() ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Searching for products...</p>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            {products.length > 0 ? (
              <>
                <div style={styles.resultsCount}>
                  Found {products.length} products for "{query}"
                </div>
                
                <div style={styles.grid}>
                  {products.map((product, index) => (
                    <div key={product.id || index} style={styles.card}>
                      {/* Product Image */}
                      <div style={styles.imageContainer}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            style={styles.image}
                          />
                        ) : (
                          <div style={styles.noImage}>
                            <span>📦</span>
                            <span style={styles.noImageText}>No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div style={styles.cardContent}>
                        <h3 style={styles.productTitle}>{product.title}</h3>
                        
                        {product.brand && (
                          <p style={styles.brand}>{product.brand}</p>
                        )}
                        
                        <div style={styles.priceRow}>
                          <span style={styles.price}>
                            ₹{product.price.toFixed(2)}
                          </span>
                          
                          {product.category && (
                            <span style={styles.category}>{product.category}</span>
                          )}
                        </div>
                        
                        <div style={styles.score}>
                          Match: {(1 - product.similarity_score).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>😕</div>
                <h3 style={styles.emptyTitle}>No products found</h3>
                <p style={styles.emptyText}>Try a different search query</p>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!loading && !searched && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>Start searching</h3>
            <p style={styles.emptyText}>
              Enter a product description to find similar items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem 1rem',
  },
  content: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1rem',
  },
  searchForm: {
    marginBottom: '2rem',
  },
  searchBox: {
    maxWidth: '42rem',
    margin: '0 auto',
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem 0',
  },
  spinner: {
    width: '3rem',
    height: '3rem',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#6b7280',
  },
  resultsCount: {
    marginBottom: '1rem',
    color: '#6b7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },
  imageContainer: {
    aspectRatio: '1',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    textAlign: 'center',
    color: '#9ca3af',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '3rem',
  },
  noImageText: {
    fontSize: '0.875rem',
  },
  cardContent: {
    padding: '1rem',
  },
  productTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '3rem',
  },
  brand: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  category: {
    fontSize: '0.75rem',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
  },
  score: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 0',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#6b7280',
  },
};
