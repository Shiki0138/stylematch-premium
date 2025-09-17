import { auth } from '@/lib/firebase/auth';

export interface AdvancedFaceAnalysisResult {
  success: boolean;
  base_type: string;
  subtype: string;
  subtype_name: string;
  subtype_description: string;
  confidence: number;
  features: {
    symmetry_score?: number;
    face_area_ratio?: number;
    chin_angle?: number;
    cheek_fullness?: number;
    cheekbone_prominence?: number;
    jawline_sharpness?: number;
    eye_size_ratio?: number;
    nose_size_ratio?: number;
    forehead_width_ratio?: number;
    [key: string]: number | undefined;
  };
  recommendations: {
    hairstyles?: string[];
    avoid?: string[];
    tips?: string[];
  };
}

export interface SubtypeInfo {
  id: string;
  name: string;
  description: string;
  conditions: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class AdvancedFaceAnalysisService {
  /**
   * 詳細な顔型分析を実行
   */
  async analyzeAdvanced(
    imageUrl: string, 
    baseType: string
  ): Promise<AdvancedFaceAnalysisResult> {
    try {
      // 認証トークンを取得
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await user.getIdToken();
      
      // 画像をBase64に変換
      let base64Image = imageUrl;
      
      // URLから画像を取得してBase64に変換する場合
      if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        base64Image = await this.blobToBase64(blob);
      }
      
      // APIリクエスト
      const response = await fetch(`${API_BASE_URL}/api/advanced/analyze-advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image: base64Image,
          base_type: baseType
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      return result;
    } catch (error) {
      console.error('Advanced face analysis error:', error);
      throw error;
    }
  }

  /**
   * 特定の顔型のサブタイプ情報を取得
   */
  async getSubtypeInfo(baseType: string): Promise<SubtypeInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced/subtype-info/${baseType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result.subtypes || [];
    } catch (error) {
      console.error('Get subtype info error:', error);
      throw error;
    }
  }

  /**
   * 全ての顔型とサブタイプの一覧を取得
   */
  async getAllSubtypes(): Promise<{
    total_count: number;
    base_types: string[];
    subtypes: Record<string, SubtypeInfo[]>;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced/all-subtypes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get all subtypes error:', error);
      throw error;
    }
  }

  /**
   * Blobをbase64に変換
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Mock実装（開発用）
   */
  async analyzeAdvancedMock(
    imageUrl: string,
    baseType: string
  ): Promise<AdvancedFaceAnalysisResult> {
    // シミュレーション待機
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // モック結果の定義
    const mockResults: Record<string, Partial<AdvancedFaceAnalysisResult>> = {
      tamago: {
        subtype: 'elegant',
        subtype_name: 'エレガントタイプ',
        subtype_description: 'やや面長寄りで上品な印象',
        confidence: 0.92,
        features: {
          symmetry_score: 0.89,
          face_area_ratio: 0.48,
          chin_angle: 115,
          cheek_fullness: 0.55,
          cheekbone_prominence: 0.45,
          jawline_sharpness: 0.72,
          eye_size_ratio: 0.28,
          nose_size_ratio: 0.11,
          forehead_width_ratio: 0.95
        },
        recommendations: {
          hairstyles: ['ロングヘア', 'ローポニーテール', 'サイドパート'],
          avoid: ['センター分けのストレート'],
          tips: ['縦のラインを活かしたスタイルが◎']
        }
      },
      maru: {
        subtype: 'baby_face',
        subtype_name: 'ベビーフェイスタイプ',
        subtype_description: '童顔で年齢より若く見える',
        confidence: 0.88,
        features: {
          symmetry_score: 0.85,
          face_area_ratio: 0.52,
          chin_angle: 125,
          cheek_fullness: 0.75,
          cheekbone_prominence: 0.68,
          jawline_sharpness: 0.45,
          eye_size_ratio: 0.32,
          nose_size_ratio: 0.09,
          forehead_width_ratio: 0.88
        },
        recommendations: {
          hairstyles: ['ショートボブ', 'ゆるふわパーマ', 'シースルーバング'],
          avoid: ['重たい前髪', 'ストレートロング'],
          tips: ['可愛らしさを活かしつつ大人っぽさをプラス']
        }
      },
      // 他の顔型のモックデータも追加可能
    };

    const result = mockResults[baseType] || mockResults.tamago;
    
    return {
      success: true,
      base_type: baseType,
      subtype: result.subtype!,
      subtype_name: result.subtype_name!,
      subtype_description: result.subtype_description!,
      confidence: result.confidence!,
      features: result.features!,
      recommendations: result.recommendations!
    };
  }
}

export const advancedFaceAnalysisService = new AdvancedFaceAnalysisService();