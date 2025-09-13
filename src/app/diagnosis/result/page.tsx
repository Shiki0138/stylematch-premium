'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DiagnosisResultPage() {
  const router = useRouter();
  const { currentUser, userData } = useAuth();
  const { currentDiagnosis, diagnosisImage } = useAppStore();

  // ログインチェック
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/diagnosis/result');
    }
  }, [currentUser, router]);

  // 診断結果がない場合は診断ページへ
  useEffect(() => {
    if (!currentDiagnosis && !userData?.diagnoses?.faceShape) {
      router.push('/diagnosis');
    }
  }, [currentDiagnosis, userData, router]);

  // 表示する診断結果（新規診断優先）
  const diagnosis = currentDiagnosis || (userData?.diagnoses ? {
    faceShape: userData.diagnoses.faceShape,
    personalColor: userData.diagnoses.personalColor,
    colorSubType: userData.diagnoses.colorSubType,
  } : null);

  if (!diagnosis) {
    return null;
  }

  // 顔型の説明
  const faceShapeInfo = {
    oval: {
      name: '卵型',
      description: '理想的なバランスの顔型。ほとんどのヘアスタイルが似合います。',
      recommendations: ['ショートヘア', 'ボブ', 'ロングヘア', 'パーマスタイル'],
      icon: '🥚'
    },
    round: {
      name: '丸顔',
      description: 'かわいらしい印象の顔型。縦のラインを強調するスタイルがおすすめ。',
      recommendations: ['レイヤードスタイル', 'サイドパート', 'ストレートロング'],
      icon: '🌕'
    },
    square: {
      name: '四角顔',
      description: 'しっかりとした印象の顔型。ソフトなラインのスタイルでバランスを。',
      recommendations: ['ウェーブスタイル', 'サイドに流すバング', 'ゆるふわパーマ'],
      icon: '⬜'
    },
    heart: {
      name: 'ハート型',
      description: '額が広く顎がシャープな顔型。下部にボリュームのあるスタイルが◎',
      recommendations: ['顎ラインのボブ', 'サイドバング', 'ウェーブロング'],
      icon: '❤️'
    },
    oblong: {
      name: '面長',
      description: '縦に長い印象の顔型。横幅を強調するスタイルでバランスよく。',
      recommendations: ['前髪あり', 'ボリュームスタイル', 'ゆるめのウェーブ'],
      icon: '🥖'
    }
  };

  // パーソナルカラーの説明
  const personalColorInfo = {
    spring: {
      name: 'イエベ春',
      description: '明るく温かみのある色が似合うタイプ。フレッシュで若々しい印象。',
      colors: ['コーラルピンク', 'オレンジ', 'イエローベージュ', 'ゴールドブラウン'],
      icon: '🌸'
    },
    summer: {
      name: 'ブルベ夏',
      description: 'ソフトで涼しげな色が似合うタイプ。上品でエレガントな印象。',
      colors: ['ローズピンク', 'ラベンダー', 'パウダーブルー', 'アッシュグレー'],
      icon: '🌊'
    },
    autumn: {
      name: 'イエベ秋',
      description: '深みのある温かい色が似合うタイプ。落ち着いた大人っぽい印象。',
      colors: ['テラコッタ', 'カーキ', 'マスタード', 'ダークブラウン'],
      icon: '🍂'
    },
    winter: {
      name: 'ブルベ冬',
      description: 'はっきりとした鮮やかな色が似合うタイプ。クールでシャープな印象。',
      colors: ['ビビッドピンク', 'ロイヤルブルー', 'ピュアホワイト', 'ブラック'],
      icon: '❄️'
    }
  };

  const faceInfo = diagnosis.faceShape ? faceShapeInfo[diagnosis.faceShape] : null;
  const colorInfo = diagnosis.personalColor ? personalColorInfo[diagnosis.personalColor] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">診断結果</h1>
          <p className="text-text-secondary">
            あなたの魅力を最大限に引き出すスタイルをご提案します
          </p>
        </div>

        {/* 診断画像 */}
        {diagnosisImage && (
          <div className="mb-8 flex justify-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={diagnosisImage}
                alt="診断画像"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* 結果カード */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 顔型診断結果 */}
          {faceInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{faceInfo.icon}</span>
                  顔型診断結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {faceInfo.name}
                </h3>
                <p className="text-text-secondary mb-4">
                  {faceInfo.description}
                </p>
                <div>
                  <h4 className="font-semibold mb-2">おすすめヘアスタイル</h4>
                  <div className="flex flex-wrap gap-2">
                    {faceInfo.recommendations.map((style, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* パーソナルカラー診断結果 */}
          {colorInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{colorInfo.icon}</span>
                  パーソナルカラー診断結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-secondary mb-2">
                  {colorInfo.name}
                </h3>
                <p className="text-text-secondary mb-4">
                  {colorInfo.description}
                </p>
                <div>
                  <h4 className="font-semibold mb-2">おすすめカラー</h4>
                  <div className="flex flex-wrap gap-2">
                    {colorInfo.colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary-50 text-secondary rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 総合アドバイス */}
        {diagnosis.recommendations && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>あなたへのアドバイス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">推奨スタイル</h4>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    {diagnosis.recommendations.hairstyles?.map((style: string, index: number) => (
                      <li key={index}>{style}</li>
                    ))}
                  </ul>
                </div>
                {diagnosis.recommendations.avoidStyles && diagnosis.recommendations.avoidStyles.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">避けたほうが良いスタイル</h4>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      {diagnosis.recommendations.avoidStyles.map((style: string, index: number) => (
                        <li key={index}>{style}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTAボタン */}
        <div className="space-y-4">
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push('/stylists')}
          >
            あなたに合う美容師を探す
          </Button>
          
          <Button
            variant="outline"
            fullWidth
            onClick={() => router.push('/diagnosis')}
          >
            もう一度診断する
          </Button>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-primary hover:underline text-sm"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>

        {/* シェアボタン */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary mb-2">診断結果をシェア</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                // TODO: Twitterシェア機能
              }}
              className="p-2 bg-blue-400 text-white rounded-full hover-scale"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </button>
            <button
              onClick={() => {
                // TODO: LINEシェア機能
              }}
              className="p-2 bg-green-500 text-white rounded-full hover-scale"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}