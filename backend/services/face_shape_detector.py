import cv2
import numpy as np
import dlib
import face_recognition
from typing import Dict, List, Tuple, Optional

class FaceShapeDetector:
    """顔型検出クラス"""
    
    def __init__(self):
        # dlibの顔検出器と特徴点検出器を初期化
        self.face_detector = dlib.get_frontal_face_detector()
        
        # 顔型の定義（比率）
        self.face_shape_ratios = {
            'oval': {'width_height_ratio': (0.65, 0.80), 'jaw_forehead_ratio': (0.85, 1.0)},
            'round': {'width_height_ratio': (0.80, 1.0), 'jaw_forehead_ratio': (0.95, 1.05)},
            'square': {'width_height_ratio': (0.75, 0.95), 'jaw_forehead_ratio': (0.95, 1.05)},
            'heart': {'width_height_ratio': (0.70, 0.85), 'jaw_forehead_ratio': (0.60, 0.80)},
            'oblong': {'width_height_ratio': (0.50, 0.65), 'jaw_forehead_ratio': (0.85, 1.0)}
        }
    
    def detect_face_shape(self, image: np.ndarray) -> Dict:
        """
        顔型を検出する
        
        Args:
            image: 入力画像（NumPy配列）
            
        Returns:
            検出結果を含む辞書
        """
        try:
            # 画像をグレースケールに変換
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # 顔を検出
            faces = self.face_detector(gray, 1)
            
            if len(faces) == 0:
                return {
                    'success': False,
                    'error': '顔が検出されませんでした。正面から撮影した写真を使用してください。'
                }
            
            # 最初の顔を使用
            face = faces[0]
            
            # face_recognitionで顔のランドマークを取得
            face_landmarks_list = face_recognition.face_landmarks(image)
            
            if not face_landmarks_list:
                return {
                    'success': False,
                    'error': '顔の特徴点が検出できませんでした。'
                }
            
            face_landmarks = face_landmarks_list[0]
            
            # 顔型を分析
            face_shape, confidence, measurements = self._analyze_face_shape(face_landmarks)
            
            # ランドマークを整形
            landmarks = []
            for feature, points in face_landmarks.items():
                for point in points:
                    landmarks.append({
                        'feature': feature,
                        'x': point[0],
                        'y': point[1]
                    })
            
            return {
                'success': True,
                'face_shape': face_shape,
                'confidence': confidence,
                'landmarks': landmarks,
                'measurements': measurements
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'顔型検出エラー: {str(e)}'
            }
    
    def _analyze_face_shape(self, face_landmarks: Dict) -> Tuple[str, float, Dict]:
        """
        顔のランドマークから顔型を分析
        
        Args:
            face_landmarks: 顔の特徴点辞書
            
        Returns:
            (顔型, 信頼度, 測定値)のタプル
        """
        # 主要な測定点を取得
        chin = face_landmarks['chin']
        left_eyebrow = face_landmarks['left_eyebrow']
        right_eyebrow = face_landmarks['right_eyebrow']
        
        # 顔の幅（頬骨の位置）
        face_width = self._calculate_distance(chin[3], chin[13])
        
        # 顔の高さ（額から顎まで）
        forehead_point = self._get_midpoint(left_eyebrow[0], right_eyebrow[-1])
        chin_point = chin[8]  # 顎の中心点
        face_height = self._calculate_distance(forehead_point, chin_point)
        
        # 額の幅
        forehead_width = self._calculate_distance(left_eyebrow[0], right_eyebrow[-1])
        
        # 顎の幅
        jaw_width = self._calculate_distance(chin[4], chin[12])
        
        # 比率を計算
        width_height_ratio = face_width / face_height if face_height > 0 else 0
        jaw_forehead_ratio = jaw_width / forehead_width if forehead_width > 0 else 0
        
        measurements = {
            'face_width': float(face_width),
            'face_height': float(face_height),
            'forehead_width': float(forehead_width),
            'jaw_width': float(jaw_width),
            'width_height_ratio': float(width_height_ratio),
            'jaw_forehead_ratio': float(jaw_forehead_ratio)
        }
        
        # 顔型を判定
        face_shape, confidence = self._classify_face_shape(
            width_height_ratio, 
            jaw_forehead_ratio
        )
        
        return face_shape, confidence, measurements
    
    def _classify_face_shape(self, width_height_ratio: float, 
                           jaw_forehead_ratio: float) -> Tuple[str, float]:
        """
        比率から顔型を分類
        
        Args:
            width_height_ratio: 幅/高さの比率
            jaw_forehead_ratio: 顎/額の比率
            
        Returns:
            (顔型, 信頼度)のタプル
        """
        best_match = 'oval'
        best_score = 0.0
        
        for shape, ratios in self.face_shape_ratios.items():
            # 各比率がどれだけ理想的な範囲に近いか計算
            wh_score = self._calculate_ratio_score(
                width_height_ratio, 
                ratios['width_height_ratio']
            )
            jf_score = self._calculate_ratio_score(
                jaw_forehead_ratio, 
                ratios['jaw_forehead_ratio']
            )
            
            # 総合スコア
            total_score = (wh_score + jf_score) / 2
            
            if total_score > best_score:
                best_score = total_score
                best_match = shape
        
        # 信頼度は0.0〜1.0の範囲に正規化
        confidence = min(max(best_score, 0.0), 1.0)
        
        # 信頼度が低い場合は調整
        if confidence < 0.6:
            # デフォルトでoval型に設定（最も一般的）
            best_match = 'oval'
            confidence = 0.65
        
        return best_match, confidence
    
    def _calculate_ratio_score(self, value: float, target_range: Tuple[float, float]) -> float:
        """
        値が目標範囲にどれだけ近いか計算
        
        Args:
            value: 評価する値
            target_range: 目標範囲（最小値, 最大値）
            
        Returns:
            スコア（0.0〜1.0）
        """
        min_val, max_val = target_range
        
        if min_val <= value <= max_val:
            # 範囲内の場合は完璧なスコア
            return 1.0
        elif value < min_val:
            # 範囲より小さい場合
            distance = min_val - value
            return max(0.0, 1.0 - (distance / min_val))
        else:
            # 範囲より大きい場合
            distance = value - max_val
            return max(0.0, 1.0 - (distance / max_val))
    
    @staticmethod
    def _calculate_distance(point1: Tuple, point2: Tuple) -> float:
        """2点間の距離を計算"""
        if isinstance(point1, (list, tuple)) and len(point1) >= 2:
            x1, y1 = point1[0], point1[1]
        else:
            x1, y1 = point1[0], point1[1] 
            
        if isinstance(point2, (list, tuple)) and len(point2) >= 2:
            x2, y2 = point2[0], point2[1]
        else:
            x2, y2 = point2[0], point2[1]
            
        return np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    
    @staticmethod
    def _get_midpoint(point1: Tuple, point2: Tuple) -> Tuple[float, float]:
        """2点の中点を取得"""
        if isinstance(point1, (list, tuple)) and len(point1) >= 2:
            x1, y1 = point1[0], point1[1]
        else:
            x1, y1 = point1[0], point1[1]
            
        if isinstance(point2, (list, tuple)) and len(point2) >= 2:
            x2, y2 = point2[0], point2[1]
        else:
            x2, y2 = point2[0], point2[1]
            
        return ((x1 + x2) / 2, (y1 + y2) / 2)