'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { MatchingService } from '@/lib/services/matching.service';
import { BookingService } from '@/lib/services/booking.service';
import { Calendar } from '@/components/booking/Calendar';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Stylist, ServiceType } from '@/types/models';
import { formatPrice, formatDate } from '@/lib/utils';

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, userData } = useAuth();
  const stylistId = searchParams.get('stylistId');

  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<Date | undefined>();
  const [selectedService, setSelectedService] = useState<ServiceType>('cut');
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service');

  // ログインチェック
  useEffect(() => {
    if (!currentUser) {
      router.push(`/login?redirect=/booking/new?stylistId=${stylistId}`);
    }
  }, [currentUser, router, stylistId]);

  // 美容師情報を取得
  useEffect(() => {
    if (stylistId) {
      loadStylistData();
    } else {
      router.push('/stylists');
    }
  }, [stylistId]);

  const loadStylistData = async () => {
    if (!stylistId) return;
    
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
      setError('美容師情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 予約可能時間を取得
  useEffect(() => {
    if (selectedDate && stylist) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedService]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !stylist) return;

    try {
      setLoadingSlots(true);
      const duration = getServiceDuration(selectedService);
      const slots = await BookingService.getAvailableSlots(
        stylist.id,
        selectedDate,
        duration
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('予約可能時間取得エラー:', error);
      setError('予約可能時間の取得に失敗しました');
    } finally {
      setLoadingSlots(false);
    }
  };

  // サービスの所要時間を取得
  const getServiceDuration = (service: ServiceType): number => {
    const durations = {
      cut: 60,
      color: 120,
      perm: 150,
      treatment: 90
    };
    return durations[service];
  };

  // 予約を作成
  const handleBookingSubmit = async () => {
    if (!currentUser || !stylist || !selectedDate || !selectedTime || !userData) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // 診断結果がない場合はデフォルト値を設定
      const diagnosis = userData.diagnoses || {
        faceShape: 'oval',
        personalColor: 'spring'
      };

      const bookingData = {
        userId: currentUser.uid,
        stylistId: stylist.id,
        date: selectedTime,
        duration: getServiceDuration(selectedService),
        serviceType: selectedService,
        price: stylist.pricing[selectedService],
        notes,
        diagnosis: {
          faceShape: diagnosis.faceShape || 'oval',
          personalColor: diagnosis.personalColor || 'spring'
        }
      };

      const bookingId = await BookingService.createBooking(bookingData);
      
      // 予約完了ページへ遷移
      router.push(`/booking/complete?id=${bookingId}`);
    } catch (error) {
      console.error('予約作成エラー:', error);
      setError('予約の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stylist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">予約する</h1>
          <p className="text-text-secondary">{stylist.salon.name}</p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error rounded-lg">
            {error}
          </div>
        )}

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold',
              step === 'service' ? 'bg-primary text-white' : 'bg-gray-200'
            )}>
              1
            </div>
            <div className="w-20 h-1 bg-gray-200 mx-2" />
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold',
              step === 'datetime' ? 'bg-primary text-white' : 'bg-gray-200'
            )}>
              2
            </div>
            <div className="w-20 h-1 bg-gray-200 mx-2" />
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold',
              step === 'confirm' ? 'bg-primary text-white' : 'bg-gray-200'
            )}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: サービス選択 */}
        {step === 'service' && (
          <Card>
            <CardHeader>
              <CardTitle>サービスを選択</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {(['cut', 'color', 'perm', 'treatment'] as ServiceType[]).map(service => (
                  <button
                    key={service}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      selectedService === service
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        {service === 'cut' && 'カット'}
                        {service === 'color' && 'カラー'}
                        {service === 'perm' && 'パーマ'}
                        {service === 'treatment' && 'トリートメント'}
                      </h3>
                      <span className="text-sm text-text-secondary">
                        約{getServiceDuration(service)}分
                      </span>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(stylist.pricing[service])}
                    </p>
                  </button>
                ))}
              </div>

              <Button
                fullWidth
                onClick={() => setStep('datetime')}
              >
                次へ：日時を選択
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 日時選択 */}
        {step === 'datetime' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>日付を選択</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={date => {
                    setSelectedDate(date);
                    setSelectedTime(undefined);
                  }}
                  minDate={new Date()}
                  maxDate={(() => {
                    const max = new Date();
                    max.setMonth(max.getMonth() + 2);
                    return max;
                  })()}
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>時間を選択</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <TimeSlotPicker
                      availableSlots={availableSlots}
                      selectedSlot={selectedTime}
                      onSlotSelect={setSelectedTime}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep('service')}
                fullWidth
              >
                戻る
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                disabled={!selectedDate || !selectedTime}
                fullWidth
              >
                次へ：確認画面
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: 確認画面 */}
        {step === 'confirm' && selectedTime && (
          <Card>
            <CardHeader>
              <CardTitle>予約内容の確認</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">サロン情報</h3>
                  <p>{stylist.salon.name}</p>
                  <p className="text-sm text-text-secondary">{stylist.salon.address}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">日時</h3>
                  <p>{formatDate(selectedTime)}</p>
                  <p>
                    {selectedTime.getHours().toString().padStart(2, '0')}:
                    {selectedTime.getMinutes().toString().padStart(2, '0')}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">サービス</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p>
                        {selectedService === 'cut' && 'カット'}
                        {selectedService === 'color' && 'カラー'}
                        {selectedService === 'perm' && 'パーマ'}
                        {selectedService === 'treatment' && 'トリートメント'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        所要時間: 約{getServiceDuration(selectedService)}分
                      </p>
                    </div>
                    <p className="text-lg font-bold">
                      {formatPrice(stylist.pricing[selectedService])}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    要望・メモ（任意）
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="スタイルの希望や相談したいことがあれば記入してください"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus-ring"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('datetime')}
                  fullWidth
                  disabled={isLoading}
                >
                  戻る
                </Button>
                <Button
                  onClick={handleBookingSubmit}
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                >
                  予約を確定する
                </Button>
              </div>

              <p className="text-sm text-text-secondary text-center mt-4">
                ※ 支払いは来店時に行います
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// cn関数の実装（インライン）
function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}