'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Camera, Loader2 } from 'lucide-react';
import AdvancedFaceResult from '@/components/face-diagnosis/advanced-face-result';
import { useDiagnosisStore } from '@/lib/store/diagnosis-store';
import { toast } from 'react-hot-toast';
import { advancedFaceAnalysisService } from '@/lib/services/advanced-face-analysis.service';

export default function AdvancedDiagnosisPage() {
  const router = useRouter();
  const { latestDiagnosis } = useDiagnosisStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    subtype: string;
    confidence: number;
    features: any;
  } | null>(null);

  const baseType = latestDiagnosis?.faceShape || 'tamago';
  const imageUrl = latestDiagnosis?.imageUrl || '';

  useEffect(() => {
    // 診断データがない場合は診断ページへリダイレクト
    if (!latestDiagnosis) {
      toast.error('先に顔型診断を行ってください');
      router.push('/diagnosis');
    }
  }, [latestDiagnosis, router]);

  const handleAdvancedAnalysis = async () => {
    if (!imageUrl) {
      toast.error('診断画像が見つかりません');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 開発環境ではモックを使用、本番ではAPIを使用
      const result = process.env.NODE_ENV === 'development' 
        ? await advancedFaceAnalysisService.analyzeAdvancedMock(imageUrl, baseType)
        : await advancedFaceAnalysisService.analyzeAdvanced(imageUrl, baseType);
      
      setAnalysisResult({
        subtype: result.subtype,
        confidence: result.confidence,
        features: result.features
      });
      toast.success('詳細分析が完了しました！');
    } catch (error) {
      toast.error('分析に失敗しました');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 基本顔型の日本語名
  const baseTypeNames: Record<string, string> = {
    tamago: '卵型',
    maru: '丸顔',
    shikaku: '四角顔',
    heart: 'ハート型',
    omochou: '面長'
  };

  return (
    <div className="min-h-screen bg-luxury-pearl">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">顔型詳細分析</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 説明カード */}
        <Card className="bg-gradient-to-r from-luxury-navy to-luxury-champagne text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              AI詳細顔型分析
            </CardTitle>
            <CardDescription className="text-white/90">
              25種類の詳細分類であなたの顔の特徴をより深く分析します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm">
                基本分類: <span className="font-bold">{baseTypeNames[baseType]}</span>
              </p>
              <p className="text-sm mt-1">
                このAI分析により、より精密なスタイリング提案が可能になります
              </p>
            </div>
          </CardContent>
        </Card>

        {!analysisResult ? (
          <>
            {/* 分析開始カード */}
            <Card>
              <CardHeader>
                <CardTitle>詳細分析を開始</CardTitle>
                <CardDescription>
                  AIがあなたの顔の細かな特徴を分析し、25種類のサブタイプから最適な分類を見つけます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 診断画像プレビュー */}
                {imageUrl && (
                  <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={imageUrl}
                      alt="診断画像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2 text-center">
                  <p className="text-sm text-gray-600">
                    分析には約10秒かかります
                  </p>
                  <p className="text-sm text-gray-600">
                    より詳細な顔の特徴を検出します
                  </p>
                </div>

                <Button
                  onClick={handleAdvancedAnalysis}
                  disabled={isAnalyzing || !imageUrl}
                  className="w-full h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      詳細分析を開始
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 詳細分析の説明 */}
            <Card>
              <CardHeader>
                <CardTitle>25種類の詳細分類とは？</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  基本の5つの顔型（卵型・丸顔・四角顔・ハート型・面長）を、
                  それぞれ5つのサブタイプに細分化した、合計25種類の詳細な分類システムです。
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-luxury-champagne rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">より精密な特徴分析</h4>
                      <p className="text-sm text-gray-600">
                        対称性、顎の角度、頬の膨らみなど、10以上の特徴量を測定
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-luxury-champagne rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">パーソナライズされた提案</h4>
                      <p className="text-sm text-gray-600">
                        サブタイプごとに最適化された髪型・メイク・アクセサリーの提案
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-luxury-champagne rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">プロ美容師との連携</h4>
                      <p className="text-sm text-gray-600">
                        詳細な分析結果を美容師と共有し、より満足度の高い施術を実現
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* 分析結果表示 */
          <AdvancedFaceResult
            baseType={baseType}
            subType={analysisResult.subtype}
            confidence={analysisResult.confidence}
            features={analysisResult.features}
          />
        )}

        {/* CTAセクション */}
        {analysisResult && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-luxury-champagne/20 to-luxury-rose/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">分析結果を活用しよう</h3>
                <p className="text-sm text-gray-600 mb-4">
                  この詳細な分析結果を基に、最適なスタイリングを見つけましょう
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="secondary"
                    onClick={() => router.push('/hairstyle-simulation')}
                  >
                    AI髪型シミュレーション
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => router.push('/stylists')}
                  >
                    美容師を探す
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-luxury-pearl border-luxury-champagne">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  ※ この分析結果は参考情報です。実際のスタイリングでは、
                  あなたの好みやライフスタイルも考慮することが大切です。
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}