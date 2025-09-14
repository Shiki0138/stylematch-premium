// Firestore データベース型定義

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  
  // プロフィール情報
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'female' | 'male' | 'other';
  prefecture?: string;
  city?: string;
  
  // 設定
  isPublic: boolean;
  allowNotifications: boolean;
  preferredLanguage: 'ja' | 'en';
  
  // システム情報
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface DiagnosisResult {
  id: string;
  userId: string;
  
  // 診断結果
  faceShape: 'tamago' | 'maru' | 'shikaku' | 'heart' | 'omochou'; // 日本語分類
  faceShapeConfidence: number; // 0-1の信頼度
  personalColor?: 'spring' | 'summer' | 'autumn' | 'winter';
  personalColorSubType?: string; // 16分類の詳細タイプ
  personalColorConfidence?: number;
  
  // 解析データ
  facialLandmarks: number[][]; // 68ポイント座標
  faceMetrics: {
    faceWidth: number;
    faceHeight: number;
    jawWidth: number;
    cheekboneWidth: number;
    foreheadWidth: number;
  };
  
  colorAnalysis?: {
    skinTone: string;
    hairColor: string;
    eyeColor: string;
    lipColor: string;
  };
  
  // 画像情報
  originalImageUrl: string;
  processedImageUrl?: string;
  thumbnailUrl?: string;
  
  // 推奨事項
  recommendations: {
    hairstyles: string[];
    hairColors: string[];
    avoidStyles?: string[];
    celebrityMatches?: string[];
  };
  
  // システム情報
  createdAt: Date;
  processingTime: number; // ミリ秒
  aiVersion: string;
}

export interface StylistProfile {
  id: string;
  uid: string; // Firebase Auth UID
  
  // 基本情報
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  
  // プロフェッショナル情報
  salonName: string;
  salonAddress: string;
  salonPhone?: string;
  position: string; // 役職
  experience: number; // 経験年数
  license: string[]; // 資格
  
  // 位置情報
  location: {
    prefecture: string;
    city: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  
  // 専門分野
  specialties: {
    faceShapes: ('tamago' | 'maru' | 'shikaku' | 'heart' | 'omochou')[];
    personalColors: ('spring' | 'summer' | 'autumn' | 'winter')[];
    techniques: string[]; // カット、カラー、パーマ等
    ageGroups: string[]; // 得意年齢層
  };
  
  // ポートフォリオ
  portfolio: {
    imageUrl: string;
    title: string;
    description?: string;
    beforeAfter?: {
      before: string;
      after: string;
    };
    tags: string[];
  }[];
  
  // 料金設定
  pricing: {
    cut?: { min: number; max: number; };
    color?: { min: number; max: number; };
    perm?: { min: number; max: number; };
    treatment?: { min: number; max: number; };
  };
  
  // 営業時間・予約設定
  businessHours: {
    [key: string]: {
      open: string; // HH:mm
      close: string; // HH:mm
      closed: boolean;
    };
  };
  
  bookingSettings: {
    advanceBookingDays: number; // 何日先まで予約可能
    minBookingHours: number; // 最低何時間前まで予約可能
    slotDuration: number; // 予約枠の長さ（分）
  };
  
  // 評価・統計
  ratings: {
    overall: number; // 1-5
    technique: number;
    communication: number;
    satisfaction: number;
    reviewCount: number;
  };
  
  // システム情報
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface Review {
  id: string;
  userId: string;
  stylistId: string;
  bookingId?: string;
  
  // 評価
  ratings: {
    overall: number; // 1-5
    technique: number;
    communication: number;
    satisfaction: number;
  };
  
  // レビュー内容
  title?: string;
  comment: string;
  tags: string[]; // 良かった点のタグ
  
  // 画像
  beforeImages?: string[];
  afterImages?: string[];
  
  // システム情報
  isAnonymous: boolean;
  isVerifiedBooking: boolean;
  createdAt: Date;
  updatedAt?: Date;
  
  // 返信（美容師から）
  reply?: {
    comment: string;
    createdAt: Date;
  };
}

export interface Booking {
  id: string;
  userId: string;
  stylistId: string;
  
  // 予約詳細
  serviceDate: Date;
  startTime: string; // HH:mm
  duration: number; // 分
  services: {
    type: 'cut' | 'color' | 'perm' | 'treatment' | 'styling';
    name: string;
    price: number;
  }[];
  
  // 要望・メモ
  userRequests?: string;
  stylistNotes?: string;
  diagnosisReference?: string; // 診断結果ID
  
  // 料金
  totalAmount: number;
  tax: number;
  discount?: number;
  
  // ステータス
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  
  // 決済情報
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: 'card' | 'cash' | 'bank_transfer';
  paymentId?: string;
  
  // キャンセル情報
  cancellationReason?: string;
  cancellationFee?: number;
  cancelledBy?: 'user' | 'stylist' | 'system';
  cancelledAt?: Date;
  
  // システム情報
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  
  // メッセージ内容
  type: 'text' | 'image' | 'booking_request' | 'booking_update' | 'system';
  content: string;
  imageUrl?: string;
  
  // 関連データ
  bookingReference?: string;
  diagnosisReference?: string;
  
  // ステータス
  isRead: boolean;
  readAt?: Date;
  
  // システム情報
  createdAt: Date;
  updatedAt?: Date;
}

export interface MatchingResult {
  userId: string;
  stylistId: string;
  
  // スコア詳細
  overallScore: number; // 0-100
  scores: {
    faceShapeMatch: number; // 顔型適合度
    personalColorMatch: number; // パーソナルカラー適合度
    locationScore: number; // 立地便利度
    ratingScore: number; // 評価スコア
    availabilityScore: number; // 予約可能度
    priceScore: number; // 価格適正度
  };
  
  // 重み係数
  weights: {
    faceShape: number;
    personalColor: number;
    location: number;
    rating: number;
    availability: number;
    price: number;
  };
  
  // マッチング理由
  reasons: string[];
  
  // システム情報
  calculatedAt: Date;
  algorithmVersion: string;
}

// 集約・統計用型
export interface StylistStats {
  stylistId: string;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number; // 平均返信時間（分）
  period: {
    startDate: Date;
    endDate: Date;
  };
}