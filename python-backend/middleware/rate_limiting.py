import logging
from typing import Dict, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        # Dictionary to store request counts: {ip: [(timestamp, endpoint), ...]}
        self.request_log: Dict[str, list] = defaultdict(list)
    
    def _get_client_ip(self, request) -> str:
        """Extract client IP from request"""
        # Check for forwarded header first (for proxies)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self, ip: str, window_minutes: int):
        """Remove requests older than the window"""
        cutoff_time = datetime.now() - timedelta(minutes=window_minutes)
        self.request_log[ip] = [
            (ts, ep) for ts, ep in self.request_log[ip]
            if ts > cutoff_time
        ]
    
    def is_allowed(
        self,
        request,
        endpoint: str,
        max_requests: int,
        window_minutes: int = 10
    ) -> Tuple[bool, Dict]:
        """
        Check if request is allowed under rate limit
        Returns: (is_allowed: bool, info: dict with remaining_requests, retry_after)
        """
        ip = self._get_client_ip(request)
        
        # Cleanup old requests
        self._cleanup_old_requests(ip, window_minutes)
        
        # Count requests for this endpoint in the current window
        endpoint_requests = [
            1 for ts, ep in self.request_log[ip]
            if ep == endpoint
        ]
        request_count = len(endpoint_requests)
        
        if request_count >= max_requests:
            retry_after = window_minutes * 60
            logger.warning(f"Rate limit exceeded for IP {ip} on endpoint {endpoint}")
            return False, {
                "remaining_requests": 0,
                "retry_after_seconds": retry_after,
                "reset_time": (datetime.now() + timedelta(minutes=window_minutes)).isoformat()
            }
        
        # Log this request
        self.request_log[ip].append((datetime.now(), endpoint))
        
        return True, {
            "remaining_requests": max_requests - request_count - 1,
            "retry_after_seconds": 0,
            "reset_time": (datetime.now() + timedelta(minutes=window_minutes)).isoformat()
        }

# Global rate limiter instance
rate_limiter = RateLimiter()
