import { Timestamp, GeoPoint } from 'firebase/firestore';

// 基本の顔型タイプ
export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong';

// パーソナルカラータイプ
export type PersonalColor = 'spring' | 'summer' | 'autumn' | 'winter';
export type ColorSubType = 'warm' | 'cool';

// サービスタイプ
export type ServiceType = 'cut' | 'color' | 'perm' | 'treatment';

// 予約ステータス
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// 支払いステータス
export type PaymentStatus = 'pending' | 'completed' | 'refunded';

// 支払い方法
export type PaymentMethod = 'line_pay' | 'paypay' | 'stripe';

// 美容師ステータス
export type StylistStatus = 'active' | 'inactive' | 'suspended';

// ユーザー情報
export interface User {
  id: string;
  email: string;
  name: string;
  birthYear: number;
  createdAt: Timestamp;
  diagnoses: {
    faceShape?: FaceShape;
    personalColor?: PersonalColor;
    colorSubType?: ColorSubType;
    diagnosedAt?: Timestamp;
  };
  preferences: {
    priceRange: [number, number];
    preferredArea: string[];
  };
  profileImageUrl?: string;
}

// 美容師情報
export interface Stylist {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseVerified: boolean;
  salon: {
    name: string;
    location: GeoPoint;
    address: string;
  };
  specialties: {
    faceShapes: FaceShape[];
    personalColors: PersonalColor[];
    techniques: string[];
  };
  portfolio: {
    images: string[];
    categories: ServiceType[];
  };
  pricing: {
    cut: number;
    color: number;
    perm: number;
    treatment: number;
  };
  stats: {
    totalBookings: number;
    averageRating: number;
    repeatRate: number;
  };
  status: StylistStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 予約情報
export interface Booking {
  id: string;
  userId: string;
  stylistId: string;
  date: Timestamp;
  duration: number; // 分単位
  service: {
    type: ServiceType;
    price: number;
  };
  status: BookingStatus;
  diagnosis: {
    faceShape: FaceShape;
    personalColor: PersonalColor;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
  };
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// レビュー情報
export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  stylistId: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: Timestamp;
  verified: boolean;
}

// 診断結果
export interface DiagnosisResult {
  faceShape: FaceShape;
  personalColor: PersonalColor;
  colorSubType: ColorSubType;
  confidence: {
    faceShape: number;
    personalColor: number;
  };
  recommendations: {
    hairstyles: string[];
    colors: string[];
    avoidStyles: string[];
  };
  colorPalette: {
    recommended: string[];
    avoid: string[];
  };
}

// マッチング結果
export interface MatchingResult {
  stylistId: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  distance?: number; // km
  nextAvailable: string;
  pricing: {
    [K in ServiceType]?: number;
  };
}