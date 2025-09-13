import cv2
import numpy as np
from PIL import Image
import io
import base64
from typing import Tuple, Optional

class ImageProcessor:
    """画像処理ユーティリティクラス"""
    
    @staticmethod
    def resize_image(image: np.ndarray, max_width: int = 1080, 
                    max_height: int = 1080) -> np.ndarray:
        """
        画像をリサイズする（アスペクト比を保持）
        
        Args:
            image: 入力画像
            max_width: 最大幅
            max_height: 最大高さ
            
        Returns:
            リサイズされた画像
        """
        height, width = image.shape[:2]
        
        # スケーリング比率を計算
        scale = min(max_width / width, max_height / height)
        
        if scale < 1:
            new_width = int(width * scale)
            new_height = int(height * scale)
            resized = cv2.resize(image, (new_width, new_height), 
                               interpolation=cv2.INTER_AREA)
            return resized
        
        return image
    
    @staticmethod
    def enhance_image(image: np.ndarray) -> np.ndarray:
        """
        画像を診断用に補正する
        
        Args:
            image: 入力画像
            
        Returns:
            補正された画像
        """
        # 明るさとコントラストの自動調整
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # CLAHE（Contrast Limited Adaptive Histogram Equalization）を適用
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        # LABを結合してRGBに戻す
        enhanced_lab = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
        
        # ノイズ除去
        enhanced = cv2.bilateralFilter(enhanced, 9, 75, 75)
        
        return enhanced
    
    @staticmethod
    def validate_image_quality(image: np.ndarray) -> Tuple[bool, Optional[str]]:
        """
        画像品質を検証する
        
        Args:
            image: 入力画像
            
        Returns:
            (検証成功フラグ, エラーメッセージ)のタプル
        """
        height, width = image.shape[:2]
        
        # 最小解像度チェック
        if width < 480 or height < 480:
            return False, "画像の解像度が低すぎます。最低480x480ピクセル以上の画像を使用してください。"
        
        # アスペクト比チェック（極端に横長や縦長を除外）
        aspect_ratio = width / height
        if aspect_ratio < 0.5 or aspect_ratio > 2.0:
            return False, "画像のアスペクト比が適切ではありません。正方形に近い画像を使用してください。"
        
        # 明るさチェック
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        mean_brightness = np.mean(gray)
        
        if mean_brightness < 50:
            return False, "画像が暗すぎます。明るい場所で撮影した画像を使用してください。"
        elif mean_brightness > 200:
            return False, "画像が明るすぎます。適切な露出で撮影した画像を使用してください。"
        
        # ぼやけ検出（ラプラシアンフィルタ）
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 50:
            return False, "画像がぼやけています。ピントの合った鮮明な画像を使用してください。"
        
        return True, None
    
    @staticmethod
    def crop_face_region(image: np.ndarray, face_rect: Tuple[int, int, int, int],
                        padding: float = 0.3) -> np.ndarray:
        """
        顔領域を切り出す
        
        Args:
            image: 入力画像
            face_rect: 顔の矩形領域 (x, y, w, h)
            padding: パディング比率
            
        Returns:
            切り出された顔画像
        """
        x, y, w, h = face_rect
        height, width = image.shape[:2]
        
        # パディングを追加
        pad_w = int(w * padding)
        pad_h = int(h * padding)
        
        # 境界チェック
        x1 = max(0, x - pad_w)
        y1 = max(0, y - pad_h)
        x2 = min(width, x + w + pad_w)
        y2 = min(height, y + h + pad_h)
        
        # 顔領域を切り出し
        cropped = image[y1:y2, x1:x2]
        
        return cropped
    
    @staticmethod
    def normalize_skin_tone(image: np.ndarray) -> np.ndarray:
        """
        肌のトーンを正規化（ホワイトバランス調整）
        
        Args:
            image: 入力画像
            
        Returns:
            正規化された画像
        """
        # グレーワールド仮定によるホワイトバランス調整
        result = cv2.cvtColor(image, cv2.COLOR_RGB2LAB).astype(np.float32)
        avg_a = np.average(result[:, :, 1])
        avg_b = np.average(result[:, :, 2])
        
        result[:, :, 1] = result[:, :, 1] - ((avg_a - 128) * (result[:, :, 0] / 255.0) * 1.1)
        result[:, :, 2] = result[:, :, 2] - ((avg_b - 128) * (result[:, :, 0] / 255.0) * 1.1)
        
        result = np.clip(result, 0, 255).astype(np.uint8)
        result = cv2.cvtColor(result, cv2.COLOR_LAB2RGB)
        
        return result
    
    @staticmethod
    def create_color_palette_image(colors: list, size: Tuple[int, int] = (400, 100)) -> np.ndarray:
        """
        カラーパレット画像を生成
        
        Args:
            colors: カラーコードのリスト（16進数形式）
            size: 画像サイズ (width, height)
            
        Returns:
            カラーパレット画像
        """
        width, height = size
        num_colors = len(colors)
        
        if num_colors == 0:
            return np.zeros((height, width, 3), dtype=np.uint8)
        
        # 各色の幅を計算
        color_width = width // num_colors
        
        # パレット画像を作成
        palette = np.zeros((height, width, 3), dtype=np.uint8)
        
        for i, color_hex in enumerate(colors):
            # 16進数カラーコードをRGBに変換
            color_hex = color_hex.lstrip('#')
            rgb = tuple(int(color_hex[i:i+2], 16) for i in (0, 2, 4))
            
            # パレットに色を描画
            start_x = i * color_width
            end_x = (i + 1) * color_width if i < num_colors - 1 else width
            palette[:, start_x:end_x] = rgb
        
        return palette
    
    @staticmethod
    def encode_image_to_base64(image: np.ndarray) -> str:
        """
        NumPy配列の画像をBase64エンコード
        
        Args:
            image: 画像配列
            
        Returns:
            Base64エンコードされた文字列
        """
        # BGRからRGBに変換（OpenCVはBGRを使用）
        if len(image.shape) == 3 and image.shape[2] == 3:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image
        
        # PIL Imageに変換
        pil_image = Image.fromarray(image_rgb)
        
        # Base64エンコード
        buffer = io.BytesIO()
        pil_image.save(buffer, format='PNG')
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return f"data:image/png;base64,{image_base64}"
    
    @staticmethod
    def decode_base64_to_image(base64_string: str) -> np.ndarray:
        """
        Base64文字列を画像配列にデコード
        
        Args:
            base64_string: Base64エンコードされた文字列
            
        Returns:
            画像配列
        """
        # データURIスキームの場合は除去
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        # Base64デコード
        image_data = base64.b64decode(base64_string)
        
        # PIL Imageとして読み込み
        pil_image = Image.open(io.BytesIO(image_data))
        
        # NumPy配列に変換
        image_array = np.array(pil_image)
        
        # RGBに変換（必要な場合）
        if len(image_array.shape) == 2:  # グレースケール
            image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        elif image_array.shape[2] == 4:  # RGBA
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2RGB)
        
        return image_array