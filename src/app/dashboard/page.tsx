'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';
import { BookingService } from '@/lib/services/booking.service';
import { MatchingService } from '@/lib/services/matching.service';
import { Booking, Stylist } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate, formatPrice } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, userData } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stylists, setStylists] = useState<Record<string, Stylist>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/dashboard');
    } else {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // ユーザーの予約一覧を取得
      const userBookings = await BookingService.getUserBookings(currentUser.uid);
      setBookings(userBookings);

      // 予約に関連する美容師情報を取得
      const stylistIds = [...new Set(userBookings.map(b => b.stylistId))];
      const stylistsData: Record<string, Stylist> = {};
      
      for (const id of stylistIds) {
        const stylist = await MatchingService.getStylistById(id);
        if (stylist) {
          stylistsData[id] = stylist;
        }
      }
      
      setStylists(stylistsData);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = booking.date.toDate();
    return bookingDate >= new Date() && booking.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = booking.date.toDate();
    return bookingDate < new Date() || booking.status === 'cancelled';
  });

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
          <p className="text-text-secondary">
            ようこそ、{userData?.name || currentUser.email}さん
          </p>
        </div>

        {/* クイックアクション */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="hover-scale cursor-pointer" onClick={() => router.push('/diagnosis')}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">AI診断</h3>
              <p className="text-sm text-text-secondary">
                {userData?.diagnoses?.diagnosedAt ? '再診断する' : '診断を始める'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer" onClick={() => router.push('/stylists')}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">💇</div>
              <h3 className="font-semibold mb-1">美容師を探す</h3>
              <p className="text-sm text-text-secondary">
                マッチング結果を見る
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer" onClick={() => router.push('/profile')}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">👤</div>
              <h3 className="font-semibold mb-1">プロフィール</h3>
              <p className="text-sm text-text-secondary">
                設定を変更する
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 診断結果サマリー */}
        {userData?.diagnoses?.diagnosedAt && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>あなたの診断結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm text-text-secondary mb-1">顔型</h4>
                  <p className="text-xl font-semibold">
                    {userData.diagnoses.faceShape === 'oval' && '卵型'}
                    {userData.diagnoses.faceShape === 'round' && '丸顔'}
                    {userData.diagnoses.faceShape === 'square' && '四角顔'}
                    {userData.diagnoses.faceShape === 'heart' && 'ハート型'}
                    {userData.diagnoses.faceShape === 'oblong' && '面長'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-text-secondary mb-1">パーソナルカラー</h4>
                  <p className="text-xl font-semibold">
                    {userData.diagnoses.personalColor === 'spring' && 'イエベ春'}
                    {userData.diagnoses.personalColor === 'summer' && 'ブルベ夏'}
                    {userData.diagnoses.personalColor === 'autumn' && 'イエベ秋'}
                    {userData.diagnoses.personalColor === 'winter' && 'ブルベ冬'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/diagnosis/result">
                  <Button variant="outline" size="sm">
                    診断結果の詳細を見る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 予約一覧 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>予約履歴</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'upcoming'
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  今後の予約
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'past'
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  過去の予約
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : displayBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">
                  {activeTab === 'upcoming' 
                    ? '予約はありません' 
                    : '過去の予約はありません'}
                </p>
                {activeTab === 'upcoming' && (
                  <Link href="/stylists">
                    <Button>美容師を探す</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayBookings.map((booking) => {
                  const stylist = stylists[booking.stylistId];
                  const bookingDate = booking.date.toDate();
                  
                  return (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg hover:shadow-soft transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-1">
                            {stylist?.salon.name || '読み込み中...'}
                          </h3>
                          <p className="text-sm text-text-secondary mb-2">
                            {formatDate(bookingDate)} 
                            {' '}
                            {bookingDate.getHours().toString().padStart(2, '0')}:
                            {bookingDate.getMinutes().toString().padStart(2, '0')}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              {booking.service.type === 'cut' && 'カット'}
                              {booking.service.type === 'color' && 'カラー'}
                              {booking.service.type === 'perm' && 'パーマ'}
                              {booking.service.type === 'treatment' && 'トリートメント'}
                            </span>
                            <span className="font-medium">
                              {formatPrice(booking.service.price)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {booking.status === 'pending' && (
                            <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                              確認待ち
                            </span>
                          )}
                          {booking.status === 'confirmed' && (
                            <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                              確定
                            </span>
                          )}
                          {booking.status === 'completed' && (
                            <span className="text-sm px-2 py-1 bg-gray-100 text-gray-800 rounded">
                              完了
                            </span>
                          )}
                          {booking.status === 'cancelled' && (
                            <span className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded">
                              キャンセル
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            詳細を見る
                          </Button>
                          {bookingDate.getTime() - new Date().getTime() > 24 * 60 * 60 * 1000 && (
                            <Button size="sm" variant="outline" className="text-error border-error">
                              キャンセル
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'past' && booking.status === 'completed' && (
                        <div className="mt-3">
                          <Link href={`/stylists/${booking.stylistId}`}>
                            <Button size="sm" variant="outline">
                              もう一度予約
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}