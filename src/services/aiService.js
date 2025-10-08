// AI処理サービス（シミュレーション版）
export class AIService {
  static async analyzeHairStyle(imageUri) {
    // AI分析をシミュレート
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResults = [
          {
            style: 'ショートボブ',
            confidence: 92,
            description: '顔型に合うエレガントなショートスタイル',
            color: '#8B4513'
          },
          {
            style: 'ミディアムレイヤー',
            confidence: 87,
            description: '動きのあるナチュラルなレイヤースタイル',
            color: '#DAA520'
          },
          {
            style: 'ロングストレート',
            confidence: 79,
            description: 'クラシックで上品なロングヘア',
            color: '#2F4F4F'
          }
        ];
        
        resolve({
          success: true,
          results: mockResults,
          processingTime: '2.3秒',
          imageAnalysis: {
            faceShape: '卵型',
            skinTone: 'イエローベース',
            recommendedColors: ['ブラウン', 'ベージュ', 'ゴールド']
          }
        });
      }, 2300); // 2.3秒の処理時間をシミュレート
    });
  }

  static async generateStyleImage(baseImageUri, targetStyle) {
    // スタイル画像生成をシミュレート
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          generatedImageUri: 'mock_generated_image',
          style: targetStyle,
          processingTime: '5.1秒'
        });
      }, 5100);
    });
  }
}