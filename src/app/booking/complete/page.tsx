'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookingService } from '@/lib/services/booking.service';
import { MatchingService } from '@/lib/services/matching.service';
import { Booking, Stylist } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate, formatPrice } from '@/lib/utils';

export default function BookingCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBookingData();
    } else {
      router.push('/dashboard');
    }
  }, [bookingId]);

  const loadBookingData = async () => {
    if (!bookingId) return;

    try {
      setIsLoading(true);
      
      // 予約情報を取得
      const bookingData = await BookingService.getBookingById(bookingId);
      if (!bookingData) {
        router.push('/dashboard');
        return;
      }
      setBooking(bookingData);

      // 美容師情報を取得
      const stylistData = await MatchingService.getStylistById(bookingData.stylistId);
      if (stylistData) {
        setStylist(stylistData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      router.push('/dashboard');
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

  if (!booking || !stylist) {
    return null;
  }

  const bookingDate = booking.date.toDate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 成功メッセージ */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">予約が完了しました！</h1>
          <p className="text-text-secondary">
            確認メールをお送りしました
          </p>
        </div>

        {/* 予約詳細 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">予約内容</h2>
            
            <div className="space-y-4">
              {/* サロン情報 */}
              <div>
                <h3 className="text-sm text-text-secondary mb-1">サロン</h3>
                <p className="font-medium">{stylist.salon.name}</p>
                <p className="text-sm text-text-secondary">{stylist.salon.address}</p>
              </div>

              {/* 日時 */}
              <div>
                <h3 className="text-sm text-text-secondary mb-1">日時</h3>
                <p className="font-medium">{formatDate(bookingDate)}</p>
                <p className="font-medium">
                  {bookingDate.getHours().toString().padStart(2, '0')}:
                  {bookingDate.getMinutes().toString().padStart(2, '0')}
                </p>
              </div>

              {/* サービス */}
              <div>
                <h3 className="text-sm text-text-secondary mb-1">サービス</h3>
                <p className="font-medium">
                  {booking.service.type === 'cut' && 'カット'}
                  {booking.service.type === 'color' && 'カラー'}
                  {booking.service.type === 'perm' && 'パーマ'}
                  {booking.service.type === 'treatment' && 'トリートメント'}
                </p>
                <p className="text-sm text-text-secondary">
                  所要時間: 約{booking.duration}分
                </p>
              </div>

              {/* 料金 */}
              <div>
                <h3 className="text-sm text-text-secondary mb-1">料金</h3>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(booking.service.price)}
                </p>
                <p className="text-sm text-text-secondary">
                  ※ お支払いは来店時にお願いします
                </p>
              </div>

              {/* 予約番号 */}
              <div className="pt-4 border-t">
                <h3 className="text-sm text-text-secondary mb-1">予約番号</h3>
                <p className="font-mono text-sm">{booking.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">ご来店時のお願い</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 予約時間の5分前までにお越しください</li>
              <li>• キャンセルは前日までにご連絡ください</li>
              <li>• 診断結果を美容師と共有させていただきます</li>
              <li>• マスクの着用をお願いする場合があります</li>
            </ul>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Link href="/dashboard">
            <Button fullWidth>
              ダッシュボードへ
            </Button>
          </Link>
          
          <Link href={`/stylists/${booking.stylistId}`}>
            <Button variant="outline" fullWidth>
              サロン情報を見る
            </Button>
          </Link>
        </div>

        {/* カレンダー追加 */}
        <div className="mt-6 text-center">
          <button className="text-primary hover:underline text-sm">
            カレンダーに追加
          </button>
        </div>
      </div>
    </div>
  );
}