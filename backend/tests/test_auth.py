import unittest
from unittest.mock import patch, MagicMock
import jwt
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from auth import AuthMiddleware, RateLimiter

class TestAuthMiddleware(unittest.TestCase):
    def setUp(self):
        self.auth = AuthMiddleware()
        self.mock_request = MagicMock()
        
    @patch('auth.auth.verify_id_token')
    def test_firebase_token_validation_success(self, mock_verify):
        # Arrange
        mock_verify.return_value = {'uid': 'test-user-123', 'email': 'test@example.com'}
        self.mock_request.headers = {'Authorization': 'Bearer firebase-token-123'}
        
        # Act
        @self.auth.require_auth
        def protected_route():
            return 'success'
            
        with patch('flask.request', self.mock_request):
            result = protected_route()
            
        # Assert
        self.assertEqual(result, 'success')
        mock_verify.assert_called_once_with('firebase-token-123')
        
    @patch('auth.auth.verify_id_token')
    def test_firebase_token_validation_failure(self, mock_verify):
        # Arrange
        mock_verify.side_effect = Exception('Invalid token')
        self.mock_request.headers = {'Authorization': 'Bearer invalid-token'}
        
        # Act
        @self.auth.require_auth
        def protected_route():
            return 'success'
            
        with patch('flask.request', self.mock_request):
            result = protected_route()
            
        # Assert
        self.assertEqual(result[0]['error'], 'Invalid token')
        self.assertEqual(result[1], 401)
        
    def test_jwt_token_validation_success(self):
        # Arrange
        secret = 'test-secret'
        self.auth.jwt_secret = secret
        payload = {
            'sub': 'test-user-123',
            'email': 'test@example.com',
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, secret, algorithm='HS256')
        self.mock_request.headers = {'Authorization': f'Bearer {token}'}
        
        # Act
        @self.auth.require_auth
        def protected_route():
            return 'success'
            
        with patch('flask.request', self.mock_request):
            result = protected_route()
            
        # Assert
        self.assertEqual(result, 'success')
        
    def test_missing_authorization_header(self):
        # Arrange
        self.mock_request.headers = {}
        
        # Act
        @self.auth.require_auth
        def protected_route():
            return 'success'
            
        with patch('flask.request', self.mock_request):
            result = protected_route()
            
        # Assert
        self.assertEqual(result[0]['error'], 'Authorization header missing')
        self.assertEqual(result[1], 401)
        
    def test_malformed_authorization_header(self):
        # Arrange
        self.mock_request.headers = {'Authorization': 'InvalidFormat'}
        
        # Act
        @self.auth.require_auth
        def protected_route():
            return 'success'
            
        with patch('flask.request', self.mock_request):
            result = protected_route()
            
        # Assert
        self.assertEqual(result[0]['error'], 'Invalid authorization format')
        self.assertEqual(result[1], 401)


class TestRateLimiter(unittest.TestCase):
    def setUp(self):
        self.limiter = RateLimiter(requests=2, window=60)
        
    def test_rate_limit_allows_requests_within_limit(self):
        # First request should pass
        self.assertTrue(self.limiter.is_allowed('test-ip'))
        # Second request should pass
        self.assertTrue(self.limiter.is_allowed('test-ip'))
        
    def test_rate_limit_blocks_requests_over_limit(self):
        # Use up the limit
        self.limiter.is_allowed('test-ip')
        self.limiter.is_allowed('test-ip')
        
        # Third request should be blocked
        self.assertFalse(self.limiter.is_allowed('test-ip'))
        
    def test_rate_limit_resets_after_window(self):
        # Use up the limit
        self.limiter.is_allowed('test-ip')
        self.limiter.is_allowed('test-ip')
        
        # Manually adjust the timestamp to simulate time passing
        if 'test-ip' in self.limiter.requests:
            self.limiter.requests['test-ip'] = [
                req - 61 for req in self.limiter.requests['test-ip']
            ]
        
        # Should be allowed again
        self.assertTrue(self.limiter.is_allowed('test-ip'))
        
    def test_different_ips_tracked_separately(self):
        # IP 1 uses up its limit
        self.limiter.is_allowed('ip-1')
        self.limiter.is_allowed('ip-1')
        self.assertFalse(self.limiter.is_allowed('ip-1'))
        
        # IP 2 should still be allowed
        self.assertTrue(self.limiter.is_allowed('ip-2'))


if __name__ == '__main__':
    unittest.main()