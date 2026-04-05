"""
API Testing Script
Comprehensive tests for all endpoints
"""

import requests
import json
import time
from typing import Dict, Any


BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1"


def print_section(title: str):
    """Print section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)


def test_endpoint(name: str, method: str, url: str, **kwargs) -> Dict[str, Any]:
    """Test an endpoint and return response"""
    print(f"\n🧪 Testing: {name}")
    print(f"   {method} {url}")
    
    start_time = time.time()
    
    try:
        if method == "GET":
            response = requests.get(url, **kwargs)
        elif method == "POST":
            response = requests.post(url, **kwargs)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        elapsed = (time.time() - start_time) * 1000
        
        print(f"   Status: {response.status_code}")
        print(f"   Time: {elapsed:.2f}ms")
        
        if response.status_code == 200:
            print("   ✅ PASSED")
            return response.json()
        else:
            print(f"   ❌ FAILED: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        return None


def main():
    """Run all tests"""
    print("\n🚀 Product Search API - Test Suite")
    print(f"Testing: {BASE_URL}")
    
    # Test 1: Root endpoint
    print_section("1. Root Endpoint")
    test_endpoint(
        "Root",
        "GET",
        f"{BASE_URL}/"
    )
    
    # Test 2: Health check
    print_section("2. Health Check")
    health_data = test_endpoint(
        "Health Check",
        "GET",
        f"{BASE_URL}{API_PREFIX}/health"
    )
    
    if health_data:
        print(f"\n   Service Status: {health_data.get('status')}")
        print(f"   Total Products: {health_data.get('total_products')}")
        print(f"   Uptime: {health_data.get('uptime_seconds', 0):.2f}s")
    
    # Test 3: Basic search
    print_section("3. Basic Search (POST)")
    search_data = test_endpoint(
        "Basic Search",
        "POST",
        f"{BASE_URL}{API_PREFIX}/search",
        json={
            "query": "blue cotton saree for women",
            "top_k": 5
        }
    )
    
    if search_data:
        print(f"\n   Query: {search_data.get('query')}")
        print(f"   Results: {search_data.get('total_results')}")
        print(f"   Execution Time: {search_data.get('execution_time_ms')}ms")
        
        if search_data.get('products'):
            print("\n   Top Result:")
            product = search_data['products'][0]
            print(f"   - Title: {product.get('title')}")
            print(f"   - Brand: {product.get('brand')}")
            print(f"   - Price: ₹{product.get('price')}")
            print(f"   - Score: {product.get('similarity_score'):.4f}")
    
    # Test 4: Search with filters
    print_section("4. Search with Filters")
    filter_data = test_endpoint(
        "Filtered Search",
        "POST",
        f"{BASE_URL}{API_PREFIX}/search",
        json={
            "query": "saree",
            "top_k": 10,
            "min_price": 500,
            "max_price": 2000,
            "category": "saree",
            "sort_by": "price_asc"
        }
    )
    
    if filter_data:
        print(f"\n   Results: {filter_data.get('total_results')}")
        print(f"   Filters Applied: {json.dumps(filter_data.get('filters_applied'), indent=2)}")
    
    # Test 5: Pagination
    print_section("5. Pagination")
    page_data = test_endpoint(
        "Paginated Search",
        "POST",
        f"{BASE_URL}{API_PREFIX}/search",
        json={
            "query": "trouser",
            "top_k": 50,
            "page": 2,
            "page_size": 10
        }
    )
    
    if page_data:
        pagination = page_data.get('pagination', {})
        print(f"\n   Page: {pagination.get('page')}/{pagination.get('total_pages')}")
        print(f"   Items: {len(page_data.get('products', []))}")
        print(f"   Has Next: {pagination.get('has_next')}")
        print(f"   Has Prev: {pagination.get('has_prev')}")
    
    # Test 6: GET search
    print_section("6. GET Search")
    test_endpoint(
        "GET Search",
        "GET",
        f"{BASE_URL}{API_PREFIX}/search",
        params={
            "q": "sports bra women",
            "top_k": 5
        }
    )
    
    # Test 7: Batch search
    print_section("7. Batch Search")
    batch_data = test_endpoint(
        "Batch Search",
        "POST",
        f"{BASE_URL}{API_PREFIX}/batch-search",
        json={
            "queries": ["blue saree", "black trouser", "sports bra"],
            "top_k": 3
        }
    )
    
    if batch_data:
        print(f"\n   Queries Processed: {batch_data.get('total_queries')}")
        print(f"   Execution Time: {batch_data.get('execution_time_ms')}ms")
    
    # Test 8: Categories
    print_section("8. Get Categories")
    categories_data = test_endpoint(
        "Categories",
        "GET",
        f"{BASE_URL}{API_PREFIX}/categories"
    )
    
    if categories_data:
        print(f"\n   Total Categories: {categories_data.get('total')}")
        print(f"   Categories: {', '.join(categories_data.get('categories', [])[:5])}...")
    
    # Test 9: Brands
    print_section("9. Get Brands")
    brands_data = test_endpoint(
        "Brands",
        "GET",
        f"{BASE_URL}{API_PREFIX}/brands"
    )
    
    if brands_data:
        print(f"\n   Total Brands: {brands_data.get('total')}")
        print(f"   Sample Brands: {', '.join(brands_data.get('brands', [])[:5])}...")
    
    # Test 10: Invalid requests
    print_section("10. Error Handling")
    
    # Empty query
    test_endpoint(
        "Empty Query (should fail)",
        "POST",
        f"{BASE_URL}{API_PREFIX}/search",
        json={"query": "", "top_k": 10}
    )
    
    # Invalid top_k
    test_endpoint(
        "Invalid top_k (should fail)",
        "POST",
        f"{BASE_URL}{API_PREFIX}/search",
        json={"query": "test", "top_k": 1000}
    )
    
    # Summary
    print_section("Test Summary")
    print("\n✅ All tests completed!")
    print("\nNext steps:")
    print("1. Check API docs: http://localhost:8000/docs")
    print("2. Review logs for any errors")
    print("3. Test with your frontend")


if __name__ == "__main__":
    print("\n⚠️  Make sure the API server is running before testing!")
    print("   Start with: python -m app.main")
    input("\nPress Enter to continue...")
    
    main()
