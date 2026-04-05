import React, { useState } from 'react';
import './ProductSearch.css';

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const API_URL = 'http://localhost:8000/api/v1/search';

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          top_k: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch results. Make sure the API is running.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="product-search-container">
      {/* Search Header */}
      <div className="search-header">
        <h1>🔍 Product Search</h1>
        <p>Find your perfect product with AI-powered search</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for products... (e.g., blue cotton saree)"
            className="search-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading || !query.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Searching for products...</p>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <>
          {products.length > 0 ? (
            <>
              <div className="results-header">
                <h2>Found {products.length} products</h2>
              </div>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    {/* Product Image */}
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={prod