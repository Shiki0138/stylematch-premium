import { QueryClient } from '@tanstack/react-query';

// グローバルなキャッシュ設定
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // データの新鮮さを保つ期間（5分）
      staleTime: 5 * 60 * 1000,
      // キャッシュの保持期間（10分）
      cacheTime: 10 * 60 * 1000,
      // ウィンドウフォーカス時の再フェッチを無効化
      refetchOnWindowFocus: false,
      // マウント時の再フェッチを無効化
      refetchOnMount: false,
      // 再試行設定
      retry: (failureCount, error: any) => {
        // 認証エラー（401）の場合は再試行しない
        if (error?.response?.status === 401) {
          return false;
        }
        // ネットワークエラーの場合は3回まで再試行
        if (error?.code === 'NETWORK_ERROR') {
          return failureCount < 3;
        }
        // その他のエラーは1回だけ再試行
        return failureCount < 1;
      },
      // 再試行の遅延時間
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // ミューテーションのリトライ設定
      retry: false,
      // エラー時の挙動
      onError: (error: any) => {
        console.error('Mutation error:', error);
        // グローバルエラーハンドリング
        if (error?.response?.status === 401) {
          // 認証エラーの場合はログイン画面へ
          window.location.href = '/login';
        }
      },
    },
  },
});

// 特定のクエリ用のキャッシュ設定
export const queryKeys = {
  // ユーザー関連
  user: (id: string) => ['user', id],
  currentUser: () => ['currentUser'],
  userBookings: (userId: string) => ['userBookings', userId],
  
  // 美容師関連
  stylist: (id: string) => ['stylist', id],
  stylists: (filters?: any) => ['stylists', filters],
  stylistBookings: (stylistId: string, date: string) => ['stylistBookings', stylistId, date],
  stylistAvailability: (stylistId: string, date: string) => ['stylistAvailability', stylistId, date],
  
  // 診断関連
  diagnosis: (id: string) => ['diagnosis', id],
  userDiagnoses: (userId: string) => ['userDiagnoses', userId],
  
  // 予約関連
  booking: (id: string) => ['booking', id],
  bookings: (filters?: any) => ['bookings', filters],
  
  // レビュー関連
  reviews: (stylistId: string) => ['reviews', stylistId],
  userReviews: (userId: string) => ['userReviews', userId],
};

// キャッシュの無効化ヘルパー
export const invalidateQueries = {
  // ユーザー情報更新後
  afterUserUpdate: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.currentUser() });
  },
  
  // 予約作成後
  afterBookingCreate: (userId: string, stylistId: string, date: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userBookings(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.stylistBookings(stylistId, date) });
    queryClient.invalidateQueries({ queryKey: queryKeys.stylistAvailability(stylistId, date) });
  },
  
  // 診断完了後
  afterDiagnosisComplete: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userDiagnoses(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
  },
  
  // レビュー投稿後
  afterReviewPost: (stylistId: string, userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews(stylistId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.userReviews(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.stylist(stylistId) });
  },
};

// プリフェッチヘルパー
export const prefetchQueries = {
  // 美容師詳細ページ用
  stylistDetail: async (stylistId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.stylist(stylistId),
        queryFn: () => fetchStylist(stylistId),
        staleTime: 10 * 60 * 1000, // 10分
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.reviews(stylistId),
        queryFn: () => fetchStylistReviews(stylistId),
        staleTime: 5 * 60 * 1000, // 5分
      }),
    ]);
  },
  
  // 予約画面用
  bookingScreen: async (stylistId: string, date: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.stylistAvailability(stylistId, date),
      queryFn: () => fetchStylistAvailability(stylistId, date),
      staleTime: 2 * 60 * 1000, // 2分（頻繁に変わる可能性があるため短め）
    });
  },
};

// API関数の例（実際の実装に置き換えてください）
async function fetchStylist(id: string) {
  // API呼び出しの実装
  throw new Error('Not implemented');
}

async function fetchStylistReviews(stylistId: string) {
  // API呼び出しの実装
  throw new Error('Not implemented');
}

async function fetchStylistAvailability(stylistId: string, date: string) {
  // API呼び出しの実装
  throw new Error('Not implemented');
}