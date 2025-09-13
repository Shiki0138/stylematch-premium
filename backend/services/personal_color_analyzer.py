import cv2
import numpy as np
from sklearn.cluster import KMeans
import face_recognition
from typing import Dict, Tuple, List, Optional

class PersonalColorAnalyzer:
    """パーソナルカラー分析クラス"""
    
    def __init__(self):
        # パーソナルカラーの定義
        self.seasonal_colors = {
            'spring': {
                'name': 'spring',
                'sub_type': 'warm',
                'skin_tones': [(245, 225, 205), (255, 235, 215), (250, 230, 210)],
                'hair_colors': [(180, 140, 100), (200, 160, 120), (220, 180, 140)],
                'eye_colors': [(150, 120, 80), (170, 140, 100), (130, 100, 70)],
                'recommended_colors': ['#FFE4B5', '#FFDAB9', '#FFD700', '#FFA500', '#FF8C00'],
                'avoid_colors': ['#000080', '#191970', '#4B0082', '#8B008B']
            },
            'summer': {
                'name': 'summer', 
                'sub_type': 'cool',
                'skin_tones': [(255, 235, 235), (250, 230, 230), (245, 225, 225)],
                'hair_colors': [(160, 140, 140), (140, 120, 120), (120, 100, 100)],
                'eye_colors': [(120, 130, 140), (140, 150, 160), (100, 110, 120)],
                'recommended_colors': ['#E6E6FA', '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB'],
                'avoid_colors': ['#FF4500', '#FF6347', '#FF7F50', '#FFA500']
            },
            'autumn': {
                'name': 'autumn',
                'sub_type': 'warm',
                'skin_tones': [(240, 220, 190), (235, 215, 185), (230, 210, 180)],
                'hair_colors': [(140, 100, 60), (120, 80, 40), (160, 120, 80)],
                'eye_colors': [(120, 100, 60), (100, 80, 40), (140, 120, 80)],
                'recommended_colors': ['#D2691E', '#A0522D', '#8B4513', '#BC8F8F', '#CD853F'],
                'avoid_colors': ['#00CED1', '#00BFFF', '#87CEEB', '#87CEFA']
            },
            'winter': {
                'name': 'winter',
                'sub_type': 'cool',
                'skin_tones': [(255, 240, 240), (250, 235, 235), (245, 230, 230)],
                'hair_colors': [(40, 30, 30), (20, 20, 20), (60, 50, 50)],
                'eye_colors': [(40, 40, 50), (60, 60, 70), (20, 20, 30)],
                'recommended_colors': ['#000000', '#FFFFFF', '#DC143C', '#FF1493', '#C71585'],
                'avoid_colors': ['#F0E68C', '#EEE8AA', '#BDB76B', '#FFE4B5']
            }
        }
    
    def analyze_personal_color(self, image: np.ndarray) -> Dict:
        """
        パーソナルカラーを分析する
        
        Args:
            image: 入力画像（NumPy配列）
            
        Returns:
            分析結果を含む辞書
        """
        try:
            # 顔のランドマークを取得
            face_landmarks_list = face_recognition.face_landmarks(image)
            
            if not face_landmarks_list:
                return {
                    'success': False,
                    'error': '顔の特徴点が検出できませんでした。'
                }
            
            face_landmarks = face_landmarks_list[0]
            
            # 肌の色を抽出
            skin_color = self._extract_skin_color(image, face_landmarks)
            
            # 髪の色を抽出
            hair_color = self._extract_hair_color(image, face_landmarks)
            
            # 目の色を抽出
            eye_color = self._extract_eye_color(image, face_landmarks)
            
            # パーソナルカラーを判定
            personal_color, confidence = self._determine_personal_color(
                skin_color, hair_color, eye_color
            )
            
            # シーズンデータを取得
            season_data = self.seasonal_colors[personal_color]
            
            return {
                'success': True,
                'personal_color': personal_color,
                'sub_type': season_data['sub_type'],
                'confidence': confidence,
                'color_palette': {
                    'recommended': season_data['recommended_colors'],
                    'avoid': season_data['avoid_colors']
                },
                'detected_colors': {
                    'skin': self._rgb_to_hex(skin_color),
                    'hair': self._rgb_to_hex(hair_color),
                    'eye': self._rgb_to_hex(eye_color)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'パーソナルカラー分析エラー: {str(e)}'
            }
    
    def _extract_skin_color(self, image: np.ndarray, face_landmarks: Dict) -> Tuple[int, int, int]:
        """
        顔の肌の色を抽出
        
        Args:
            image: 入力画像
            face_landmarks: 顔の特徴点
            
        Returns:
            平均的な肌の色（RGB）
        """
        # 頬の領域を定義（目と口の間）
        left_eye = face_landmarks['left_eye']
        right_eye = face_landmarks['right_eye']
        nose_tip = face_landmarks['nose_tip']
        top_lip = face_landmarks['top_lip']
        
        # 頬の領域マスクを作成
        mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)
        
        # 左頬の領域
        left_cheek = [
            (left_eye[0][0], left_eye[-1][1]),
            (nose_tip[0][0], nose_tip[0][1]),
            (top_lip[0][0], top_lip[0][1])
        ]
        
        # 右頬の領域
        right_cheek = [
            (right_eye[0][0], right_eye[-1][1]),
            (nose_tip[-1][0], nose_tip[-1][1]),
            (top_lip[-1][0], top_lip[-1][1])
        ]
        
        # マスクに頬の領域を描画
        cv2.fillPoly(mask, [np.array(left_cheek, dtype=np.int32)], 255)
        cv2.fillPoly(mask, [np.array(right_cheek, dtype=np.int32)], 255)
        
        # マスク領域の色を抽出
        masked_image = cv2.bitwise_and(image, image, mask=mask)
        skin_pixels = masked_image[mask > 0]
        
        if len(skin_pixels) == 0:
            # デフォルト値を返す
            return (240, 220, 200)
        
        # K-meansクラスタリングで主要な色を抽出
        kmeans = KMeans(n_clusters=1, random_state=42, n_init=10)
        kmeans.fit(skin_pixels)
        dominant_color = kmeans.cluster_centers_[0]
        
        return tuple(map(int, dominant_color))
    
    def _extract_hair_color(self, image: np.ndarray, face_landmarks: Dict) -> Tuple[int, int, int]:
        """
        髪の色を抽出
        
        Args:
            image: 入力画像
            face_landmarks: 顔の特徴点
            
        Returns:
            平均的な髪の色（RGB）
        """
        # 額の上部領域を髪の領域として推定
        left_eyebrow = face_landmarks['left_eyebrow']
        right_eyebrow = face_landmarks['right_eyebrow']
        
        # 眉毛の上部に髪の領域を設定
        eyebrow_height = left_eyebrow[0][1]
        hair_region_top = max(0, eyebrow_height - 50)
        hair_region_bottom = eyebrow_height - 10
        hair_region_left = left_eyebrow[0][0]
        hair_region_right = right_eyebrow[-1][0]
        
        # 髪の領域を切り出し
        hair_region = image[hair_region_top:hair_region_bottom, 
                          hair_region_left:hair_region_right]
        
        if hair_region.size == 0:
            # デフォルト値を返す
            return (80, 60, 50)
        
        # 暗い色を髪の色として抽出
        gray = cv2.cvtColor(hair_region, cv2.COLOR_RGB2GRAY)
        mask = gray < np.percentile(gray, 50)  # 暗い50%の領域
        
        hair_pixels = hair_region[mask]
        
        if len(hair_pixels) == 0:
            return (80, 60, 50)
        
        # 平均色を計算
        mean_color = np.mean(hair_pixels, axis=0)
        
        return tuple(map(int, mean_color))
    
    def _extract_eye_color(self, image: np.ndarray, face_landmarks: Dict) -> Tuple[int, int, int]:
        """
        目の色を抽出
        
        Args:
            image: 入力画像
            face_landmarks: 顔の特徴点
            
        Returns:
            平均的な目の色（RGB）
        """
        # 左右の目の虹彩領域を推定
        left_eye = face_landmarks['left_eye']
        right_eye = face_landmarks['right_eye']
        
        # 目の中心点を計算
        left_center = np.mean(left_eye, axis=0).astype(int)
        right_center = np.mean(right_eye, axis=0).astype(int)
        
        # 虹彩の領域を小さく設定（瞳孔と虹彩）
        iris_radius = 5
        
        eye_colors = []
        
        for center in [left_center, right_center]:
            # 虹彩領域を切り出し
            y1 = max(0, center[1] - iris_radius)
            y2 = min(image.shape[0], center[1] + iris_radius)
            x1 = max(0, center[0] - iris_radius)
            x2 = min(image.shape[1], center[0] + iris_radius)
            
            iris_region = image[y1:y2, x1:x2]
            
            if iris_region.size > 0:
                # 暗い部分（瞳孔を除く）の平均色
                gray = cv2.cvtColor(iris_region, cv2.COLOR_RGB2GRAY)
                mask = (gray > np.percentile(gray, 20)) & (gray < np.percentile(gray, 80))
                iris_pixels = iris_region[mask]
                
                if len(iris_pixels) > 0:
                    mean_color = np.mean(iris_pixels, axis=0)
                    eye_colors.append(mean_color)
        
        if not eye_colors:
            # デフォルト値を返す
            return (100, 80, 60)
        
        # 左右の目の平均色
        avg_eye_color = np.mean(eye_colors, axis=0)
        
        return tuple(map(int, avg_eye_color))
    
    def _determine_personal_color(self, skin_color: Tuple[int, int, int],
                                hair_color: Tuple[int, int, int],
                                eye_color: Tuple[int, int, int]) -> Tuple[str, float]:
        """
        抽出した色からパーソナルカラーを判定
        
        Args:
            skin_color: 肌の色（RGB）
            hair_color: 髪の色（RGB）
            eye_color: 目の色（RGB）
            
        Returns:
            (パーソナルカラー, 信頼度)のタプル
        """
        best_match = 'spring'
        best_score = 0.0
        
        for season, data in self.seasonal_colors.items():
            # 各色の類似度を計算
            skin_score = self._calculate_color_similarity(skin_color, data['skin_tones'])
            hair_score = self._calculate_color_similarity(hair_color, data['hair_colors'])
            eye_score = self._calculate_color_similarity(eye_color, data['eye_colors'])
            
            # 重み付け平均（肌の色を最も重視）
            total_score = (skin_score * 0.5 + hair_score * 0.3 + eye_score * 0.2)
            
            if total_score > best_score:
                best_score = total_score
                best_match = season
        
        # 信頼度を正規化
        confidence = min(max(best_score, 0.0), 1.0)
        
        # 信頼度が低い場合は調整
        if confidence < 0.6:
            # 肌の色の明るさから推定
            brightness = sum(skin_color) / 3
            if brightness > 230:  # 明るい肌
                best_match = 'summer' if self._is_cool_tone(skin_color) else 'spring'
            else:  # 暗めの肌
                best_match = 'winter' if self._is_cool_tone(skin_color) else 'autumn'
            confidence = 0.65
        
        return best_match, confidence
    
    def _calculate_color_similarity(self, color: Tuple[int, int, int], 
                                  reference_colors: List[Tuple[int, int, int]]) -> float:
        """
        色の類似度を計算
        
        Args:
            color: 比較する色
            reference_colors: 参照色のリスト
            
        Returns:
            類似度スコア（0.0〜1.0）
        """
        similarities = []
        
        for ref_color in reference_colors:
            # ユークリッド距離を計算
            distance = np.sqrt(sum((c1 - c2) ** 2 for c1, c2 in zip(color, ref_color)))
            # 最大距離を441.67（白と黒の距離）として正規化
            similarity = 1.0 - (distance / 441.67)
            similarities.append(similarity)
        
        # 最も高い類似度を返す
        return max(similarities) if similarities else 0.0
    
    def _is_cool_tone(self, color: Tuple[int, int, int]) -> bool:
        """
        色がクールトーンかどうか判定
        
        Args:
            color: RGB色
            
        Returns:
            クールトーンならTrue
        """
        r, g, b = color
        # 赤みが少なく、青みが多い場合はクールトーン
        return b > r or (g > r and b > (r * 0.8))
    
    @staticmethod
    def _rgb_to_hex(color: Tuple[int, int, int]) -> str:
        """RGBを16進数カラーコードに変換"""
        return '#{:02x}{:02x}{:02x}'.format(int(color[0]), int(color[1]), int(color[2]))