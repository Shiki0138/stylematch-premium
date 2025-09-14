import { collection, query, where, getDocs, orderBy, limit, GeoPoint } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Stylist, FaceShape, PersonalColor, MatchingResult } from '@/types/models';
import { StylistProfile, MatchingResult as NewMatchingResult } from '@/types/database';
import { StylistService } from '@/lib/firebase/firestore';
import { useMockFirebase, mockStylists } from '@/lib/firebase/mock-config';

interface MatchingCriteria {
  faceShape: FaceShape;
  personalColor: PersonalColor;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  priceRange?: [number, number];
  serviceType?: string;
}

// 新しいマッチング基準型
export interface NewMatchingCriteria {
  faceShape: string;
  personalColor: string;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  ageGroup?: string;
  preferredGender?: 'male' | 'female' | 'any';
  minRating?: number;
  availableOnly?: boolean;
}

export class MatchingService {
  /**
   * 新しいマッチングシステム - 診断結果に基づいて最適な美容師を検索
   */
  static async findMatchingStylistsNew(criteria: NewMatchingCriteria): Promise<NewMatchingResult[]> {
    try {
      // 美容師一覧を取得
      const stylists = await StylistService.getStylists({
        minRating: criteria.minRating || 4.0,
        userLocation: criteria.location ? {
          lat: criteria.location.latitude,
          lng: criteria.location.longitude
        } : undefined,
        maxDistance: criteria.location?.radiusKm,
        limit: 50 // 初期フィルタリング用
      });

      if (stylists.length === 0) {
        return [];
      }

      // 各美容師のマッチングスコアを計算
      const results: NewMatchingResult[] = [];
      
      for (const stylist of stylists) {
        const matchingResult = this.calculateMatchingScoreNew(stylist, criteria);
        if (matchingResult.overallScore >= 60) { // 60%以上のマッチング率のみ
          results.push(matchingResult);
        }
      }

      // スコア降順でソート
      return results.sort((a, b) => b.overallScore - a.overallScore).slice(0, 20);
    } catch (error) {
      console.error('Error finding matching stylists:', error);
      return [];
    }
  }

  /**
   * 新しいマッチングスコア計算（日本人女性向け最適化）
   */
  private static calculateMatchingScoreNew(
    stylist: StylistProfile, 
    criteria: NewMatchingCriteria
  ): NewMatchingResult {
    const weights = {
      faceShape: 0.35,      // 顔型適合度（重要）
      personalColor: 0.25,  // パーソナルカラー適合度
      location: 0.15,       // 立地便利度
      rating: 0.15,         // 評価スコア
      availability: 0.05,   // 予約可能度
      price: 0.05          // 価格適正度
    };

    const faceShapeScore = this.calculateFaceShapeMatchNew(stylist, criteria.faceShape);
    const personalColorScore = this.calculatePersonalColorMatchNew(stylist, criteria.personalColor);
    const locationScore = criteria.location ? 
      this.calculateLocationScoreNew(stylist, criteria.location) : 80;
    const ratingScore = this.calculateRatingScoreNew(stylist);
    const availabilityScore = this.calculateAvailabilityScoreNew(stylist);
    const priceScore = criteria.priceRange ? 
      this.calculatePriceScoreNew(stylist, criteria.priceRange) : 80;

    const scores = {
      faceShapeMatch: faceShapeScore,
      personalColorMatch: personalColorScore,
      locationScore,
      ratingScore,
      availabilityScore,
      priceScore
    };

    const overallScore = Math.round(
      faceShapeScore * weights.faceShape +
      personalColorScore * weights.personalColor +
      locationScore * weights.location +
      ratingScore * weights.rating +
      availabilityScore * weights.availability +
      priceScore * weights.price
    );

    const reasons = this.generateMatchingReasonsNew(stylist, scores, criteria);

    return {
      userId: 'temp-user-id',
      stylistId: stylist.id,
      overallScore,
      scores,
      weights,
      reasons,
      calculatedAt: new Date(),
      algorithmVersion: '1.0.0'
    };
  }

  private static calculateFaceShapeMatchNew(stylist: StylistProfile, faceShape: string): number {
    const { specialties } = stylist;
    
    const faceShapeMap: { [key: string]: string } = {
      'tamago': 'tamago', 'maru': 'maru', 'shikaku': 'shikaku',
      'heart': 'heart', 'omochou': 'omochou',
      'oval': 'tamago', 'round': 'maru', 'square': 'shikaku', 'oblong': 'omochou'
    };

    const mappedFaceShape = faceShapeMap[faceShape] || faceShape;

    if (specialties.faceShapes.includes(mappedFaceShape as any)) {
      return 95;
    }

    const similarShapes: { [key: string]: string[] } = {
      'tamago': ['maru', 'heart'], 'maru': ['tamago', 'shikaku'],
      'shikaku': ['maru', 'omochou'], 'heart': ['tamago', 'omochou'],
      'omochou': ['heart', 'shikaku']
    };

    const similar = similarShapes[mappedFaceShape] || [];
    for (const shape of similar) {
      if (specialties.faceShapes.includes(shape as any)) {
        return 75;
      }
    }

    return specialties.faceShapes.length >= 4 ? 65 : 40;
  }

  private static calculatePersonalColorMatchNew(stylist: StylistProfile, personalColor: string): number {
    const { specialties } = stylist;

    if (specialties.personalColors.includes(personalColor as any)) {
      return 90;
    }

    const similarColors: { [key: string]: string[] } = {
      'spring': ['autumn'], 'summer': ['winter'],
      'autumn': ['spring'], 'winter': ['summer']
    };

    const similar = similarColors[personalColor] || [];
    for (const color of similar) {
      if (specialties.personalColors.includes(color as any)) {
        return 70;
      }
    }

    return specialties.personalColors.length >= 3 ? 60 : 35;
  }

  private static calculateLocationScoreNew(
    stylist: StylistProfile, 
    location: { latitude: number; longitude: number; radiusKm: number }
  ): number {
    const distance = this.calculateDistance(
      location.latitude, location.longitude,
      stylist.location.coordinates.latitude,
      stylist.location.coordinates.longitude
    );

    if (distance <= 2) return 100;
    if (distance <= 5) return 85;
    if (distance <= 10) return 70;
    if (distance <= 20) return 50;
    return 25;
  }

  private static calculateRatingScoreNew(stylist: StylistProfile): number {
    return Math.min(Math.round(stylist.ratings.overall * 20), 100);
  }

  private static calculateAvailabilityScoreNew(stylist: StylistProfile): number {
    if (!stylist.isActive) return 0;
    
    const lastActive = stylist.lastActiveAt;
    if (!lastActive) return 60;

    const daysSinceActive = Math.floor(
      (new Date().getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive <= 1) return 95;
    if (daysSinceActive <= 3) return 80;
    if (daysSinceActive <= 7) return 65;
    return 40;
  }

  private static calculatePriceScoreNew(
    stylist: StylistProfile, 
    priceRange: { min: number; max: number }
  ): number {
    const pricing = stylist.pricing;
    if (!pricing.cut) return 70;

    const avgPrice = (pricing.cut.min + pricing.cut.max) / 2;

    if (avgPrice >= priceRange.min && avgPrice <= priceRange.max) {
      return 90;
    }

    const deviation = avgPrice < priceRange.min ? 
      priceRange.min - avgPrice : avgPrice - priceRange.max;
    const deviationPercent = deviation / priceRange.max;
    
    return Math.max(20, Math.round(90 - (deviationPercent * 100)));
  }

  private static generateMatchingReasonsNew(
    stylist: StylistProfile,
    scores: any,
    criteria: NewMatchingCriteria
  ): string[] {
    const reasons: string[] = [];

    if (scores.faceShapeMatch >= 90) {
      reasons.push(`${criteria.faceShape}の顔型を得意としています`);
    }
    if (scores.personalColorMatch >= 85) {
      reasons.push(`${criteria.personalColor}のパーソナルカラーに精通しています`);
    }
    if (scores.ratingScore >= 90) {
      reasons.push(`お客様からの評価が非常に高いです（${stylist.ratings.overall.toFixed(1)}★）`);
    }
    if (scores.locationScore >= 85) {
      reasons.push('アクセスが良好な立地にあります');
    }
    if (stylist.experience >= 10) {
      reasons.push(`${stylist.experience}年の豊富な経験があります`);
    }

    return reasons.slice(0, 3);
  }

  /**
   * 診断結果に基づいて美容師をマッチング（既存API）
   */
  static async findMatchingStylists(criteria: MatchingCriteria): Promise<MatchingResult[]> {
    try {
      let stylists: Stylist[] = [];

      // モック環境の場合
      if (useMockFirebase) {
        stylists = mockStylists;
      } else {
        // アクティブな美容師を取得
        const stylistsRef = collection(db, 'stylists');
        const q = query(
          stylistsRef,
          where('status', '==', 'active'),
          where('licenseVerified', '==', true)
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          stylists.push({ id: doc.id, ...doc.data() } as Stylist);
        });
      }

      // マッチングスコアを計算
      const matchingResults = stylists.map((stylist) => {
        const matchScore = this.calculateMatchScore(stylist, criteria);
        const matchReasons = this.getMatchReasons(stylist, criteria, matchScore);
        const distance = criteria.location 
          ? this.calculateDistance(
              criteria.location.latitude,
              criteria.location.longitude,
              stylist.salon.location.latitude,
              stylist.salon.location.longitude
            )
          : undefined;

        return {
          stylistId: stylist.id,
          matchScore,
          matchReasons,
          distance,
          nextAvailable: this.getNextAvailableSlot(stylist),
          pricing: stylist.pricing
        } as MatchingResult;
      });

      // スコアが高い順にソート
      matchingResults.sort((a, b) => b.matchScore - a.matchScore);

      // 上位の結果のみ返す（閾値以上）
      return matchingResults.filter(result => result.matchScore >= 50).slice(0, 20);

    } catch (error) {
      console.error('マッチングエラー:', error);
      throw error;
    }
  }

  /**
   * マッチングスコアを計算（0-100）
   */
  private static calculateMatchScore(stylist: Stylist, criteria: MatchingCriteria): number {
    let score = 0;
    const weights = {
      faceShapeMatch: 40,
      personalColorMatch: 40,
      experienceBonus: 10,
      ratingBonus: 10
    };

    // 顔型の専門性マッチング
    if (stylist.specialties.faceShapes.includes(criteria.faceShape)) {
      score += weights.faceShapeMatch;
    } else if (stylist.specialties.faceShapes.length > 0) {
      // 部分的なマッチング
      score += weights.faceShapeMatch * 0.5;
    }

    // パーソナルカラーの専門性マッチング
    if (stylist.specialties.personalColors.includes(criteria.personalColor)) {
      score += weights.personalColorMatch;
    } else if (stylist.specialties.personalColors.length > 0) {
      // 部分的なマッチング
      score += weights.personalColorMatch * 0.5;
    }

    // 経験値ボーナス（施術数に基づく）
    if (stylist.stats.totalBookings > 100) {
      score += weights.experienceBonus;
    } else if (stylist.stats.totalBookings > 50) {
      score += weights.experienceBonus * 0.7;
    } else if (stylist.stats.totalBookings > 20) {
      score += weights.experienceBonus * 0.5;
    }

    // 評価ボーナス
    if (stylist.stats.averageRating >= 4.5) {
      score += weights.ratingBonus;
    } else if (stylist.stats.averageRating >= 4.0) {
      score += weights.ratingBonus * 0.7;
    } else if (stylist.stats.averageRating >= 3.5) {
      score += weights.ratingBonus * 0.5;
    }

    // 距離による減点（オプション）
    if (criteria.location) {
      const distance = this.calculateDistance(
        criteria.location.latitude,
        criteria.location.longitude,
        stylist.salon.location.latitude,
        stylist.salon.location.longitude
      );

      if (distance > criteria.location.radiusKm) {
        // 指定範囲外の場合は大幅減点
        score *= 0.3;
      } else if (distance > criteria.location.radiusKm * 0.7) {
        // 範囲内でも遠い場合は少し減点
        score *= 0.9;
      }
    }

    // 価格帯による調整（オプション）
    if (criteria.priceRange && criteria.serviceType) {
      const price = stylist.pricing[criteria.serviceType as keyof typeof stylist.pricing];
      if (price < criteria.priceRange[0] || price > criteria.priceRange[1]) {
        // 価格帯外の場合は減点
        score *= 0.8;
      }
    }

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * マッチング理由を生成
   */
  private static getMatchReasons(
    stylist: Stylist, 
    criteria: MatchingCriteria, 
    score: number
  ): string[] {
    const reasons: string[] = [];

    if (stylist.specialties.faceShapes.includes(criteria.faceShape)) {
      reasons.push(`${this.getFaceShapeName(criteria.faceShape)}の専門家`);
    }

    if (stylist.specialties.personalColors.includes(criteria.personalColor)) {
      reasons.push(`${this.getPersonalColorName(criteria.personalColor)}に精通`);
    }

    if (stylist.stats.totalBookings > 100) {
      reasons.push('豊富な施術実績');
    }

    if (stylist.stats.averageRating >= 4.5) {
      reasons.push('高評価獲得');
    }

    if (stylist.stats.repeatRate > 0.7) {
      reasons.push('リピート率70%以上');
    }

    if (score >= 90) {
      reasons.unshift('💎 完璧なマッチング');
    } else if (score >= 80) {
      reasons.unshift('⭐ 高相性');
    }

    return reasons;
  }

  /**
   * 2点間の距離を計算（km）
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // 地球の半径（km）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * 次の予約可能時間を取得（仮実装）
   */
  private static getNextAvailableSlot(stylist: Stylist): string {
    // TODO: 実際の予約状況から計算
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * 顔型の日本語名を取得
   */
  private static getFaceShapeName(faceShape: FaceShape): string {
    const names = {
      oval: '卵型',
      round: '丸顔',
      square: '四角顔',
      heart: 'ハート型',
      oblong: '面長'
    };
    return names[faceShape];
  }

  /**
   * パーソナルカラーの日本語名を取得
   */
  private static getPersonalColorName(personalColor: PersonalColor): string {
    const names = {
      spring: 'イエベ春',
      summer: 'ブルベ夏',
      autumn: 'イエベ秋',
      winter: 'ブルベ冬'
    };
    return names[personalColor];
  }

  /**
   * 美容師の詳細情報を取得
   */
  static async getStylistById(stylistId: string): Promise<Stylist | null> {
    try {
      // モック環境の場合
      if (useMockFirebase) {
        return mockStylists.find(s => s.id === stylistId) || null;
      }

      const stylistsRef = collection(db, 'stylists');
      const q = query(stylistsRef, where('__name__', '==', stylistId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Stylist;
    } catch (error) {
      console.error('美容師情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * おすすめ美容師を取得（診断結果がない場合）
   */
  static async getRecommendedStylists(limit: number = 10): Promise<Stylist[]> {
    try {
      // モック環境の場合
      if (useMockFirebase) {
        return mockStylists.slice(0, limit);
      }

      const stylistsRef = collection(db, 'stylists');
      const q = query(
        stylistsRef,
        where('status', '==', 'active'),
        where('licenseVerified', '==', true),
        orderBy('stats.averageRating', 'desc'),
        orderBy('stats.totalBookings', 'desc'),
        limit
      );

      const querySnapshot = await getDocs(q);
      const stylists: Stylist[] = [];

      querySnapshot.forEach((doc) => {
        stylists.push({ id: doc.id, ...doc.data() } as Stylist);
      });

      return stylists;
    } catch (error) {
      console.error('おすすめ美容師取得エラー:', error);
      throw error;
    }
  }
}