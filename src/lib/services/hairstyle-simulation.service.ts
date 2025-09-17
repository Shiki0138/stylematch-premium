import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface HairstyleOptions {
  style: 'elegant' | 'casual' | 'modern' | 'cute' | 'natural';
  length: 'short' | 'medium' | 'long';
  color?: string;
}

export interface SimulationResult {
  id: string;
  imageUrl: string;
  style: HairstyleOptions;
  confidence: number;
  description: string;
}

export class HairstyleSimulationService {
  private faceLandmarker: FaceLandmarker | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FaceLandmarker:', error);
      throw error;
    }
  }

  async detectFaceLandmarks(imageElement: HTMLImageElement) {
    if (!this.faceLandmarker) {
      await this.initialize();
    }

    const results = this.faceLandmarker!.detect(imageElement);
    
    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      throw new Error('顔が検出されませんでした');
    }

    return {
      landmarks: results.faceLandmarks[0],
      blendshapes: results.faceBlendshapes?.[0],
      transformMatrix: results.facialTransformationMatrixes?.[0],
    };
  }

  async generateHairstylePrompt(
    faceType: string,
    options: HairstyleOptions,
    personalColor?: string
  ): Promise<string> {
    const stylePrompts = {
      elegant: 'elegant and sophisticated hairstyle',
      casual: 'relaxed and natural hairstyle',
      modern: 'trendy and contemporary hairstyle',
      cute: 'cute and youthful hairstyle',
      natural: 'natural and effortless hairstyle'
    };

    const lengthPrompts = {
      short: 'short length hair',
      medium: 'medium length hair',
      long: 'long flowing hair'
    };

    const faceTypePrompts = {
      'tamago': 'for oval face shape',
      'maru': 'for round face with vertical emphasis',
      'shikaku': 'for square face with soft curves',
      'heart': 'for heart-shaped face with volume at bottom',
      'omochou': 'for long face with horizontal volume'
    };

    let prompt = `Professional hairstyle photo: ${stylePrompts[options.style]}, ${lengthPrompts[options.length]}, ${faceTypePrompts[faceType] || 'flattering hairstyle'}`;

    if (personalColor) {
      const colorPrompts = {
        'spring': 'warm and bright hair color',
        'summer': 'cool and soft hair color',
        'autumn': 'warm and deep hair color',
        'winter': 'cool and vivid hair color'
      };
      prompt += `, ${colorPrompts[personalColor] || 'natural hair color'}`;
    }

    if (options.color) {
      prompt += `, ${options.color} hair color`;
    }

    prompt += ', professional salon quality, natural lighting, front view';

    return prompt;
  }

  // デモ用のモックシミュレーション（実際のAPI実装前）
  async simulateHairstyles(
    imageUrl: string,
    faceType: string,
    options: HairstyleOptions,
    personalColor?: string
  ): Promise<SimulationResult[]> {
    // 実際の実装では、ここでImagen APIやその他の画像生成APIを呼び出す
    await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション遅延

    const baseStyles = [
      {
        id: '1',
        description: 'クラシックなエレガントスタイル',
        confidence: 0.92
      },
      {
        id: '2',
        description: 'モダンなアレンジスタイル',
        confidence: 0.88
      },
      {
        id: '3',
        description: 'ナチュラルな雰囲気のスタイル',
        confidence: 0.85
      },
      {
        id: '4',
        description: 'トレンド感のあるスタイル',
        confidence: 0.83
      }
    ];

    return baseStyles.map((style, index) => ({
      ...style,
      imageUrl: `/api/placeholder/400/600?style=${index}`,
      style: options
    }));
  }

  // 髪領域のマスク生成（将来の実装用）
  async generateHairMask(imageElement: HTMLImageElement): Promise<ImageData> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    // 簡易的なマスク生成（実際はより高度なセグメンテーションが必要）
    ctx.drawImage(imageElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // TODO: 実際の髪セグメンテーション実装
    
    return imageData;
  }

  // 診断結果に基づく推奨スタイル
  getRecommendedStyles(faceType: string): HairstyleOptions[] {
    const recommendations: Record<string, HairstyleOptions[]> = {
      'tamago': [
        { style: 'elegant', length: 'medium' },
        { style: 'modern', length: 'long' },
        { style: 'casual', length: 'short' },
        { style: 'cute', length: 'medium' }
      ],
      'maru': [
        { style: 'elegant', length: 'long' },
        { style: 'modern', length: 'medium' },
        { style: 'natural', length: 'long' },
        { style: 'casual', length: 'medium' }
      ],
      'shikaku': [
        { style: 'casual', length: 'medium' },
        { style: 'cute', length: 'short' },
        { style: 'natural', length: 'medium' },
        { style: 'elegant', length: 'long' }
      ],
      'heart': [
        { style: 'cute', length: 'medium' },
        { style: 'elegant', length: 'medium' },
        { style: 'casual', length: 'long' },
        { style: 'modern', length: 'short' }
      ],
      'omochou': [
        { style: 'casual', length: 'medium' },
        { style: 'modern', length: 'short' },
        { style: 'cute', length: 'medium' },
        { style: 'natural', length: 'medium' }
      ]
    };

    return recommendations[faceType] || recommendations['tamago'];
  }
}

// シングルトンインスタンス
export const hairstyleSimulationService = new HairstyleSimulationService();