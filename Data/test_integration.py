"""
Quick test script to verify semantic search integration is working
Run this after starting the FastAPI server to test the API
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_health():
    """Test if API is running"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ API is running!")
            print(f"   Status: {data.get('status')}")
            print(f"   Products loaded: {data.get('total_products')}")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Is it running?")
        print("   Start it with: python api_fastapi.py")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_search(query, top_k=5):
    """Test semantic search"""
    print("\n" + "="*60)
    print(f"TEST 2: Semantic Search - '{query}'")
    print("="*60)
    
    try:
        response = requests.post(
            f"{API_URL}/search",
            json={"query": query, "top_k": top_k},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search successful!")
            print(f"   Query: {data.get('query')}")
            print(f"   Results: {data.get('total_results')}")
            print(f"\n   Top {min(3, len(data.get('products', [])))} products:")
            
            for i, product in enumerate(data.get('products', [])[:3], 1):
                print(f"\n   {i}. {product.get('title', 'N/A')[:60]}")
                print(f"      Price: ₹{product.get('price', 0)}")
                print(f"      Category: {product.get('category', 'N/A')}")
                print(f"      Similarity: {product.get('similarity_score', 0):.4f}")
            
            return True
        else:
            print(f"❌ Search failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_batch_search():
    """Test batch search"""
    print("\n" + "="*60)
    print("TEST 3: Batch Search")
    print("="*60)
    
    queries = [
        "blue cotton saree",
        "black trouser men",
        "sports bra women"
    ]
    
    try:
        response = requests.post(
            f"{API_URL}/batch-search",
            json={"queries": queries, "top_k": 3},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Batch search successful!")
            print(f"   Total queries: {data.get('total_queries')}")
            
            for result in data.get('results', []):
                print(f"\n   Query: '{result.get('query')}'")
                print(f"   Results: {result.get('total_results')}")
            
            return True
        else:
            print(f"❌ Batch search failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_get_endpoint():
    """Test GET endpoint"""
    print("\n" + "="*60)
    print("TEST 4: GET Endpoint")
    print("="*60)
    
    try:
        response = requests.get(
            f"{API_URL}/search",
            params={"q": "blue saree", "top_k": 3},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET endpoint working!")
            print(f"   Results: {data.get('total_results')}")
            return True
        else:
            print(f"❌ GET endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 SEMANTIC SEARCH API INTEGRATION TEST")
    print("="*60)
    print("\nTesting FastAPI server at:", API_URL)
    
    results = []
    
    # Test 1: Health check
    results.append(("Health Check", test_health()))
    
    if not results[0][1]:
        print("\n" + "="*60)
        print("⚠️  API is not running. Please start it first:")
        print("   cd Data")
        print("   python api_fastapi.py")
        print("="*60)
        return
    
    # Test 2: Search
    results.append(("Semantic Search", test_search("blue cotton saree for women")))
    
    # Test 3: Batch search
    results.append(("Batch Search", test_batch_search()))
    
    # Test 4: GET endpoint
    results.append(("GET Endpoint", test_get_endpoint()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "="*60)
    print(f"Results: {passed}/{total} tests passed")
    print("="*60)
    
    if passed == total:
        print("\n🎉 All tests passed! Your semantic search is working perfectly!")
        print("\nNext steps:")
        print("1. Start your Next.js app: npm run dev")
        print("2. Open http://localhost:3000")
        print("3. Click the ✨ icon in the navbar")
        print("4. Try searching for products!")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        print("\nTroubleshooting:")
        print("1. Make sure FAISS index exists: python generate_embeddings.py")
        print("2. Check if products CSV is present")
        print("3. Verify all dependencies are installed: pip install -r requirements.txt")


if __name__ == "__main__":
    main()
