"""
Rate Limiting Middleware
Simple in-memory rate limiting (use Redis for production distributed systems)
"""

import time
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from ..core.config import settings
from ..core.logging import logger


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests: int, window: int):
        """
        Args:
            requests: Number of requests allowed per window
            window: Time window in seconds
        """
        self.requests = requests
        self.window = window
        self.clients: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        Check if request is allowed for client.
        
        Returns:
            Tuple of (is_allowed, retry_after_seconds)
        """
        now = time.time()
        
        # Get client's request history
        request_times = self.clients[client_id]
        
        # Remove old requests outside the window
        request_times = [t for t in request_times if now - t < self.window]
        
        # Check if limit exceeded
        if len(request_times) >= self.requests:
            # Calculate retry after time
            oldest_request = min(request_times)
            retry_after = int(self.window - (now - oldest_request)) + 1
            return False, retry_after
        
        # Add current request
        request_times.append(now)
        self.clients[client_id] = request_times
        
        return True, 0
    
    def cleanup(self):
        """Remove old entries to prevent memory leak"""
        now = time.time()
        clients_to_remove = []
        
        for client_id, request_times in self.clients.items():
            # Remove old requests
            request_times = [t for t in request_times if now - t < self.window]
            
            if not request_times:
                clients_to_remove.append(client_id)
            else:
                self.clients[client_id] = request_times
        
        for client_id in clients_to_remove:
            del self.clients[client_id]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware for FastAPI"""
    
    def __init__(self, app, requests: int = 100, window: int = 60):
        super().__init__(app)
        self.limiter = RateLimiter(requests, window)
        self.enabled = settings.RATE_LIMIT_ENABLED
        self.last_cleanup = time.time()
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting"""
        
        # Skip rate limiting if disabled or for health checks
        if not self.enabled or request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier (IP address)
        client_id = request.client.host if request.client else "unknown"
        
        # Check rate limit
        is_allowed, retry_after = self.limiter.is_allowed(client_id)
        
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for client: {client_id}")
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Retry after {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
        
        # Periodic cleanup (every 5 minutes)
        if time.time() - self.last_cleanup > 300:
            self.limiter.cleanup()
            self.last_cleanup = time.time()
        
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.limiter.requests)
        response.headers["X-RateLimit-Window"] = str(self.limiter.window)
        
        return response
