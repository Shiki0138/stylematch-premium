#!/usr/bin/env python3
"""
Advanced face analysis API endpoint
"""

from flask import Blueprint, request, jsonify
import numpy as np
import cv2
from typing import Dict, Tuple
import base64
import io
from PIL import Image
import traceback

# Import our advanced classifier
from services.advanced_face_classifier import AdvancedFaceClassifier
from services.face_shape_detector import FaceShapeDetector

# Create blueprint
advanced_face_bp = Blueprint('advanced_face', __name__)

# Initialize services
face_detector = FaceShapeDetector()
advanced_classifier = AdvancedFaceClassifier()

@advanced_face_bp.route('/analyze-advanced', methods=['POST'])
def analyze_advanced():
    """
    高度な顔型分析エンドポイント
    25種類の詳細分類を返す
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
            
        # Base64デコード
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        
        # PIL Imageに変換
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # 基本の顔型を検出
        base_type = data.get('base_type')
        if not base_type:
            base_result = face_detector.detect_face_shape(image_np)
            if not base_result or 'error' in base_result:
                return jsonify({'error': 'Face detection failed'}), 400
            base_type = base_result['face_type']
        
        # 顔のランドマークを再検出
        landmarks = face_detector.detect_landmarks(image_np)
        if landmarks is None:
            return jsonify({'error': 'Landmark detection failed'}), 400
        
        # 詳細な特徴量を計算
        features = advanced_classifier.calculate_advanced_features(landmarks, image_np)
        
        # サブタイプを分類
        subtype, confidence = advanced_classifier.classify_advanced(base_type, features)
        
        # 推奨事項を取得
        recommendations = advanced_classifier.get_subtype_recommendations(base_type, subtype)
        
        # サブタイプの詳細情報を取得
        subtype_info = advanced_classifier.sub_types.get(base_type, {}).get(subtype, {})
        
        # レスポンスを構築
        response = {
            'success': True,
            'base_type': base_type,
            'subtype': subtype,
            'subtype_name': subtype_info.get('name', 'Unknown'),
            'subtype_description': subtype_info.get('description', ''),
            'confidence': float(confidence),
            'features': {
                k: float(v) if isinstance(v, (int, float, np.number)) else v 
                for k, v in features.items()
            },
            'recommendations': recommendations
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in advanced face analysis: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@advanced_face_bp.route('/subtype-info/<base_type>', methods=['GET'])
def get_subtype_info(base_type: str):
    """
    特定の顔型のサブタイプ情報を取得
    """
    try:
        if base_type not in advanced_classifier.sub_types:
            return jsonify({'error': 'Invalid base type'}), 404
            
        subtypes = advanced_classifier.sub_types[base_type]
        
        # クライアント向けに整形
        subtype_list = []
        for subtype_id, info in subtypes.items():
            subtype_list.append({
                'id': subtype_id,
                'name': info.get('name', ''),
                'description': info.get('description', ''),
                'conditions': list(info.get('conditions', {}).keys())
            })
        
        return jsonify({
            'base_type': base_type,
            'subtypes': subtype_list
        })
        
    except Exception as e:
        print(f"Error getting subtype info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advanced_face_bp.route('/all-subtypes', methods=['GET'])
def get_all_subtypes():
    """
    全ての顔型とサブタイプの一覧を取得
    """
    try:
        all_subtypes = {}
        
        for base_type, subtypes in advanced_classifier.sub_types.items():
            all_subtypes[base_type] = []
            for subtype_id, info in subtypes.items():
                all_subtypes[base_type].append({
                    'id': subtype_id,
                    'name': info.get('name', ''),
                    'description': info.get('description', '')
                })
        
        return jsonify({
            'total_count': sum(len(subtypes) for subtypes in all_subtypes.values()),
            'base_types': list(all_subtypes.keys()),
            'subtypes': all_subtypes
        })
        
    except Exception as e:
        print(f"Error getting all subtypes: {str(e)}")
        return jsonify({'error': str(e)}), 500