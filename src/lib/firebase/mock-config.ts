// ローカル開発用のモック設定
export const useMockFirebase = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('AIzaSy');

// モックデータ
export const mockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'テストユーザー',
};

export const mockUserData = {
  id: 'mock-user-123',
  email: 'test@example.com',
  name: 'テストユーザー',
  birthYear: 1995,
  createdAt: new Date(),
  diagnoses: {
    faceShape: 'oval' as const,
    personalColor: 'spring' as const,
    colorSubType: 'warm' as const,
    diagnosedAt: new Date(),
  },
  preferences: {
    priceRange: [3000, 10000] as [number, number],
    preferredArea: ['東京'],
  },
};

export const mockStylists = [
  {
    id: 'stylist-1',
    userId: 'user-stylist-1',
    licenseNumber: '123456',
    licenseVerified: true,
    salon: {
      name: 'Beauty Salon Aoyama',
      location: { latitude: 35.6695, longitude: 139.7085 },
      address: '東京都港区南青山1-2-3',
    },
    specialties: {
      faceShapes: ['oval', 'round'] as any[],
      personalColors: ['spring', 'summer'] as any[],
      techniques: ['カット', 'カラー', 'パーマ'],
    },
    portfolio: {
      images: ['/sample-portfolio-1.jpg', '/sample-portfolio-2.jpg'],
      categories: ['cut', 'color'] as any[],
    },
    pricing: {
      cut: 5000,
      color: 8000,
      perm: 12000,
      treatment: 4000,
    },
    stats: {
      totalBookings: 150,
      averageRating: 4.8,
      repeatRate: 0.75,
    },
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'stylist-2',
    userId: 'user-stylist-2',
    licenseNumber: '789012',
    licenseVerified: true,
    salon: {
      name: 'Hair Studio Shibuya',
      location: { latitude: 35.6580, longitude: 139.7016 },
      address: '東京都渋谷区渋谷2-10-15',
    },
    specialties: {
      faceShapes: ['square', 'heart'] as any[],
      personalColors: ['autumn', 'winter'] as any[],
      techniques: ['デザインカット', 'ハイライト', 'トリートメント'],
    },
    portfolio: {
      images: ['/sample-portfolio-3.jpg'],
      categories: ['cut', 'color', 'treatment'] as any[],
    },
    pricing: {
      cut: 6000,
      color: 10000,
      perm: 15000,
      treatment: 5000,
    },
    stats: {
      totalBookings: 230,
      averageRating: 4.9,
      repeatRate: 0.82,
    },
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];