'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/useAppStore';
import { CameraCapture } from '@/components/diagnosis/CameraCapture';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
      
      // API URLの設定
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:5000';
      const endpoint = diagnosisType === 'complete' 
        ? '/api/diagnosis/complete'
        : `/api/diagnosis/${diagnosisType}`;

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
        setCurrentDiagnosis(response.data.data);
        setDiagnosisImage(imageData);
        setStep('result');
      } else {
        throw new Error(response.data.error || '診断に失敗しました');
      }
    } catch (error) {
      console.error('診断エラー:', error);
      setError(
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : '診断処理中にエラーが発生しました。もう一度お試しください。'
      );
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
                <button
                  onClick={() => startDiagnosis('complete')}
                  className="w-full p-6 bg-gradient-to-r from-primary to-secondary rounded-xl text-white hover-scale"
                >
                  <h3 className="text-xl font-bold mb-2">完全診断（おすすめ）</h3>
                  <p>顔型とパーソナルカラーを同時に診断します</p>
                  <div className="mt-4 text-sm opacity-90">
                    所要時間: 約30秒
                  </div>
                </button>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => startDiagnosis('face')}
                    className="p-6 bg-white border-2 border-primary rounded-xl hover:bg-primary-50 transition-colors"
                  >
                    <h3 className="text-lg font-bold mb-2">顔型診断のみ</h3>
                    <p className="text-text-secondary text-sm">
                      5つの顔型タイプを判定
                    </p>
                  </button>

                  <button
                    onClick={() => startDiagnosis('color')}
                    className="p-6 bg-white border-2 border-secondary rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    <h3 className="text-lg font-bold mb-2">カラー診断のみ</h3>
                    <p className="text-text-secondary text-sm">
                      4シーズンカラーを判定
                    </p>
                  </button>
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
          <Card>
            <CardContent className="py-16 text-center">
              <LoadingSpinner size="lg" className="mb-6" />
              <h2 className="text-xl font-semibold mb-2">{processingMessage}</h2>
              <div className="space-y-2 text-text-secondary">
                <p>AIが画像を分析しています...</p>
                <p className="text-sm">処理には10〜30秒かかる場合があります</p>
              </div>

              {/* プログレスメッセージ */}
              <div className="mt-8 space-y-2 text-sm text-text-secondary">
                {diagnosisType === 'complete' || diagnosisType === 'face' ? (
                  <p>✓ 顔の特徴点を検出中...</p>
                ) : null}
                {diagnosisType === 'complete' || diagnosisType === 'color' ? (
                  <p>✓ 肌・髪・瞳の色を分析中...</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 結果画面 */}
        {step === 'result' && (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-bold mb-4">診断が完了しました！</h2>
              <p className="text-text-secondary mb-8">
                あなたに最適な美容師をマッチングしました
              </p>
              <Button
                size="lg"
                onClick={viewResults}
              >
                診断結果を見る
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}