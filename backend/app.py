import os
import base64
import json
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import cv2
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, storage
from services.face_shape_detector import FaceShapeDetector
from services.personal_color_analyzer import PersonalColorAnalyzer
from utils.image_processor import ImageProcessor
from auth import auth_middleware
from api.advanced_face_analysis import advanced_face_bp

app = Flask(__name__)
# SECURITY: Configure CORS properly
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '').split(',')
if not allowed_origins or allowed_origins == ['']:
    # Default to localhost for development only
    allowed_origins = ['http://localhost:3000', 'http://localhost:3003']

CORS(app, 
     origins=allowed_origins,
     supports_credentials=True,
     max_age=3600,
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

# Firebase初期化
if not firebase_admin._apps:
    cred = credentials.Certificate({
        "project_id": os.environ.get('FIREBASE_ADMIN_PROJECT_ID'),
        "private_key": os.environ.get('FIREBASE_ADMIN_PRIVATE_KEY').replace('\\n', '\n'),
        "client_email": os.environ.get('FIREBASE_ADMIN_CLIENT_EMAIL'),
    })
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', '')
    })

db = firestore.client()
bucket = storage.bucket()

# AIモデルの初期化
face_shape_detector = FaceShapeDetector()
color_analyzer = PersonalColorAnalyzer()

# Register blueprints
app.register_blueprint(advanced_face_bp, url_prefix='/api/advanced')

@app.route('/health', methods=['GET'])
def health_check():
    """ヘルスチェックエンドポイント"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/diagnosis/face', methods=['POST'])
@auth_middleware.require_auth
def diagnose_face():
    """顔型診断API"""
    try:
        data = request.get_json()
        
        # バリデーション
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'Image data is required'}), 400
        
        # Use authenticated user ID instead of trusting client input
        user_id = request.user['id']
        
        # Base64画像デコード
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # OpenCV形式に変換
        image_np = np.array(image)
        if image_np.shape[2] == 4:  # RGBA to RGB
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGBA2RGB)
        
        # 顔型診断実行
        start_time = datetime.utcnow()
        result = face_shape_detector.detect_face_shape(image_np)
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Face detection failed')
            }), 400
        
        # 結果をFirestoreに保存
        diagnosis_ref = db.collection('diagnoses').document()
        diagnosis_data = {
            'userId': data['userId'],
            'type': 'face_shape',
            'result': result['face_shape'],
            'confidence': result['confidence'],
            'landmarks': result.get('landmarks', []),
            'processingTime': processing_time,
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        diagnosis_ref.set(diagnosis_data)
        
        # ユーザーの診断結果を更新
        user_ref = db.collection('users').document(data['userId'])
        user_ref.update({
            'diagnoses.faceShape': result['face_shape'],
            'diagnoses.diagnosedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'success': True,
            'data': {
                'faceShape': result['face_shape'],
                'faceShapeJapanese': result.get('face_shape_japanese', result['face_shape']),
                'description': result.get('description', ''),
                'confidence': result['confidence'],
                'landmarks': result.get('landmarks', []),
                'measurements': result.get('measurements', {}),
                'hairstyleRecommendations': result.get('hairstyle_recommendations', {}),
                'processingTime': processing_time,
                'diagnosisId': diagnosis_ref.id,
                'analysisMethod': result.get('analysis_method', '')
            }
        })
        
    except Exception as e:
        app.logger.error(f"Face diagnosis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/diagnosis/color', methods=['POST'])
@auth_middleware.require_auth
def diagnose_color():
    """パーソナルカラー診断API"""
    try:
        data = request.get_json()
        
        # バリデーション
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'Image data is required'}), 400
        
        # Use authenticated user ID instead of trusting client input
        user_id = request.user['id']
        
        # Base64画像デコード
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # OpenCV形式に変換
        image_np = np.array(image)
        if image_np.shape[2] == 4:  # RGBA to RGB
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGBA2RGB)
        
        # パーソナルカラー診断実行
        start_time = datetime.utcnow()
        result = color_analyzer.analyze_personal_color(image_np)
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Color analysis failed')
            }), 400
        
        # 結果をFirestoreに保存
        diagnosis_ref = db.collection('diagnoses').document()
        diagnosis_data = {
            'userId': data['userId'],
            'type': 'personal_color',
            'result': {
                'season': result['personal_color'],
                'subType': result['sub_type'],
                'palette': result['color_palette']
            },
            'confidence': result['confidence'],
            'processingTime': processing_time,
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        diagnosis_ref.set(diagnosis_data)
        
        # ユーザーの診断結果を更新
        user_ref = db.collection('users').document(data['userId'])
        user_ref.update({
            'diagnoses.personalColor': result['personal_color'],
            'diagnoses.colorSubType': result['sub_type'],
            'diagnoses.diagnosedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'success': True,
            'data': {
                'personalColor': result['personal_color'],
                'personalColorJapanese': result.get('personal_color_japanese', result['personal_color']),
                'description': result.get('description', ''),
                'subType': result['sub_type'],
                'confidence': result['confidence'],
                'colorPalette': result.get('color_palette', {}),
                'avoidColors': result.get('avoid_colors', []),
                'celebrityExamples': result.get('celebrity_examples', []),
                'detectedColors': result.get('detected_colors', {}),
                'makeupRecommendations': result.get('makeup_recommendations', {}),
                'brandRecommendations': result.get('brand_recommendations', {}),
                'beautyTips': color_analyzer.get_japanese_beauty_tips(result['personal_color']),
                'processingTime': processing_time,
                'diagnosisId': diagnosis_ref.id,
                'analysisMethod': result.get('analysis_method', '')
            }
        })
        
    except Exception as e:
        app.logger.error(f"Color diagnosis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/diagnosis/complete', methods=['POST'])
@auth_middleware.require_auth
def complete_diagnosis():
    """診断完了処理API（顔型＋パーソナルカラー）"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data or 'userId' not in data:
            return jsonify({'success': False, 'error': 'Invalid request data'}), 400
        
        # 画像デコード
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        image_np = np.array(image)
        
        if image_np.shape[2] == 4:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGBA2RGB)
        
        # 両方の診断を実行
        face_result = face_shape_detector.detect_face_shape(image_np)
        color_result = color_analyzer.analyze_personal_color(image_np)
        
        if not face_result['success'] or not color_result['success']:
            return jsonify({
                'success': False,
                'error': 'Diagnosis failed'
            }), 400
        
        # 総合診断結果を作成
        diagnosis_result = {
            'faceShape': face_result['face_shape'],
            'personalColor': color_result['personal_color'],
            'colorSubType': color_result['sub_type'],
            'confidence': {
                'faceShape': face_result['confidence'],
                'personalColor': color_result['confidence']
            },
            'recommendations': {
                'hairstyles': _get_hairstyle_recommendations(
                    face_result['face_shape'], 
                    color_result['personal_color']
                ),
                'colors': color_result['color_palette']['recommended'],
                'avoidStyles': _get_styles_to_avoid(face_result['face_shape']),
            },
            'colorPalette': color_result['color_palette']
        }
        
        # Firestoreに保存
        complete_diagnosis_ref = db.collection('complete_diagnoses').document()
        complete_diagnosis_ref.set({
            'userId': data['userId'],
            'result': diagnosis_result,
            'createdAt': firestore.SERVER_TIMESTAMP
        })
        
        # ユーザー情報更新
        user_ref = db.collection('users').document(data['userId'])
        user_ref.update({
            'diagnoses': {
                'faceShape': face_result['face_shape'],
                'personalColor': color_result['personal_color'],
                'colorSubType': color_result['sub_type'],
                'diagnosedAt': firestore.SERVER_TIMESTAMP
            }
        })
        
        return jsonify({
            'success': True,
            'data': diagnosis_result
        })
        
    except Exception as e:
        app.logger.error(f"Complete diagnosis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

def _get_hairstyle_recommendations(face_shape, personal_color):
    """日本人女性向け顔型とパーソナルカラーに基づくヘアスタイル推奨"""
    # 日本語の顔型名から英語にマッピング
    face_shape_map = {
        'tamago': 'oval', 'maru': 'round', 'shikaku': 'square', 
        'heart': 'heart', 'omochou': 'oblong'
    }
    english_face_shape = face_shape_map.get(face_shape, face_shape)
    
    recommendations = {
        'oval': ['どんなスタイルもOK', 'ボブ・ロング・ショート全て◎', 'ストレート・カール両方似合う'],
        'round': ['ロングヘア（縦ラインを強調）', 'ひし形シルエット', 'サイドに流す前髪', 'レイヤーカット'],
        'square': ['ゆるふわカール', 'ひし形ショートボブ', '前髪ありのミディアム', 'レイヤーで動きを出す'],
        'heart': ['顎ラインのボブ', '内巻きカール', '重めの前髪', '顎周りにボリューム'],
        'oblong': ['横にボリュームのあるボブ', 'ゆるめのパーマ', '厚めの前髪', 'ひし形シルエット']
    }
    
    # パーソナルカラー別ヘアカラー推奨
    color_styles = {
        'spring': ['明るいブラウン', 'コーラル系カラー', 'ハイライトで立体感'],
        'summer': ['アッシュブラウン', 'グレージュ系', 'ソフトなカラーリング'],
        'autumn': ['濃いブラウン', 'オレンジブラウン', '深みのあるカラー'],
        'winter': ['黒髪または暗いブラウン', 'クールトーン', 'コントラストのはっきり']
    }
    
    face_styles = recommendations.get(english_face_shape, recommendations['oval'])
    color_prefs = color_styles.get(personal_color, color_styles['spring'])
    
    return face_styles + color_prefs

def _get_styles_to_avoid(face_shape):
    """日本人女性向け顔型別避けるべきスタイル"""
    # 日本語の顔型名から英語にマッピング
    face_shape_map = {
        'tamago': 'oval', 'maru': 'round', 'shikaku': 'square',
        'heart': 'heart', 'omochou': 'oblong'
    }
    english_face_shape = face_shape_map.get(face_shape, face_shape)
    
    avoid_styles = {
        'oval': ['特になし'],  # 卵型は基本的に何でも似合う
        'round': ['ぱっつん前髪', 'ボブ（顎ライン）', '横にボリュームを出しすぎるカール'],
        'square': ['ストレートボブ', 'ワンレングス', '角を強調するスタイル'],
        'heart': ['トップにボリューム', 'かき上げ前髪', 'ショートスタイル'],
        'oblong': ['センター分け', 'ロングストレート', '縦のラインを強調するスタイル']
    }
    
    return avoid_styles.get(english_face_shape, [])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # SECURITY: Never run debug mode in production
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)