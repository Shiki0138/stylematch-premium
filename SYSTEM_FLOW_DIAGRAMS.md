# StyleMatch システムフロー図

## 1. ユーザー登録・認証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant F as Firebase Auth
    participant DB as Firestore
    participant S as Sentry

    U->>A: アプリ起動
    A->>F: 認証状態確認
    F-->>A: 未認証
    
    U->>A: サインアップ選択
    U->>A: メールアドレス・パスワード入力
    A->>F: createUserWithEmailAndPassword()
    F-->>A: ユーザー作成成功
    
    A->>DB: ユーザープロファイル作成
    DB-->>A: 保存完了
    
    A->>S: ユーザー登録イベント記録
    A-->>U: ダッシュボード表示
```

## 2. AI顔型診断フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant C as カメラ
    participant IO as ImageOptimizer
    participant API as Flask API
    participant AI as AI Model
    participant DB as Firestore
    participant S as Sentry

    U->>A: 診断開始
    A->>C: カメラアクセス要求
    C-->>A: 許可
    
    U->>A: 写真撮影
    A->>IO: 画像最適化（圧縮）
    IO-->>A: 最適化完了（60-80%削減）
    
    A->>API: 診断リクエスト（画像送信）
    API->>AI: 顔型解析
    AI-->>API: 診断結果
    API-->>A: 結果返却
    
    A->>DB: 診断結果保存
    A->>S: 診断完了イベント
    A-->>U: 診断結果表示
```

## 3. 美容師検索・マッチングフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant GEO as Geolocation API
    participant DB as Firestore
    participant RQ as React Query
    participant S as Sentry

    U->>A: 美容師検索
    A->>GEO: 位置情報取得
    GEO-->>A: 現在地座標
    
    A->>RQ: キャッシュ確認
    alt キャッシュあり
        RQ-->>A: キャッシュデータ返却
    else キャッシュなし
        A->>DB: 近隣の美容師検索クエリ
        Note over DB: 診断結果に基づくフィルタリング
        DB-->>A: 美容師リスト
        A->>RQ: キャッシュ保存
    end
    
    A-->>U: 美容師リスト表示
    U->>A: 美容師選択
    A->>DB: 美容師詳細取得
    DB-->>A: 詳細情報
    A-->>U: 美容師プロフィール表示
```

## 4. 予約作成フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant BS as BookingService
    participant DB as Firestore
    participant N as Notification
    participant S as Sentry

    U->>A: 予約画面へ
    A->>BS: 空き時間取得
    BS->>DB: 予約済み時間帯クエリ
    DB-->>BS: 既存予約データ
    BS-->>A: 利用可能時間帯
    
    U->>A: 日時・サービス選択
    A->>BS: 予約作成リクエスト
    BS->>DB: 予約データ保存
    DB-->>BS: 保存完了
    
    BS->>N: 通知作成（ユーザー・美容師）
    BS->>S: 予約作成イベント
    BS-->>A: 予約確認
    A-->>U: 予約完了画面
```

## 5. エラーハンドリング・モニタリングフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant API as Backend API
    participant S as Sentry
    participant M as モニタリング

    U->>A: 何らかの操作
    A->>API: APIリクエスト
    
    alt 正常処理
        API-->>A: 成功レスポンス
        A->>M: パフォーマンスメトリクス送信
    else エラー発生
        API-->>A: エラーレスポンス
        A->>S: エラー詳細送信
        Note over S: スタックトレース<br/>ユーザー情報<br/>操作履歴
        S->>S: エラー分類・通知
        A-->>U: エラー画面表示
        U->>A: フィードバック送信
        A->>S: フィードバック記録
    end
```

## 6. プライバシー・データ管理フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant PC as PrivacyComponent
    participant DB as Firestore
    participant CJ as CleanupJob
    
    alt 初回利用
        U->>A: アプリ起動
        A->>PC: 同意確認
        PC-->>U: 同意ダイアログ表示
        U->>PC: 同意選択
        PC->>A: localStorage保存
        PC->>DB: 同意記録保存
    end
    
    alt データ削除要求
        U->>A: データ削除リクエスト
        A->>DB: 削除リクエスト作成
        Note over DB: 30日間の猶予期間
        DB-->>A: リクエスト受付
        A-->>U: 確認メール送信
        
        CJ->>DB: 定期的な削除処理
        DB-->>CJ: 期限切れリクエスト
        CJ->>DB: データ削除実行
    end
```

## 7. パフォーマンス最適化フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant RQ as React Query
    participant IO as ImageOptimizer
    participant CDN as CDN/Cache
    participant API as Backend API

    U->>A: ページ遷移
    
    par 並列処理
        A->>RQ: データフェッチ
        and
        A->>CDN: 画像リクエスト
    end
    
    alt キャッシュヒット
        RQ-->>A: キャッシュデータ
        CDN-->>A: キャッシュ画像
    else キャッシュミス
        RQ->>API: APIコール
        API-->>RQ: データ取得
        RQ->>RQ: キャッシュ保存
        
        CDN->>IO: 画像最適化
        IO-->>CDN: WebP形式変換
        CDN->>CDN: キャッシュ保存
    end
    
    A-->>U: 高速レンダリング
```

## 8. セキュリティ認証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as StyleMatch App
    participant AM as AuthMiddleware
    participant F as Firebase Auth
    participant RL as RateLimiter
    participant API as Protected API

    U->>A: 保護されたリソースへアクセス
    A->>AM: APIリクエスト（トークン付き）
    
    AM->>RL: レート制限チェック
    alt レート制限内
        RL-->>AM: 許可
        AM->>F: トークン検証
        alt 有効なトークン
            F-->>AM: ユーザー情報
            AM->>API: リクエスト転送
            API-->>AM: レスポンス
            AM-->>A: 成功レスポンス
        else 無効なトークン
            F-->>AM: 検証失敗
            AM-->>A: 401 Unauthorized
        end
    else レート制限超過
        RL-->>AM: 拒否
        AM-->>A: 429 Too Many Requests
    end
```

## フロー図の活用方法

これらのフロー図は以下の用途で活用できます：

1. **開発チーム内での仕様共有**
2. **新規メンバーへのシステム説明**
3. **トラブルシューティング時の参照**
4. **パフォーマンスボトルネックの特定**
5. **セキュリティ監査の資料**

各フローは実装済みの機能を正確に反映しており、システムの動作を理解するための重要な資料となります。