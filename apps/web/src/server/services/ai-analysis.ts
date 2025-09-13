import { z } from "zod"

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000"
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || "development-key"

export const analysisRequestSchema = z.object({
  imageUrl: z.string().url(),
  analysisType: z.enum(["FACE_SHAPE", "COLOR_ANALYSIS", "FULL"]),
})

export const analysisResponseSchema = z.object({
  faceShape: z.object({
    type: z.enum(["OVAL", "ROUND", "SQUARE", "HEART", "OBLONG"]),
    confidence: z.number().min(0).max(1),
    features: z.object({
      jawline: z.string(),
      cheekbones: z.string(),
      forehead: z.string(),
    }),
  }),
  personalColor: z.object({
    type: z.enum(["SPRING_WARM", "SUMMER_COOL", "AUTUMN_WARM", "WINTER_COOL"]),
    confidence: z.number().min(0).max(1),
    characteristics: z.object({
      skinTone: z.string(),
      undertone: z.string(),
      contrast: z.string(),
    }),
    recommendedColors: z.array(z.string()),
    avoidColors: z.array(z.string()),
  }),
  recommendations: z.object({
    hairstyles: z.array(z.object({
      name: z.string(),
      description: z.string(),
      suitability: z.number().min(0).max(100),
    })),
    hairColors: z.array(z.object({
      name: z.string(),
      colorCode: z.string(),
      suitability: z.number().min(0).max(100),
    })),
    makeupTips: z.array(z.string()),
  }),
})

type AnalysisRequest = z.infer<typeof analysisRequestSchema>
type AnalysisResponse = z.infer<typeof analysisResponseSchema>

export async function analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    const validated = analysisRequestSchema.parse(request)
    
    const response = await fetch(`${AI_SERVICE_URL}/api/v1/analysis/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_SERVICE_API_KEY}`,
      },
      body: JSON.stringify(validated),
    })
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // In development, return mock data if AI service is not available
    if (process.env.NODE_ENV === "development" && !data.faceShape) {
      return getMockAnalysisResult(validated.analysisType)
    }
    
    return analysisResponseSchema.parse(data)
  } catch (error) {
    console.error("AI analysis error:", error)
    
    // Return mock data in development
    if (process.env.NODE_ENV === "development") {
      return getMockAnalysisResult(request.analysisType)
    }
    
    throw error
  }
}

function getMockAnalysisResult(analysisType: string): AnalysisResponse {
  return {
    faceShape: {
      type: "OVAL",
      confidence: 0.92,
      features: {
        jawline: "バランスの取れた曲線的なライン",
        cheekbones: "顔の中央で最も幅が広い",
        forehead: "顎よりやや広い",
      },
    },
    personalColor: {
      type: "SPRING_WARM",
      confidence: 0.88,
      characteristics: {
        skinTone: "明るく温かみのある肌色",
        undertone: "イエローベース",
        contrast: "中程度のコントラスト",
      },
      recommendedColors: [
        "#FFE4B5", // Moccasin
        "#FFA07A", // Light Salmon
        "#FFD700", // Gold
        "#FF6347", // Tomato
      ],
      avoidColors: [
        "#4169E1", // Royal Blue
        "#8A2BE2", // Blue Violet
        "#4B0082", // Indigo
      ],
    },
    recommendations: {
      hairstyles: [
        {
          name: "レイヤードボブ",
          description: "顔の形を活かした動きのあるスタイル",
          suitability: 95,
        },
        {
          name: "ソフトウェーブロング",
          description: "優しい印象を与える女性らしいスタイル",
          suitability: 88,
        },
        {
          name: "ショートレイヤー",
          description: "軽やかで爽やかな印象",
          suitability: 82,
        },
      ],
      hairColors: [
        {
          name: "ハニーブロンド",
          colorCode: "#DEB887",
          suitability: 92,
        },
        {
          name: "キャラメルブラウン",
          colorCode: "#8B6F47",
          suitability: 88,
        },
        {
          name: "ストロベリーブロンド",
          colorCode: "#FF9999",
          suitability: 85,
        },
      ],
      makeupTips: [
        "コーラルピンクのリップカラーがお似合いです",
        "ゴールド系のアイシャドウで目元を華やかに",
        "ピーチ系のチークで健康的な血色感を",
        "眉はやや明るめのブラウンがおすすめ",
      ],
    },
  }
}