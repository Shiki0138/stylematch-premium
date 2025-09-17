/**
 * 画像最適化ユーティリティ
 * - クライアントサイドでの画像リサイズ
 * - 品質調整
 * - フォーマット変換
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export class ImageOptimizer {
  static async optimizeImage(
    file: File,
    options: OptimizeOptions = {}
  ): Promise<{ blob: Blob; dataUrl: string; size: number }> {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // キャンバスを作成
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // アスペクト比を保持してリサイズ
          let { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // 画像を描画
          ctx.drawImage(img, 0, 0, width, height);

          // 画質を調整してBlobに変換
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // DataURLも生成
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  blob,
                  dataUrl: reader.result as string,
                  size: blob.size
                });
              };
              reader.readAsDataURL(blob);
            },
            `image/${format}`,
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 複数の画像を並列で最適化
   */
  static async optimizeMultipleImages(
    files: File[],
    options: OptimizeOptions = {}
  ): Promise<Array<{ blob: Blob; dataUrl: string; size: number }>> {
    const promises = files.map(file => this.optimizeImage(file, options));
    return Promise.all(promises);
  }

  /**
   * 画像のメタデータを削除（プライバシー保護）
   */
  static async stripMetadata(blob: Blob): Promise<Blob> {
    // EXIF情報を削除するためにキャンバスで再描画
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    return new Promise((resolve, reject) => {
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (newBlob) => {
            if (newBlob) {
              resolve(newBlob);
            } else {
              reject(new Error('Failed to strip metadata'));
            }
          },
          blob.type,
          1.0
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for metadata stripping'));
      };

      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * 画像サイズを計算（アスペクト比を保持）
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // 幅が最大幅を超える場合
    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }

    // 高さが最大高さを超える場合
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * 画像の圧縮率を推定
   */
  static estimateCompression(
    originalSize: number,
    optimizedSize: number
  ): {
    ratio: number;
    percentage: number;
    saved: number;
  } {
    const ratio = optimizedSize / originalSize;
    const percentage = Math.round((1 - ratio) * 100);
    const saved = originalSize - optimizedSize;

    return {
      ratio,
      percentage,
      saved
    };
  }

  /**
   * WebP対応をチェック
   */
  static isWebPSupported(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * ファイルサイズをフォーマット
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// React Hook for image optimization
export function useImageOptimizer() {
  const optimizeImage = async (
    file: File,
    options?: OptimizeOptions
  ) => {
    try {
      const result = await ImageOptimizer.optimizeImage(file, options);
      const compression = ImageOptimizer.estimateCompression(
        file.size,
        result.size
      );

      return {
        ...result,
        compression,
        originalSize: file.size,
        originalSizeFormatted: ImageOptimizer.formatFileSize(file.size),
        optimizedSizeFormatted: ImageOptimizer.formatFileSize(result.size)
      };
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw error;
    }
  };

  return {
    optimizeImage,
    isWebPSupported: ImageOptimizer.isWebPSupported()
  };
}