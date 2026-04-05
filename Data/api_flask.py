"""
Production-Ready Flask Backend for Semantic Product Search
Integrates FAISS + sentence-transformers for real-time recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import logging

# Import your semantic search module
from semantic_search import ProductSearchEngine, ProductMapper


# ============================================
# FLASK APP SETUP
# ============================================

app = Flask(__name__)

# CORS Configuration (allows frontend to connect)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # In production, specify your frontend domain
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================
# GLOBAL STATE (Loaded once at startup)
# ============================================

search_engine = None
product_mapper = None


def initialize_search_engine():
    """Initialize search engine and product mapper on startup"""
    global search_engine, product_mapper
    
    logger.info("🚀 Initializing search engine...")
    
    try:
        search_engine = ProductSearchEngine()
        product_mapper = ProductMapper()
        logger.info(f"✅ Search engine initialized with {len(product_mapper.df)} products")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to initialize search engine: {str(e)}")
        return False


# ============================================
# DECORATORS
# ============================================

def require_search_engine(f):
    """Decorator to ensure search engine is loaded"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if search_engine is None or product_mapper is None:
            return jsonify({
                'success': False,
                'error': 'Search engine not initialized'
            }), 503
        return f(*args, **kwargs)
    return decorated_function


def validate_json(f):
    """Decorator to validate JSON request"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Content-Type must be application/json'
            }), 400
        return f(*args, **kwargs)
    return decorated_function


# ============================================
# HELPER FUNCTIONS
# ============================================

def format_product(product_data, index, distance):
    """Format product data for API response"""
    return {
        'id': int(index),
        'title': product_data.get('title', 'N/A'),
        'brand': product_data.get('brand', None),
        'price': float(product_data.get('sold_price', 0)),
        'category': product_data.get('category', None),
        'image': product_data.get('image_url', None),
        'url': product_data.get('product_url', None),
        'similarity_score': float(distance)
    }


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/')
def root():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'message': 'Product Search API is running',
        'version': '1.0.0',
        'endpoints': {
            'search_post': '/api/search (POST)',
            'search_get': '/api/search (GET)',
            'batch_search': '/api/batch-search (POST)',
            'health': '/api/health'
        }
    })


@app.route('/api/health')
def health_check():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'search_engine_loaded': search_engine is not None,
        'product_mapper_loaded': product_mapper is not None,
        'total_products': len(product_mapper.df) if product_mapper else 0
    })


@app.route('/api/search', methods=['POST'])
@require_search_engine
@validate_json
def search_products_post():
    """
    POST endpoint for product search.
    
    Request body:
    {
        "query": "blue cotton saree for women",
        "top_k": 10
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        query = data.get('query', '').strip()
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query parameter is required and cannot be empty'
            }), 400
        
        if len(query) > 500:
            return jsonify({
                'success': False,
                'error': 'Query too long (max 500 characters)'
            }), 400
        
        top_k = data.get('top_k', 10)
        
        # Validate top_k
        try:
            top_k = int(top_k)
            if top_k < 1 or top_k > 100:
                return jsonify({
                    'success': False,
                    'error': 'top_k must be between 1 and 100'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'top_k must be a valid integer'
            }), 400
        
        # Perform search
        distances, indices = search_engine.search(query, top_k=top_k)
        
        # Get product details
        products_raw = product_mapper.get_products(indices, distances)
        
        # Format products
        products = [
            format_product(p, indices[i], distances[i])
            for i, p in enumerate(products_raw)
        ]
        
        return jsonify({
            'success': True,
            'query': query,
            'total_results': len(products),
            'products': products
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/search', methods=['GET'])
@require_search_engine
def search_products_get():
    """
    GET endpoint for product search (for easy browser testing).
    
    Example: /api/search?q=blue%20saree&top_k=5
    """
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query parameter "q" is required'
            }), 400
        
        top_k = request.args.get('top_k', 10, type=int)
        
        if top_k < 1 or top_k > 100:
            return jsonify({
                'success': False,
                'error': 'top_k must be between 1 and 100'
            }), 400
        
        # Perform search
        distances, indices = search_engine.search(query, top_k=top_k)
        
        # Get product details
        products_raw = product_mapper.get_products(indices, distances)
        
        # Format products
        products = [
            format_product(p, indices[i], distances[i])
            for i, p in enumerate(products_raw)
        ]
        
        return jsonify({
            'success': True,
            'query': query,
            'total_results': len(products),
            'products': products
        })
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/batch-search', methods=['POST'])
@require_search_engine
@validate_json
def batch_search_products():
    """
    Batch search endpoint for multiple queries.
    
    Request body:
    {
        "queries": ["blue saree", "black trouser", "sports bra"],
        "top_k": 5
    }
    """
    try:
        data = request.get_json()
        
        queries = data.get('queries', [])
        if not queries or not isinstance(queries, list):
            return jsonify({
                'success': False,
                'error': 'queries must be a non-empty list'
            }), 400
        
        if len(queries) > 50:
            return jsonify({
                'success': False,
                'error': 'Maximum 50 queries allowed'
            }), 400
        
        top_k = data.get('top_k', 10)
        
        # Perform batch search
        distances, indices = search_engine.batch_search(queries, top_k=top_k)
        
        # Format results
        results = []
        for i, query in enumerate(queries):
            products_raw = product_mapper.get_products(indices[i], distances[i])
            
            products = [
                format_product(p, indices[i][j], distances[i][j])
                for j, p in enumerate(products_raw)
            ]
            
            results.append({
                'query': query,
                'total_results': len(products),
                'products': products
            })
        
        return jsonify({
            'success': True,
            'total_queries': len(queries),
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Batch search error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# ============================================
# RUN SERVER
# ============================================

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Starting Flask Product Search Server")
    print("="*60)
    
    # Initialize search engine before starting server
    if not initialize_search_engine():
        print("❌ Failed to initialize. Exiting...")
        exit(1)
    
    print("\n📍 Server will be available at:")
    print("   - API: http://localhost:5000")
    print("   - Health: http://localhost:5000/api/health")
    print("\n💡 Press CTRL+C to stop the server\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True  # Disable in production
    )
