#!/usr/bin/env python3
"""
顔型×サブタイプ 25分類システム
日本人女性向けの詳細な顔型分類
"""

import numpy as np
from typing import Dict, Tuple, List
import cv2

class AdvancedFaceClassifier:
    def __init__(self):
        # 基本5分類
        self.base_types = ['tamago', 'maru', 'shikaku', 'heart', 'omochou']
        
        # 各顔型のサブタイプ定義
        self.sub_types = {
            'tamago': {
                'standard': {
                    'name': '標準タイプ',
                    'description': '教科書的な理想バランス',
                    'conditions': {
                        'symmetry_score': (0.85, 1.0),
                        'face_area_ratio': (0.45, 0.55),  # 顔の大きさ（平均比）
                        'chin_angle': (110, 130)  # 顎の角度
                    }
                },
                'compact': {
                    'name': '小顔タイプ',
                    'description': '全体的に小さめでコンパクト',
                    'conditions': {
                        'face_area_ratio': (0.3, 0.45),
                        'feature_concentration': (0.7, 1.0)  # 顔のパーツの集中度
                    }
                },
                'elegant': {
                    'name': 'エレガントタイプ',
                    'description': 'やや面長寄りで上品な印象',
                    'conditions': {
                        'width_height_ratio_modifier': (-0.05, -0.02),
                        'nose_length_ratio': (0.32, 0.38)
                    }
                },
                'cute': {
                    'name': 'キュートタイプ',
                    'description': 'やや丸顔寄りで可愛らしい',
                    'conditions': {
                        'width_height_ratio_modifier': (0.02, 0.05),
                        'cheek_fullness': (0.6, 0.8)
                    }
                },
                'sharp': {
                    'name': 'シャープタイプ',
                    'description': '顎がややシャープで都会的',
                    'conditions': {
                        'chin_angle': (90, 110),
                        'jawline_sharpness': (0.7, 1.0)
                    }
                }
            },
            'maru': {
                'baby_face': {
                    'name': 'ベビーフェイスタイプ',
                    'description': '童顔で年齢より若く見える',
                    'conditions': {
                        'eye_size_ratio': (0.25, 0.35),  # 大きめの目
                        'nose_size_ratio': (0.08, 0.12),  # 小さめの鼻
                        'lip_fullness': (0.15, 0.25)
                    }
                },
                'plump': {
                    'name': 'ぽっちゃりタイプ',
                    'description': '頬の膨らみが特に目立つ',
                    'conditions': {
                        'cheek_fullness': (0.8, 1.0),
                        'face_area_ratio': (0.55, 0.7)
                    }
                },
                'compact': {
                    'name': '小顔タイプ',
                    'description': '顔は丸いが全体的に小さい',
                    'conditions': {
                        'face_area_ratio': (0.3, 0.45),
                        'width_height_ratio': (0.82, 0.92)
                    }
                },
                'cheekbone': {
                    'name': '頬骨タイプ',
                    'description': '頬骨が発達している',
                    'conditions': {
                        'cheekbone_prominence': (0.7, 1.0),
                        'cheekbone_width_ratio': (1.05, 1.15)
                    }
                },
                'feminine': {
                    'name': 'フェミニンタイプ',
                    'description': '柔らかい印象が強い',
                    'conditions': {
                        'curve_smoothness': (0.8, 1.0),
                        'angular_features': (0.0, 0.3)
                    }
                }
            },
            'shikaku': {
                'prominent_jaw': {
                    'name': 'エラ張りタイプ',
                    'description': 'エラが特に目立つ',
                    'conditions': {
                        'jaw_angle': (75, 90),
                        'jaw_width_ratio': (1.1, 1.25)
                    }
                },
                'masculine': {
                    'name': '男顔タイプ',
                    'description': '骨格がしっかり、クールな印象',
                    'conditions': {
                        'angular_features': (0.7, 1.0),
                        'brow_prominence': (0.6, 1.0)
                    }
                },
                'compact': {
                    'name': 'コンパクトタイプ',
                    'description': '四角いが小さめ',
                    'conditions': {
                        'face_area_ratio': (0.3, 0.45),
                        'jaw_width_ratio': (0.95, 1.1)
                    }
                },
                'wide': {
                    'name': 'ワイドタイプ',
                    'description': '横幅が広い',
                    'conditions': {
                        'width_height_ratio': (0.88, 0.98),
                        'face_width_percentile': (70, 100)
                    }
                },
                'soft': {
                    'name': 'ソフトタイプ',
                    'description': '角張っているが柔らかい印象',
                    'conditions': {
                        'curve_smoothness': (0.5, 0.8),
                        'skin_texture_softness': (0.6, 1.0)
                    }
                }
            },
            'heart': {
                'sharp_chin': {
                    'name': 'シャープタイプ',
                    'description': '顎が特に細い',
                    'conditions': {
                        'chin_width_ratio': (0.15, 0.25),
                        'chin_angle': (70, 90)
                    }
                },
                'wide_forehead': {
                    'name': '額広タイプ',
                    'description': '額が特に広い',
                    'conditions': {
                        'forehead_width_ratio': (1.15, 1.3),
                        'forehead_height_ratio': (0.35, 0.45)
                    }
                },
                'cheekbone': {
                    'name': '頬骨タイプ',
                    'description': '頬骨が張っている',
                    'conditions': {
                        'cheekbone_prominence': (0.7, 1.0),
                        'cheekbone_angle': (100, 120)
                    }
                },
                'petite': {
                    'name': '小顔タイプ',
                    'description': '全体的に小さく華奢',
                    'conditions': {
                        'face_area_ratio': (0.25, 0.4),
                        'delicate_features': (0.7, 1.0)
                    }
                },
                'balanced': {
                    'name': 'バランスタイプ',
                    'description': '比較的バランスが良い',
                    'conditions': {
                        'jaw_forehead_ratio': (0.65, 0.78),
                        'symmetry_score': (0.8, 1.0)
                    }
                }
            },
            'omochou': {
                'slender': {
                    'name': 'スレンダータイプ',
                    'description': '全体的に細長い',
                    'conditions': {
                        'width_height_ratio': (0.52, 0.58),
                        'face_thinness': (0.7, 1.0)
                    }
                },
                'elegant': {
                    'name': 'エレガントタイプ',
                    'description': '上品な縦長',
                    'conditions': {
                        'nose_length_ratio': (0.35, 0.42),
                        'refinement_score': (0.7, 1.0)
                    }
                },
                'narrow_forehead': {
                    'name': '額狭タイプ',
                    'description': '額が狭く顎が長い',
                    'conditions': {
                        'forehead_width_ratio': (0.75, 0.9),
                        'chin_length_ratio': (0.35, 0.45)
                    }
                },
                'long_midface': {
                    'name': '頬長タイプ',
                    'description': '頬の部分が特に長い',
                    'conditions': {
                        'midface_ratio': (0.4, 0.5),
                        'eye_mouth_distance': (0.35, 0.45)
                    }
                },
                'long_chin': {
                    'name': '顎長タイプ',
                    'description': '顎が特に長い',
                    'conditions': {
                        'chin_length_ratio': (0.35, 0.5),
                        'lower_face_ratio': (0.4, 0.5)
                    }
                }
            }
        }
        
    def calculate_advanced_features(self, landmarks: np.ndarray, image: np.ndarray) -> Dict:
        """詳細な特徴量を計算"""
        features = {}
        
        # 基本測定値
        face_width = np.linalg.norm(landmarks[16] - landmarks[0])
        face_height = np.linalg.norm(landmarks[8] - landmarks[27])
        
        # 顔の面積（概算）
        face_contour = landmarks[0:17]
        face_area = cv2.contourArea(face_contour)
        image_area = image.shape[0] * image.shape[1]
        features['face_area_ratio'] = face_area / image_area
        
        # 対称性スコア
        left_half = landmarks[0:9]
        right_half = landmarks[8:17]
        symmetry_score = self._calculate_symmetry(left_half, right_half)
        features['symmetry_score'] = symmetry_score
        
        # 顎の角度
        jaw_left = landmarks[5]
        jaw_center = landmarks[8]
        jaw_right = landmarks[11]
        features['chin_angle'] = self._calculate_angle(jaw_left, jaw_center, jaw_right)
        
        # 頬の膨らみ
        cheek_points = landmarks[1:6]
        features['cheek_fullness'] = self._calculate_cheek_fullness(cheek_points, face_contour)
        
        # 頬骨の突出度
        features['cheekbone_prominence'] = self._calculate_cheekbone_prominence(landmarks)
        
        # 顎のシャープさ
        features['jawline_sharpness'] = self._calculate_jawline_sharpness(landmarks[5:12])
        
        # 目のサイズ比率
        eye_width = np.linalg.norm(landmarks[39] - landmarks[36])
        features['eye_size_ratio'] = eye_width / face_width
        
        # 鼻のサイズ比率
        nose_width = np.linalg.norm(landmarks[35] - landmarks[31])
        features['nose_size_ratio'] = nose_width / face_width
        
        # 額の幅と高さ
        forehead_width = np.linalg.norm(landmarks[17] - landmarks[26])
        features['forehead_width_ratio'] = forehead_width / face_width
        
        # 中顔面の長さ
        midface_length = np.linalg.norm(landmarks[33] - landmarks[27])
        features['midface_ratio'] = midface_length / face_height
        
        # 下顔面の長さ
        lower_face_length = np.linalg.norm(landmarks[8] - landmarks[33])
        features['lower_face_ratio'] = lower_face_length / face_height
        
        return features
    
    def classify_advanced(self, base_type: str, features: Dict) -> Tuple[str, float]:
        """詳細なサブタイプ分類"""
        if base_type not in self.sub_types:
            return 'standard', 0.5
            
        best_subtype = 'standard'
        best_score = 0.0
        
        for subtype, config in self.sub_types[base_type].items():
            score = self._calculate_subtype_score(features, config['conditions'])
            if score > best_score:
                best_score = score
                best_subtype = subtype
                
        return best_subtype, best_score
    
    def _calculate_subtype_score(self, features: Dict, conditions: Dict) -> float:
        """サブタイプのスコア計算"""
        scores = []
        
        for feature_name, (min_val, max_val) in conditions.items():
            if feature_name in features:
                value = features[feature_name]
                if min_val <= value <= max_val:
                    # 範囲の中心に近いほど高スコア
                    center = (min_val + max_val) / 2
                    distance = abs(value - center) / (max_val - min_val)
                    scores.append(1.0 - distance)
                else:
                    scores.append(0.0)
        
        return np.mean(scores) if scores else 0.0
    
    def _calculate_symmetry(self, left_half: np.ndarray, right_half: np.ndarray) -> float:
        """顔の対称性を計算"""
        # 簡易的な対称性計算
        flipped_right = right_half.copy()
        flipped_right[:, 0] = -flipped_right[:, 0]
        
        distances = [np.linalg.norm(left_half[i] - flipped_right[-(i+1)]) 
                    for i in range(min(len(left_half), len(right_half)))]
        
        avg_distance = np.mean(distances)
        # 距離が小さいほど対称性が高い
        symmetry_score = 1.0 / (1.0 + avg_distance * 0.01)
        
        return symmetry_score
    
    def _calculate_angle(self, p1: np.ndarray, p2: np.ndarray, p3: np.ndarray) -> float:
        """3点から角度を計算"""
        v1 = p1 - p2
        v2 = p3 - p2
        
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        angle_rad = np.arccos(np.clip(cos_angle, -1.0, 1.0))
        angle_deg = np.degrees(angle_rad)
        
        return angle_deg
    
    def _calculate_cheek_fullness(self, cheek_points: np.ndarray, face_contour: np.ndarray) -> float:
        """頬の膨らみを計算"""
        # 頬のポイントが顔の輪郭からどれだけ内側にあるかを計算
        cheek_center = np.mean(cheek_points, axis=0)
        face_center = np.mean(face_contour, axis=0)
        
        # 顔の中心から頬の中心までの距離
        distance = np.linalg.norm(cheek_center - face_center)
        face_width = np.max(face_contour[:, 0]) - np.min(face_contour[:, 0])
        
        # 距離が短いほど頬が膨らんでいる
        fullness = 1.0 - (distance / face_width)
        
        return np.clip(fullness, 0.0, 1.0)
    
    def _calculate_cheekbone_prominence(self, landmarks: np.ndarray) -> float:
        """頬骨の突出度を計算"""
        # 頬骨付近のランドマークの幅
        cheekbone_width = np.linalg.norm(landmarks[15] - landmarks[1])
        face_width = np.linalg.norm(landmarks[16] - landmarks[0])
        
        prominence = cheekbone_width / face_width
        
        return prominence
    
    def _calculate_jawline_sharpness(self, jaw_points: np.ndarray) -> float:
        """顎ラインのシャープさを計算"""
        # 顎ラインの角度変化を計算
        angles = []
        for i in range(1, len(jaw_points) - 1):
            angle = self._calculate_angle(jaw_points[i-1], jaw_points[i], jaw_points[i+1])
            angles.append(angle)
        
        # 角度が急なほどシャープ
        avg_angle = np.mean(angles)
        sharpness = 1.0 - (avg_angle / 180.0)
        
        return np.clip(sharpness, 0.0, 1.0)
    
    def get_subtype_recommendations(self, base_type: str, subtype: str) -> Dict:
        """サブタイプに応じた詳細な推奨事項"""
        recommendations = {
            'tamago': {
                'standard': {
                    'hairstyles': ['どんなスタイルも似合う', 'トレンドスタイルに挑戦'],
                    'avoid': ['特になし'],
                    'tips': ['理想的なバランスを活かして冒険的なスタイルも']
                },
                'compact': {
                    'hairstyles': ['ショートヘア', 'コンパクトなボブ', 'ピクシーカット'],
                    'avoid': ['ボリューム過多のスタイル'],
                    'tips': ['小顔を活かしたシャープなスタイルが◎']
                }
                # ... 他のサブタイプも同様に定義
            }
            # ... 他の顔型も同様に定義
        }
        
        if base_type in recommendations and subtype in recommendations[base_type]:
            return recommendations[base_type][subtype]
        
        return {
            'hairstyles': ['プロの美容師にご相談ください'],
            'avoid': [],
            'tips': ['あなたの個性を活かしたスタイルを']
        }