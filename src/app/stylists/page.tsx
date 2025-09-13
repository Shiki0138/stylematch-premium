'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/useAppStore';
import { MatchingService } from '@/lib/services/matching.service';
import { StylistCard } from '@/components/stylists/StylistCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Stylist, MatchingResult } from '@/types/models';

export default function StylistsPage() {
  const { userData } = useAuth();
  const { currentDiagnosis } = useAppStore();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'matching' | 'all'>('matching');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);

  // 位置情報を取得
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
          setLocationEnabled(true);
        },
        (error) => {
          console.error('位置情報取得エラー:', error);
          setLocationEnabled(false);
        }
      );
    }
  };

  // 美容師データを取得
  useEffect(() => {
    loadStylists();
  }, [filterMode, userLocation]);

  const loadStylists = async () => {
    setIsLoading(true);
    try {
      const diagnosis = currentDiagnosis || userData?.diagnoses;

      if (filterMode === 'matching' && diagnosis?.faceShape && diagnosis?.personalColor) {
        // マッチング検索
        const criteria = {
          faceShape: diagnosis.faceShape,
          personalColor: diagnosis.personalColor,
          location: userLocation ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radiusKm: 10
          } : undefined
        };

        const results = await MatchingService.findMatchingStylists(criteria);
        setMatchingResults(results);

        // マッチング結果から美容師情報を取得
        const stylistPromises = results.map(result => 
          MatchingService.getStylistById(result.stylistId)
        );
        const stylistsData = await Promise.all(stylistPromises);
        setStylists(stylistsData.filter(s => s !== null) as Stylist[]);
      } else {
        // おすすめ美容師を取得
        const recommendedStylists = await MatchingService.getRecommendedStylists(20);
        setStylists(recommendedStylists);
        setMatchingResults([]);
      }
    } catch (error) {
      console.error('美容師データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // マッチング結果を取得
  const getMatchingResult = (stylistId: string): MatchingResult | undefined => {
    return matchingResults.find(result => result.stylistId === stylistId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">美容師を探す</h1>
          
          {/* 診断結果がある場合のメッセージ */}
          {userData?.diagnoses?.faceShape && (
            <div className="bg-primary-50 p-4 rounded-lg mb-4">
              <p className="text-sm">
                <span className="font-semibold">診断結果: </span>
                {userData.diagnoses.faceShape === 'oval' && '卵型'}
                {userData.diagnoses.faceShape === 'round' && '丸顔'}
                {userData.diagnoses.faceShape === 'square' && '四角顔'}
                {userData.diagnoses.faceShape === 'heart' && 'ハート型'}
                {userData.diagnoses.faceShape === 'oblong' && '面長'}
                ・
                {userData.diagnoses.personalColor === 'spring' && 'イエベ春'}
                {userData.diagnoses.personalColor === 'summer' && 'ブルベ夏'}
                {userData.diagnoses.personalColor === 'autumn' && 'イエベ秋'}
                {userData.diagnoses.personalColor === 'winter' && 'ブルベ冬'}
                に基づいてマッチング
              </p>
            </div>
          )}

          {/* フィルターボタン */}
          <div className="flex flex-wrap gap-2 mb-4">
            {userData?.diagnoses?.faceShape && (
              <>
                <Button
                  variant={filterMode === 'matching' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('matching')}
                >
                  マッチング順
                </Button>
                <Button
                  variant={filterMode === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('all')}
                >
                  すべて表示
                </Button>
              </>
            )}
            
            {!locationEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestLocation}
              >
                📍 現在地から探す
              </Button>
            )}
          </div>

          {/* 結果数 */}
          {!isLoading && (
            <p className="text-text-secondary">
              {stylists.length}件の美容師が見つかりました
            </p>
          )}
        </div>

        {/* ローディング */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* 美容師一覧 */}
        {!isLoading && stylists.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stylists.map((stylist) => (
              <StylistCard
                key={stylist.id}
                stylist={stylist}
                matchingResult={getMatchingResult(stylist.id)}
              />
            ))}
          </div>
        )}

        {/* 結果なし */}
        {!isLoading && stylists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">
              条件に合う美容師が見つかりませんでした
            </p>
            <Button
              variant="outline"
              onClick={() => setFilterMode('all')}
            >
              すべての美容師を表示
            </Button>
          </div>
        )}

        {/* 診断を促すCTA */}
        {!userData?.diagnoses?.faceShape && !isLoading && (
          <div className="mt-12 text-center bg-white p-8 rounded-xl shadow-soft">
            <h2 className="text-xl font-bold mb-4">
              AI診断で最適な美容師を見つけましょう
            </h2>
            <p className="text-text-secondary mb-6">
              顔型とパーソナルカラーを診断することで、
              あなたに最適な美容師をマッチングします
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = '/diagnosis'}
            >
              無料診断を始める
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}