"""
Quick API Test Script
Tests both FastAPI and Flask endpoints
"""

import requests
import json
import time


def test_fastapi(base_url="http://localhost:8000"):
    """Test FastAPI endpoints"""
    print("\n" + "="*60)
    print("Testing FastAPI (Port 8000)")
    print("="*60)
    
    # Test health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✓ Status: {response.status_code}")
        print(f"✓ Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"✗ Failed: {str(e)}")
        return
    
    # Test POST search
    print("\n2. Testing POST /search...")
    try:
        start = time.time()
        response = requests.post(
            f"{base_url}/search",
            json={
                "query": "blue cotton saree for women",
                "top_k": 5
            }
        )
        elapsed = time.time() - start
        
        print(f"✓ Status: {response.status_code}")
        print(f"✓ Response time: {elapsed:.3f}s")
        
        data = response.json()
        print(f"✓ Found {data['total_results']} products")
        
        if data['products']:
            print("\nTop result:")
            product = data['products'][0]
            print(f"  - Title: {product['title']}")
            print(f"  - Brand: {product['brand']}")
            print(f"  - Price: ₹{product['price']}")
            print(f"  - Score: {product['similarity_score']:.4f}")
    except Exception as e:
        print(f"✗ Failed: {str(e)}")
    
    # Test GET search
    print("\n3. Testing GET /search...")
    try:
        response = requests.get(
            f"{base_url}/search",
            params={"q": "sports bra women", "top_k": 3}
        )
        print(f"✓ Status: {response.status_code}")
        data = response.json()
        print(f"✓ Found {data['total_results']} products")
    except Exception as e:
        print(f"✗ Failed: {str(e)}")
    
    # Test batch search
    print("\n4. Testing batch search...")
    try:
        response = requests.post(
            f"{base_url}/batch-search",
            json={
                "queries": ["blue saree", "black trouser"],
                "top_k": 2
            }
        )
        print(f"✓ Status: {response.status_code}")
        data = response.json()
        print(f"✓ Processed {data['total_queries']} queries")
    except Exception as e:
        print(f"✗ Failed: {str(e)}")


def test_flask(base_url="http://localhost:5000"):
    """Test Flask endpoints"""
    print("\n" + "="*60)
    print("Testing Flask (Port 5000)")
    print("="*60)
    
    # Test health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"✓ Status: {response.status_code}")
        print(f"✓ Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"✗ Failed: {str(e)}")
        return
    
    # Test POST search
    print("\n2. Testing POST /api/search...")
    try:
        start = time.time()
        response = requests.post(
            f"{base_url}/api/search",
            json={
                "query": "black trouser men formal",
                "top_k": 5
            }
        )
        elapsed = time.time() - start
        
        print(f"✓ Status: {response.status_code}")
        print(f"✓ Response time: {elapsed:.3f}s")
        
        data = response.json()
        print(f"✓ Found {data['total_results']} products")
        
        if data['products']:
            print("\nTop result:")
            product = data['products'][0]
            print(f"  - Title: {product['title']}")
            print(f"  - Brand: {product['brand']}")
            print(f"  - Price: ₹{product['price']}")
            print(f"  - Score: {product['similarity_score']:.4f}")
    except Exception as e:
        print(f"✗ Failed: {str(e)}")
    
    # Test GET search
    print("\n3. Testing GET /api/search...")
    try:
        response = requests.get(
            f"{base_url}/api/search",
            params={"q": "red silk saree", "top_k": 3}
        )
        print(f"✓ Status: {response.status_code}")
        data = response.json()
        print(f"✓ Found {data['total_results']} products")
    except Exception as e:
        print(f"✗ Failed: {str(e)}")


def main():
    """Run all tests"""
    print("\n🧪 API Test Suite")
    print("Make sure the API server is running before testing!")
    
    choice = input("\nWhich API to test?\n1. FastAPI (port 8000)\n2. Flask (port 5000)\n3. Both\nChoice (1/2/3): ")
    
    if choice == "1":
        test_fastapi()
    elif choice == "2":
        test_flask()
    elif choice == "3":
        test_fastapi()
        test_flask()
    else:
        print("Invalid choice")
    
    print("\n✅ Testing complete!")


if __name__ == "__main__":
    main()
