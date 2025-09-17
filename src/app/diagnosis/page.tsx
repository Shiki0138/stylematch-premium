'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/useAppStore';
import { useDiagnosisStore } from '@/lib/store/diagnosis-store';
import { CameraCapture } from '@/components/diagnosis/CameraCapture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PulseButton, MagicalLoading, SuccessConfetti, HoverSparkle } from '@/components/ui/MicroInteractions';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const FACE_SHAPE_MAP: Record<string, string> = {
  tamago: 'tamago',
  maru: 'maru',
  shikaku: 'shikaku',
  heart: 'heart',
  omochou: 'omochou',
  oval: 'tamago',
  round: 'maru',
  square: 'shikaku',
  oblong: 'omochou',
};

const TOTAL_PROCESSING_DURATION = 30000;
const USE_MOCK_DIAGNOSIS = process.env.NEXT_PUBLIC_USE_MOCK_DIAGNOSIS === 'true';

interface NormalizedDiagnosisResult {
  id: string;
  faceShape: string;
  personalColor?: string;
  colorSubType?: string;
  confidence: {
    faceShape?: number;
    personalColor?: number;
  };
  recommendations: {
    hairstyles: string[];
    avoidStyles: string[];
    celebrityMatches: string[];
  };
  measurements: Record<string, unknown>;
  colorPalette: Record<string, unknown>;
  processingTime: number;
  analysisMethod: string;
}

const createMockDiagnosisResult = (): NormalizedDiagnosisResult => ({
  id: `mock-${Date.now()}`,
  faceShape: 'oval',
  personalColor: 'spring',
  colorSubType: 'bright-spring',
  confidence: {
    faceShape: 0.92,
    personalColor: 0.87,
  },
  recommendations: {
    hairstyles: ['ショートボブ', 'サイドパート', 'シースルーバング'],
    avoidStyles: ['重ためワンレングス'],
    celebrityMatches: ['石原さとみ', '広瀬アリス'],
  },
  measurements: {
    jawAngle: 112,
    symmetry: 0.9,
    cheekVolume: 0.52,
  },
  colorPalette: {
    recommended: ['#F8C8C4', '#F5A25D', '#F8E8D8'],
    avoid: ['#8A9BB0', '#4F5A7D'],
  },
  processingTime: 12000,
  analysisMethod: 'Mock AI Analysis',
});

export default function DiagnosisPage() {
  const router = useRouter();
  const { currentUser, userData } = useAuth();
  const { 
    setDiagnosisInProgress, 
    setCurrentDiagnosis, 
    setDiagnosisImage,
    setError,
    setIsLoading
  } = useAppStore();
  const addDiagnosis = useDiagnosisStore((state) => state.addDiagnosis);

  const [step, setStep] = useState<'intro' | 'camera' | 'processing' | 'result'>('intro');
  const [diagnosisType, setDiagnosisType] = useState<'face' | 'color' | 'complete'>('complete');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [processingMessage, setProcessingMessage] = useState('画像を解析中...');
  const [showConfetti, setShowConfetti] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ログインチェック
  if (!currentUser) {
    router.push('/login?redirect=/diagnosis');
    return null;
  }

  const remainingSeconds = Math.max(
    0,
    Math.ceil((TOTAL_PROCESSING_DURATION * (1 - processingProgress / 100)) / 1000)
  );
  const progressPercent = Math.min(100, Math.round(processingProgress));

  // 診断開始
  const startDiagnosis = (type: 'face' | 'color' | 'complete') => {
    setDiagnosisType(type);
    setStep('camera');
    setDiagnosisInProgress(true);
  };

  const clearMessageTimeouts = useCallback(() => {
    messageTimeoutsRef.current.forEach(clearTimeout);
    messageTimeoutsRef.current = [];
  }, []);

  const stopProgressAnimation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressAnimation = useCallback(() => {
    stopProgressAnimation();
    const startedAt = Date.now();
    setProcessingProgress(0);
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(100, Math.round((elapsed / TOTAL_PROCESSING_DURATION) * 100));
      setProcessingProgress(progress);
      if (progress >= 100) {
        stopProgressAnimation();
      }
    }, 250);
  }, [stopProgressAnimation]);

  const scheduleMessageUpdate = useCallback((update: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      update();
      messageTimeoutsRef.current = messageTimeoutsRef.current.filter((id) => id !== timeoutId);
    }, delay);
    messageTimeoutsRef.current.push(timeoutId);
  }, []);

  const handleDiagnosisSuccess = useCallback((diagnosisResult: NormalizedDiagnosisResult, imageData: string) => {
    if (!currentUser) return;

    setCurrentDiagnosis(diagnosisResult);
    setDiagnosisImage(imageData);

    addDiagnosis({
      id: diagnosisResult.id,
      userId: currentUser.uid,
      faceShape: FACE_SHAPE_MAP[diagnosisResult.faceShape] || diagnosisResult.faceShape,
      personalColor: diagnosisResult.personalColor,
      imageUrl: imageData,
      recommendations: {
        hairstyles: diagnosisResult.recommendations?.hairstyles || [],
        avoidStyles: diagnosisResult.recommendations?.avoidStyles || [],
        points: diagnosisResult.recommendations?.celebrityMatches || [],
      },
      createdAt: new Date(),
      score: diagnosisResult.confidence?.faceShape,
    });

    setStep('result');
    setShowConfetti(true);

    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }
    confettiTimeoutRef.current = setTimeout(() => setShowConfetti(false), 3000);
  }, [addDiagnosis, currentUser, setCurrentDiagnosis, setDiagnosisImage]);

  // 画像キャプチャ完了
  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setStep('processing');
    await processDiagnosis(imageData);
  };

  // 診断処理
  const processDiagnosis = async (imageData: string) => {
    try {
      setIsLoading(true);
      setProcessingMessage('AI が画像を解析しています...');
      setProcessingProgress(0);
      startProgressAnimation();
      clearMessageTimeouts();
      
      // API URLの設定
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:5000';
      const endpoint = diagnosisType === 'complete' 
        ? '/api/diagnosis/complete'
        : `/api/diagnosis/${diagnosisType}`;

      // プロセス表示メッセージを更新
      scheduleMessageUpdate(() => setProcessingMessage('顔の特徴点を検出中... 🔍'), 2000);
      scheduleMessageUpdate(() => setProcessingMessage('顔型を分析中... 📐'), 4000);
      if (diagnosisType === 'complete' || diagnosisType === 'color') {
        scheduleMessageUpdate(() => setProcessingMessage('パーソナルカラーを解析中... 🎨'), 6000);
      }
      scheduleMessageUpdate(() => setProcessingMessage('最適な美容師をマッチング中... 💕'), 8000);

      // 画像データをBase64形式で送信
      const response = await axios.post(`${apiUrl}${endpoint}`, {
        image: imageData,
        userId: currentUser.uid
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30秒のタイムアウト
      });

      if (response.data.success) {
        // 診断結果を新しいデータ構造に合わせて変換
        const rawConfidence = response.data.data.confidence;
        const faceConfidence = typeof rawConfidence === 'object' && rawConfidence !== null
          ? rawConfidence.faceShape ?? rawConfidence.value ?? rawConfidence.personalColor ?? 0
          : rawConfidence ?? 0;
        const colorConfidence = typeof rawConfidence === 'object' && rawConfidence !== null
          ? rawConfidence.personalColor ?? rawConfidence.value ?? faceConfidence
          : rawConfidence ?? faceConfidence;

        const recommendationSource = response.data.data.hairstyleRecommendations || response.data.data.recommendations || {};
        const diagnosisResult: NormalizedDiagnosisResult = {
          id: response.data.data.diagnosisId || 'temp-id',
          faceShape: response.data.data.faceShape,
          personalColor: response.data.data.personalColor,
          colorSubType: response.data.data.subType,
          confidence: {
            faceShape: typeof faceConfidence === 'number' ? faceConfidence : Number(faceConfidence) || undefined,
            personalColor: typeof colorConfidence === 'number' ? colorConfidence : Number(colorConfidence) || undefined,
          },
          recommendations: {
            hairstyles: recommendationSource.recommended_styles || recommendationSource.hairstyles || [],
            avoidStyles: recommendationSource.avoid_styles || recommendationSource.avoidStyles || [],
            celebrityMatches: recommendationSource.celebrity_examples || recommendationSource.celebrityMatches || [],
          },
          measurements: response.data.data.measurements || {},
          colorPalette: response.data.data.colorPalette || {},
          processingTime: response.data.data.processingTime || 0,
          analysisMethod: response.data.data.analysisMethod || 'AI Analysis'
        };

        handleDiagnosisSuccess(diagnosisResult, imageData);
      } else {
        throw new Error(response.data.error || '診断に失敗しました');
      }
    } catch (error) {
      console.error('診断エラー:', error);
      let errorMessage = '診断処理中にエラーが発生しました。もう一度お試しください。';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'AI診断サーバーに接続できません。しばらく待ってから再試行してください。';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message.includes('timeout')) {
          errorMessage = '処理に時間がかかっています。もう一度お試しください。';
        }
      }
      
      if (USE_MOCK_DIAGNOSIS && currentUser) {
        const mockDiagnosis = createMockDiagnosisResult();
        handleDiagnosisSuccess(mockDiagnosis, imageData);
        toast.success('接続できなかったためサンプル診断結果を表示しています。');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
        setStep('intro');
      }
    } finally {
      setIsLoading(false);
      setDiagnosisInProgress(false);
      stopProgressAnimation();
      clearMessageTimeouts();
      setProcessingProgress((prev) => (prev < 100 ? 100 : prev));
    }
  };

  // 結果を見る
  const viewResults = () => {
    router.push('/diagnosis/result');
  };

  useEffect(() => {
    if (step === 'result') {
      const timer = setTimeout(() => {
        router.push('/diagnosis/result');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [router, step]);

  useEffect(() => () => {
    stopProgressAnimation();
    clearMessageTimeouts();
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }
  }, [clearMessageTimeouts, stopProgressAnimation]);

  // キャンセル処理
  const handleCancel = () => {
    setStep('intro');
    setDiagnosisInProgress(false);
  };

  return (
    <div className="min-h-screen bg-luxury-pearl py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-luxury-navy">AI美容診断</h1>
          <p className="text-gray-600">
            AIが顔型とパーソナルカラーを分析します
          </p>
        </div>

        {/* イントロ画面 */}
        {step === 'intro' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>診断タイプを選択してください</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <HoverSparkle>
                  <PulseButton
                    onClick={() => startDiagnosis('complete')}
                    variant="primary"
                    className="w-full p-6 text-center bg-gradient-to-r from-luxury-champagne to-luxury-rose text-white"
                  >
                    <h3 className="text-xl font-bold mb-2">完全診断（おすすめ）</h3>
                    <p>顔型とパーソナルカラーを同時に診断します</p>
                    <div className="mt-4 text-sm opacity-90">
                      所要時間: 約30秒
                    </div>
                  </PulseButton>
                </HoverSparkle>

                <div className="grid md:grid-cols-2 gap-4">
                  <HoverSparkle>
                    <button
                      onClick={() => startDiagnosis('face')}
                      className="p-6 bg-white border-2 border-luxury-champagne rounded-xl hover:bg-luxury-champagne/10 transition-colors w-full text-center"
                    >
                      <h3 className="text-lg font-bold mb-2 text-luxury-navy">顔型診断のみ</h3>
                      <p className="text-gray-600 text-sm">
                        5つの顔型タイプを判定
                      </p>
                    </button>
                  </HoverSparkle>

                  <HoverSparkle>
                    <button
                      onClick={() => startDiagnosis('color')}
                      className="p-6 bg-white border-2 border-luxury-navy rounded-xl hover:bg-luxury-navy/10 transition-colors w-full text-center"
                    >
                      <h3 className="text-lg font-bold mb-2 text-luxury-navy">カラー診断のみ</h3>
                      <p className="text-gray-600 text-sm">
                        4シーズンカラーを判定
                      </p>
                    </button>
                  </HoverSparkle>
                </div>
              </CardContent>
            </Card>

            {/* 過去の診断結果がある場合 */}
            {userData?.diagnoses?.diagnosedAt && (
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-gray-600 mb-2">
                    前回の診断から結果を見る
                  </p>
                  <Button
                    variant="outline"
                    onClick={viewResults}
                    fullWidth
                  >
                    診断結果を表示
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* カメラ画面 */}
        {step === 'camera' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {diagnosisType === 'face' && '顔型診断用の写真を撮影'}
                {diagnosisType === 'color' && 'カラー診断用の写真を撮影'}
                {diagnosisType === 'complete' && '診断用の写真を撮影'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraCapture
                onCapture={handleCapture}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        )}

        {/* 処理中画面 */}
        {step === 'processing' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 space-y-6">
              <div className="text-center">
                <MagicalLoading 
                  isLoading={true} 
                  message={processingMessage}
                />
              </div>
              
              {/* プログレスバー */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-luxury-champagne to-luxury-rose h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(processingProgress, 5)}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-500">
                残り約 {remainingSeconds} 秒（進捗 {progressPercent}%）
              </p>
              
              {/* ステップ表示 */}
              <div className="space-y-3">
                <div className={`flex items-center gap-3 transition-opacity ${processingMessage.includes('画像を解析') ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full ${processingMessage.includes('画像を解析') ? 'bg-luxury-champagne animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm">画像を解析中...</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${processingMessage.includes('顔の特徴点') ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full ${processingMessage.includes('顔の特徴点') ? 'bg-luxury-champagne animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm">顔の特徴点を検出中...</span>
                </div>
                <div className={`flex items-center gap-3 transition-opacity ${processingMessage.includes('顔型を分析') ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full ${processingMessage.includes('顔型を分析') ? 'bg-luxury-champagne animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm">顔型を分析中...</span>
                </div>
                {(diagnosisType === 'complete' || diagnosisType === 'color') && (
                  <div className={`flex items-center gap-3 transition-opacity ${processingMessage.includes('パーソナルカラー') ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-6 h-6 rounded-full ${processingMessage.includes('パーソナルカラー') ? 'bg-luxury-champagne animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-sm">パーソナルカラーを解析中...</span>
                  </div>
                )}
                <div className={`flex items-center gap-3 transition-opacity ${processingMessage.includes('美容師をマッチング') ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full ${processingMessage.includes('美容師をマッチング') ? 'bg-luxury-champagne animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm">最適な美容師をマッチング中...</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-500">
                分析には約10〜30秒かかります
              </p>
            </div>
          </div>
        )}

        {/* 結果画面 */}
        {step === 'result' && (
          <div>
            <SuccessConfetti 
              isVisible={showConfetti} 
              onComplete={() => setShowConfetti(false)}
            />
            <Card>
              <CardContent className="py-16 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-bold mb-4">診断が完了しました！</h2>
                <p className="text-gray-600 mb-8">
                  あなたに最適な美容師をマッチングしました
                </p>
                <PulseButton
                  onClick={viewResults}
                  variant="primary"
                  className="text-xl px-8 py-4"
                >
                  診断結果を見る ✨
                </PulseButton>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
