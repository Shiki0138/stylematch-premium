import React from 'react';
import Link from 'next/link';
import { Stylist, MatchingResult } from '@/types/models';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface StylistCardProps {
  stylist: Stylist;
  matchingResult?: MatchingResult;
  onClick?: () => void;
}

export const StylistCard: React.FC<StylistCardProps> = ({
  stylist,
  matchingResult,
  onClick
}) => {
  const portfolioImage = stylist.portfolio?.images?.[0] || '/default-stylist.png';

  return (
    <Card
      hover
      onClick={onClick}
      className="overflow-hidden"
    >
      <div className="relative">
        {/* ポートフォリオ画像 */}
        <div className="aspect-[4/3] bg-gray-200">
          <img
            src={portfolioImage}
            alt={`${stylist.salon.name}のポートフォリオ`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* マッチングスコアバッジ */}
        {matchingResult && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
            <span className="text-sm font-bold text-primary">
              {matchingResult.matchScore}% マッチ
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* 基本情報 */}
        <div className="mb-3">
          <h3 className="text-lg font-bold mb-1">{stylist.salon.name}</h3>
          <p className="text-sm text-text-secondary">{stylist.salon.address}</p>
          {matchingResult?.distance && (
            <p className="text-sm text-text-secondary">{matchingResult.distance}km</p>
          )}
        </div>

        {/* マッチング理由 */}
        {matchingResult?.matchReasons && matchingResult.matchReasons.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {matchingResult.matchReasons.slice(0, 3).map((reason, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-primary-50 text-primary rounded-full"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 専門分野 */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {stylist.specialties.techniques.slice(0, 3).map((technique, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-text-secondary rounded"
              >
                {technique}
              </span>
            ))}
          </div>
        </div>

        {/* 評価と実績 */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-semibold">{stylist.stats.averageRating.toFixed(1)}</span>
          </div>
          <div className="text-text-secondary">
            施術 {stylist.stats.totalBookings}件
          </div>
        </div>

        {/* 価格帯 */}
        <div className="mb-4 text-sm">
          <span className="text-text-secondary">カット: </span>
          <span className="font-semibold">{formatPrice(stylist.pricing.cut)}</span>
          <span className="text-text-secondary"> ~</span>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <Link href={`/stylists/${stylist.id}`} className="flex-1">
            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              詳細を見る
            </Button>
          </Link>
          <Link href={`/booking/new?stylistId=${stylist.id}`} className="flex-1">
            <Button
              fullWidth
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              予約する
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};