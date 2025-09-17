import os
import jwt
import firebase_admin
from firebase_admin import auth as firebase_auth
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
import time

class AuthMiddleware:
    """Firebase認証とJWTトークン検証"""
    
    def __init__(self):
        self.jwt_secret = os.environ.get('JWT_SECRET', os.environ.get('NEXTAUTH_SECRET'))
        if not self.jwt_secret:
            raise ValueError("JWT_SECRET is not set in environment variables")
        
        # Rate limiting storage (本番環境ではRedisを使用)
        self.rate_limit_storage = {}
        self.max_requests_per_window = int(os.environ.get('RATE_LIMIT_MAX_REQUESTS', 100))
        self.window_ms = int(os.environ.get('RATE_LIMIT_WINDOW_MS', 900000))  # 15分
    
    def verify_firebase_token(self, token):
        """Firebaseトークンの検証"""
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            print(f"Firebase token verification failed: {str(e)}")
            return None
    
    def verify_jwt_token(self, token):
        """JWTトークンの検証"""
        try:
            decoded = jwt.decode(
                token, 
                self.jwt_secret, 
                algorithms=['HS256']
            )
            # トークンの有効期限チェック
            if 'exp' in decoded and decoded['exp'] < time.time():
                return None
            return decoded
        except jwt.InvalidTokenError:
            return None
    
    def check_rate_limit(self, user_id):
        """レート制限チェック"""
        current_time = int(time.time() * 1000)  # ミリ秒
        window_start = current_time - self.window_ms
        
        if user_id not in self.rate_limit_storage:
            self.rate_limit_storage[user_id] = []
        
        # 古いリクエストを削除
        self.rate_limit_storage[user_id] = [
            req_time for req_time in self.rate_limit_storage[user_id]
            if req_time > window_start
        ]
        
        # リクエスト数チェック
        if len(self.rate_limit_storage[user_id]) >= self.max_requests_per_window:
            return False
        
        # 新しいリクエストを記録
        self.rate_limit_storage[user_id].append(current_time)
        return True
    
    def require_auth(self, f):
        """認証が必要なエンドポイント用デコレータ"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Authorizationヘッダーの確認
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({
                    'success': False,
                    'error': 'Authorization header is missing'
                }), 401
            
            # Bearer トークンの抽出
            try:
                token_type, token = auth_header.split(' ')
                if token_type != 'Bearer':
                    raise ValueError("Invalid token type")
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid authorization header format'
                }), 401
            
            # Firebaseトークンの検証を試みる
            user_data = self.verify_firebase_token(token)
            
            # FirebaseトークンがダメならJWTトークンを試す
            if not user_data:
                user_data = self.verify_jwt_token(token)
            
            if not user_data:
                return jsonify({
                    'success': False,
                    'error': 'Invalid or expired token'
                }), 401
            
            # ユーザーIDの取得
            user_id = user_data.get('uid') or user_data.get('sub')
            if not user_id:
                return jsonify({
                    'success': False,
                    'error': 'User ID not found in token'
                }), 401
            
            # レート制限チェック
            if not self.check_rate_limit(user_id):
                return jsonify({
                    'success': False,
                    'error': 'Rate limit exceeded. Please try again later.'
                }), 429
            
            # リクエストにユーザー情報を追加
            request.user = {
                'id': user_id,
                'email': user_data.get('email'),
                'name': user_data.get('name')
            }
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    def require_admin(self, f):
        """管理者権限が必要なエンドポイント用デコレータ"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # まず通常の認証チェック
            auth_result = self.require_auth(lambda: None)()
            if auth_result:
                return auth_result
            
            # 管理者権限チェック
            if not request.user.get('admin', False):
                return jsonify({
                    'success': False,
                    'error': 'Admin access required'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function

# シングルトンインスタンス
auth_middleware = AuthMiddleware()