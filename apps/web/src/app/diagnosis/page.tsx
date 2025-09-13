"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@stylematch/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@stylematch/ui/card"
import { Progress } from "@stylematch/ui/progress"
import { Alert, AlertDescription } from "@stylematch/ui/alert"
import { Camera, Upload, Sparkles, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { api } from "~/trpc/react"

type Step = "intro" | "upload" | "analyzing" | "results"

export default function DiagnosisPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("intro")
  const [imageBase64, setImageBase64] = useState<string>("")
  const [analysisType, setAnalysisType] = useState<"FULL" | "FACE_SHAPE" | "COLOR_ANALYSIS">("FULL")
  
  const analyzeImageMutation = api.analysis.analyzeImage.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("analysisResults", JSON.stringify(data))
      setStep("results")
    },
    onError: (error) => {
      console.error("Analysis error:", error)
      alert("分析中にエラーが発生しました。もう一度お試しください。")
    },
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setImageBase64(base64)
      setStep("analyzing")
      analyzeImageMutation.mutate({
        imageBase64: base64,
        analysisType,
      })
    }
    reader.readAsDataURL(file)
  }

  const renderIntro = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-pink-600 dark:text-pink-400" />
          </div>
          <CardTitle className="text-3xl">AI美容診断</CardTitle>
          <CardDescription className="text-lg mt-2">
            あなたの顔型とパーソナルカラーを分析し、最適なスタイルを提案します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">顔型診断</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>・卵型、丸顔、面長、ベース型、逆三角形の5タイプから判定</li>
                  <li>・顔のバランスを詳細に分析</li>
                  <li>・似合うヘアスタイルを提案</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">パーソナルカラー診断</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>・スプリング、サマー、オータム、ウィンターの4タイプ</li>
                  <li>・肌の色調、瞳の色、髪の色から総合判定</li>
                  <li>・似合うヘアカラーとメイクを提案</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              診断には正面から撮影した、顔がはっきりと写った写真が必要です。
              メイクをしていない状態での撮影を推奨します。
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button size="lg" onClick={() => setStep("upload")}>
              診断を始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderUpload = () => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>写真をアップロード</CardTitle>
          <CardDescription>
            正面から撮影した顔写真を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">クリックして写真を選択</p>
                  <p className="text-sm text-gray-500">または、ドラッグ＆ドロップ</p>
                </div>
                <p className="text-xs text-gray-400">
                  JPG, PNG, HEIF形式 (最大10MB)
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm">
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Camera className="h-4 w-4" />
              カメラで撮影
            </button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setStep("intro")}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalyzing = () => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">分析中...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-pink-200 dark:bg-pink-800 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-32 h-32 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-pink-600 dark:text-pink-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={66} className="h-2" />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              AIが顔型とパーソナルカラーを分析しています
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">顔型分析</p>
              <p className="font-medium">完了</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">カラー分析</p>
              <p className="font-medium">処理中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderResults = () => {
    const results = JSON.parse(localStorage.getItem("analysisResults") || "{}")
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* 診断結果サマリー */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">診断結果</CardTitle>
            <CardDescription>
              あなたに最適なスタイルが見つかりました！
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 顔型診断結果 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">顔型診断</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                      {results.faceShape?.type === "OVAL" && "卵型"}
                      {results.faceShape?.type === "ROUND" && "丸顔"}
                      {results.faceShape?.type === "SQUARE" && "ベース型"}
                      {results.faceShape?.type === "HEART" && "逆三角形"}
                      {results.faceShape?.type === "OBLONG" && "面長"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      確信度: {Math.round((results.faceShape?.confidence || 0) * 100)}%
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>特徴:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>・{results.faceShape?.features?.jawline}</li>
                      <li>・{results.faceShape?.features?.cheekbones}</li>
                      <li>・{results.faceShape?.features?.forehead}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* パーソナルカラー診断結果 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">パーソナルカラー</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                      {results.personalColor?.type === "SPRING_WARM" && "スプリング"}
                      {results.personalColor?.type === "SUMMER_COOL" && "サマー"}
                      {results.personalColor?.type === "AUTUMN_WARM" && "オータム"}
                      {results.personalColor?.type === "WINTER_COOL" && "ウィンター"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      確信度: {Math.round((results.personalColor?.confidence || 0) * 100)}%
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>特徴:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>・{results.personalColor?.characteristics?.skinTone}</li>
                      <li>・{results.personalColor?.characteristics?.undertone}</li>
                      <li>・{results.personalColor?.characteristics?.contrast}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* おすすめカラー */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">おすすめカラー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">似合う色</p>
                    <div className="flex gap-2">
                      {results.personalColor?.recommendedColors?.map((color: string, i: number) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-lg shadow-sm border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">避けたい色</p>
                    <div className="flex gap-2">
                      {results.personalColor?.avoidColors?.map((color: string, i: number) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-lg shadow-sm border opacity-50"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push("/stylists")}>
                美容師を探す
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/diagnosis/details")}>
                詳細な分析結果を見る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {step === "intro" && renderIntro()}
      {step === "upload" && renderUpload()}
      {step === "analyzing" && renderAnalyzing()}
      {step === "results" && renderResults()}
    </div>
  )
}