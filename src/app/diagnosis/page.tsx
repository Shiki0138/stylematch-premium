'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/useAppStore';
import { CameraCapture } from '@/components/diagnosis/CameraCapture';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PulseButton, MagicalLoading, SuccessConfetti, HoverSparkle } from '@/components/ui/MicroInteractions';
import axios from 'axios';

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

  const [step, setStep] = useState<'intro' | 'camera' | 'processing' | 'result'>('intro');
  const [diagnosisType, setDiagnosisType] = useState<'face' | 'color' | 'complete'>('complete');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [processingMessage, setProcessingMessage] = useState('画像を解析中...');
  const [showConfetti, setShowConfetti] = useState(false);

  // ログインチェック
  if (!currentUser) {
    router.push('/login?redirect=/diagnosis');
    return null;
  }

  // 診断開始
  const startDiagnosis = (type: 'face' | 'color' | 'complete') => {
    setDiagnosisType(type);
    setStep('camera');
    setDiagnosisInProgress(true);
  };

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
      
      // API URLの設定
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:5000';
      const endpoint = diagnosisType === 'complete' 
        ? '/api/diagnosis/complete'
        : `/api/diagnosis/${diagnosisType}`;

      // プロセス表示メッセージを更新
      setTimeout(() => setProcessingMessage('顔の特徴点を検出中... 🔍'), 2000);
      setTimeout(() => setProcessingMessage('顔型を分析中... 📐'), 4000);
      if (diagnosisType === 'complete' || diagnosisType === 'color') {
        setTimeout(() => setProcessingMessage('パーソナルカラーを解析中... 🎨'), 6000);
      }
      setTimeout(() => setProcessingMessage('最適な美容師をマッチング中... 💕'), 8000);

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
        const diagnosisResult = {
          id: response.data.data.diagnosisId || 'temp-id',
          faceShape: response.data.data.faceShape,
          personalColor: response.data.data.personalColor,
          colorSubType: response.data.data.subType,
          confidence: {
            faceShape: response.data.data.confidence?.faceShape || response.data.data.confidence,
            personalColor: response.data.data.confidence?.personalColor || response.data.data.confidence
          },
          recommendations: {
            hairstyles: response.data.data.hairstyleRecommendations?.recommended_styles || 
                       response.data.data.recommendations?.hairstyles || [],
            avoidStyles: response.data.data.hairstyleRecommendations?.avoid_styles ||
                        response.data.data.recommendations?.avoidStyles || [],
            celebrityMatches: response.data.data.hairstyleRecommendations?.celebrity_examples || []
          },
          measurements: response.data.data.measurements || {},
          colorPalette: response.data.data.colorPalette || {},
          processingTime: response.data.data.processingTime || 0,
          analysisMethod: response.data.data.analysisMethod || 'AI Analysis'
        };

        setCurrentDiagnosis(diagnosisResult);
        setDiagnosisImage(imageData);
        setStep('result');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
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
      
      setError(errorMessage);
      setStep('intro');
    } finally {
      setIsLoading(false);
      setDiagnosisInProgress(false);
    }
  };

  // 結果を見る
  const viewResults = () => {
    router.push('/diagnosis/result');
  };

  // キャンセル処理
  const handleCancel = () => {
    setStep('intro');
    setDiagnosisInProgress(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI美容診断</h1>
          <p className="text-text-secondary">
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
                    className="w-full p-6 text-left"
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
                      className="p-6 bg-white border-2 border-primary rounded-xl hover:bg-primary-50 transition-colors w-full"
                    >
                      <h3 className="text-lg font-bold mb-2">顔型診断のみ</h3>
                      <p className="text-text-secondary text-sm">
                        5つの顔型タイプを判定
                      </p>
                    </button>
                  </HoverSparkle>

                  <HoverSparkle>
                    <button
                      onClick={() => startDiagnosis('color')}
                      className="p-6 bg-white border-2 border-secondary rounded-xl hover:bg-secondary-50 transition-colors w-full"
                    >
                      <h3 className="text-lg font-bold mb-2">カラー診断のみ</h3>
                      <p className="text-text-secondary text-sm">
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
                  <p className="text-sm text-text-secondary mb-2">
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
          <div>
            <MagicalLoading 
              isLoading={true} 
              message="AIが魔法をかけています...✨"
            />
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
                <p className="text-text-secondary mb-8">
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