# StyleMatch 緊急修正計画

## Phase 1: 致命的セキュリティ問題の修正（24-48時間以内）

### 1. 認証情報の即時修正

```bash
# .env.production（新規作成）
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}
NEXTAUTH_SECRET=$(openssl rand -base64 32)
AI_SERVICE_API_KEY=${SECURE_API_KEY}
```

### 2. デバッグモード無効化

```python
# backend/app.py
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)  # debug=False に変更
```

### 3. 個人情報取得の同意機能追加

```typescript
// src/components/consent-dialog.tsx
export function ConsentDialog({ onAccept, onDecline }: ConsentDialogProps) {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>顔認識データの利用について</AlertDialogTitle>
          <AlertDialogDescription>
            本サービスでは、AI診断のためにお客様の顔写真を分析します。
            取得したデータは診断目的のみに使用し、30日後に自動削除されます。
            
            収集する情報:
            - 顔の特徴点データ
            - 肌の色調データ
            
            データの利用に同意いただけますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>同意しない</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>同意する</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4. Firebase セキュリティルールの強化

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 診断結果は本人のみ閲覧可能
    match /diagnoses/{diagnosisId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow write: if false; // 書き込みは管理者のみ
    }
  }
}
```

## Phase 2: パフォーマンス緊急修正（1週間以内）

### 1. 画像処理の最適化

```typescript
// src/lib/utils/image-optimizer.ts
export async function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 最大1024pxにリサイズ
        const maxSize = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // JPEG品質80%で圧縮
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

### 2. N+1クエリの解消

```typescript
// src/lib/services/booking.service.ts
static async getStylistBookingsOptimized(
  stylistId: string,
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {
  // 1回のクエリで関連データを全て取得
  const bookings = await prisma.consultation.findMany({
    where: {
      stylistId,
      scheduledAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      customer: {
        include: {
          user: true,
          // analysisResultsは別途必要な時のみ取得
        },
      },
      service: true,
    },
  });
  
  return bookings;
}
```

### 3. キャッシュ戦略の実装

```typescript
// src/lib/utils/cache-config.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      cacheTime: 10 * 60 * 1000, // 10分
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// APIレスポンスヘッダー
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5分キャッシュ
  next();
});
```

## Phase 3: テスト基盤の構築（2週間以内）

### 1. 基本的な単体テスト

```typescript
// src/lib/services/__tests__/booking.service.test.ts
describe('BookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAvailableSlots', () => {
    it('should return available time slots', async () => {
      const mockBookings = [
        { scheduledAt: new Date('2024-01-01 10:00'), duration: 60 },
      ];
      
      jest.spyOn(BookingService, 'getStylistBookings')
        .mockResolvedValue(mockBookings);
      
      const slots = await BookingService.getAvailableSlots(
        'stylist-1',
        new Date('2024-01-01'),
        30
      );
      
      expect(slots).not.toContainEqual({
        time: '10:00',
        available: true,
      });
    });
  });
});
```

### 2. E2Eテストの追加

```typescript
// cypress/e2e/diagnosis.cy.ts
describe('AI診断フロー', () => {
  it('診断を完了できる', () => {
    cy.visit('/mobile/diagnosis');
    
    // 同意画面
    cy.contains('顔認識データの利用について').should('be.visible');
    cy.contains('同意する').click();
    
    // 画像アップロード
    cy.get('input[type="file"]').attachFile('test-face.jpg');
    
    // 診断開始
    cy.contains('診断を開始').click();
    
    // 結果表示
    cy.contains('診断結果', { timeout: 30000 }).should('be.visible');
  });
});
```

## Phase 4: モニタリング導入（1ヶ月以内）

### 1. Sentryの導入

```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // 個人情報をフィルタリング
    if (event.request?.data) {
      delete event.request.data.image;
      delete event.request.data.email;
    }
    return event;
  },
});
```

### 2. パフォーマンスモニタリング

```typescript
// src/lib/monitoring/performance.ts
export function measureApiCall(name: string, fn: () => Promise<any>) {
  const startTime = performance.now();
  
  return fn().finally(() => {
    const duration = performance.now() - startTime;
    
    // Sentryに送信
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `API call: ${name}`,
      level: 'info',
      data: { duration },
    });
    
    // 遅いAPIコールを警告
    if (duration > 3000) {
      console.warn(`Slow API call: ${name} took ${duration}ms`);
    }
  });
}
```

## 実装チェックリスト

- [ ] 環境変数の分離と暗号化
- [ ] デバッグモードの無効化
- [ ] 個人情報同意機能の実装
- [ ] Firebaseセキュリティルールの更新
- [ ] 画像最適化の実装
- [ ] N+1クエリの解消
- [ ] キャッシュ戦略の実装
- [ ] 基本的なテストの追加
- [ ] Sentryの導入
- [ ] パフォーマンスモニタリング

## 推定作業時間

- Phase 1: 2-3人日
- Phase 2: 5-7人日
- Phase 3: 10-15人日
- Phase 4: 5-7人日

**合計: 22-32人日（約1-1.5ヶ月）**

## 優先度

1. **最優先**: セキュリティ修正（Phase 1）
2. **高**: パフォーマンス修正（Phase 2）
3. **中**: テスト基盤（Phase 3）
4. **低**: モニタリング（Phase 4）

この計画に従って段階的に修正を行うことで、最も深刻なリスクから順に対処できます。