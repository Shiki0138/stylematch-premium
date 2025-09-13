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

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'https://stylematch.app'])

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

@app.route('/health', methods=['GET'])
def health_check():
    """ヘルスチェックエンドポイント"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/diagnosis/face', methods=['POST'])
def diagnose_face():
    """顔型診断API"""
    try:
        data = request.get_json()
        
        # バリデーション
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'Image data is required'}), 400
        
        if 'userId' not in data:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400
        
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
                'confidence': result['confidence'],
                'landmarks': result.get('landmarks', []),
                'processingTime': processing_time,
                'diagnosisId': diagnosis_ref.id
            }
        })
        
    except Exception as e:
        app.logger.error(f"Face diagnosis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/diagnosis/color', methods=['POST'])
def diagnose_color():
    """パーソナルカラー診断API"""
    try:
        data = request.get_json()
        
        # バリデーション
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'Image data is required'}), 400
        
        if 'userId' not in data:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400
        
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
                'subType': result['sub_type'],
                'confidence': result['confidence'],
                'colorPalette': result['color_palette'],
                'processingTime': processing_time,
                'diagnosisId': diagnosis_ref.id
            }
        })
        
    except Exception as e:
        app.logger.error(f"Color diagnosis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/diagnosis/complete', methods=['POST'])
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
    """顔型とパーソナルカラーに基づくヘアスタイルの推奨"""
    recommendations = {
        'oval': ['ロングヘア', 'ボブ', 'ショートヘア', 'センターパート'],
        'round': ['レイヤードロング', 'サイドパート', 'アシンメトリー'],
        'square': ['ソフトウェーブ', 'サイドバング', 'ロングレイヤー'],
        'heart': ['サイドスウィープバング', 'ミディアムレングス', 'ボブ'],
        'oblong': ['バング付きスタイル', 'ウェーブ', 'ボリュームスタイル']
    }
    
    color_styles = {
        'spring': ['明るめカラー', 'ハイライト'],
        'summer': ['アッシュ系', 'ローライト'],
        'autumn': ['暖色系カラー', 'オレンジブラウン'],
        'winter': ['ダークトーン', 'ツヤ感重視']
    }
    
    face_styles = recommendations.get(face_shape, [])
    color_prefs = color_styles.get(personal_color, [])
    
    return face_styles + color_prefs

def _get_styles_to_avoid(face_shape):
    """顔型に基づいて避けるべきスタイル"""
    avoid_styles = {
        'oval': [],  # オーバル型は基本的に何でも似合う
        'round': ['ボリュームのあるカール', '顎ラインのボブ'],
        'square': ['ストレートボブ', 'ブラントカット'],
        'heart': ['トップヘビー', 'フルバング'],
        'oblong': ['超ロングストレート', 'センターパート']
    }
    
    return avoid_styles.get(face_shape, [])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)