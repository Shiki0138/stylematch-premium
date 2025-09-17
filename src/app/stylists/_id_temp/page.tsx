'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MatchingService } from '@/lib/services/matching.service';
import { Stylist } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatPrice } from '@/lib/utils';

// 'use client'では generateStaticParams は使用不可
// 動的ルートのため静的エクスポートではスキップされる

export default function StylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stylistId = params.id as string;
  
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadStylistData();
  }, [stylistId]);

  const loadStylistData = async () => {
    try {
      setIsLoading(true);
      const data = await MatchingService.getStylistById(stylistId);
      if (data) {
        setStylist(data);
      } else {
        router.push('/stylists');
      }
    } catch (error) {
      console.error('美容師データ取得エラー:', error);
      router.push('/stylists');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stylist) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <Link href="/stylists" className="inline-flex items-center text-primary hover:underline mb-6">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          美容師一覧に戻る
        </Link>

        {/* メイン情報 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* ポートフォリオ画像 */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden mb-4">
              {stylist.portfolio.images.length > 0 ? (
                <img
                  src={stylist.portfolio.images[selectedImageIndex] || '/default-portfolio.png'}
                  alt="ポートフォリオ"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* サムネイル */}
            {stylist.portfolio.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {stylist.portfolio.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`ポートフォリオ ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 基本情報 */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{stylist.salon.name}</h1>
            <p className="text-text-secondary mb-4">{stylist.salon.address}</p>

            {/* 評価と実績 */}
            <div className="flex items-center gap-6 mb-6">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-2xl text-yellow-500">★</span>
                  <span className="text-2xl font-bold">{stylist.stats.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-text-secondary">平均評価</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">{stylist.stats.totalBookings}</p>
                <p className="text-sm text-text-secondary">施術実績</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">{(stylist.stats.repeatRate * 100).toFixed(0)}%</p>
                <p className="text-sm text-text-secondary">リピート率</p>
              </div>
            </div>

            {/* 専門分野 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">専門分野</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-text-secondary">得意な顔型: </span>
                  {stylist.specialties.faceShapes.map((shape, index) => (
                    <span key={shape} className="text-sm">
                      {shape === 'oval' && '卵型'}
                      {shape === 'round' && '丸顔'}
                      {shape === 'square' && '四角顔'}
                      {shape === 'heart' && 'ハート型'}
                      {shape === 'oblong' && '面長'}
                      {index < stylist.specialties.faceShapes.length - 1 && '、'}
                    </span>
                  ))}
                </div>
                <div>
                  <span className="text-sm text-text-secondary">得意なカラー: </span>
                  {stylist.specialties.personalColors.map((color, index) => (
                    <span key={color} className="text-sm">
                      {color === 'spring' && 'イエベ春'}
                      {color === 'summer' && 'ブルベ夏'}
                      {color === 'autumn' && 'イエベ秋'}
                      {color === 'winter' && 'ブルベ冬'}
                      {index < stylist.specialties.personalColors.length - 1 && '、'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 得意な技術 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">得意な技術</h3>
              <div className="flex flex-wrap gap-2">
                {stylist.specialties.techniques.map((technique) => (
                  <span
                    key={technique}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {technique}
                  </span>
                ))}
              </div>
            </div>

            {/* 予約ボタン */}
            <Link href={`/booking/new?stylistId=${stylist.id}`}>
              <Button size="lg" fullWidth>
                この美容師を予約する
              </Button>
            </Link>
          </div>
        </div>

        {/* 料金表 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>料金表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>カット</span>
                <span className="font-semibold">{formatPrice(stylist.pricing.cut)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>カラー</span>
                <span className="font-semibold">{formatPrice(stylist.pricing.color)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>パーマ</span>
                <span className="font-semibold">{formatPrice(stylist.pricing.perm)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>トリートメント</span>
                <span className="font-semibold">{formatPrice(stylist.pricing.treatment)}</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-4">
              ※ 料金は目安です。髪の長さや施術内容により変動する場合があります。
            </p>
          </CardContent>
        </Card>

        {/* サロン情報 */}
        <Card>
          <CardHeader>
            <CardTitle>サロン情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">アクセス</h4>
                <p className="text-text-secondary">{stylist.salon.address}</p>
              </div>
              
              {/* 地図表示エリア（将来的にGoogle Maps APIと連携） */}
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">地図を表示</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">営業時間</h4>
                <p className="text-text-secondary">10:00 - 20:00（最終受付 19:00）</p>
                <p className="text-text-secondary">定休日: 月曜日</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}