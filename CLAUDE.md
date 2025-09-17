# StyleMatch Development Guide for Claude

## プロジェクト概要
StyleMatchは、AI顔型診断により20-30代日本女性と美容師をマッチングするモバイルファーストアプリです。

## 技術スタック
- **Frontend**: Next.js 15.5.3 + TypeScript + Tailwind CSS
- **Backend**: Python Flask (AI処理用)
- **Database**: Firebase (Auth, Firestore, Storage)
- **AI**: face_recognition, dlib (顔型診断)
- **State**: Zustand
- **UI/Animation**: Framer Motion

## 主要ディレクトリ構造
```
src/
├── app/
│   ├── mobile/          # モバイルUI
│   │   ├── diagnosis/   # AI診断
│   │   ├── stylists/    # 美容師検索
│   │   └── dashboard/   # ユーザーダッシュボード
│   ├── diagnosis/       # デスクトップ診断
│   └── stylists/        # デスクトップ美容師
├── components/
│   ├── mobile/          # モバイル専用コンポーネント
│   └── ui/              # 共通UIコンポーネント
├── lib/
│   ├── firebase/        # Firebase関連
│   ├── services/        # ビジネスロジック
│   └── stores/          # Zustand ストア
└── types/              # TypeScript型定義
```

## 開発時の注意事項
1. **ポート**: 3003を使用 (デフォルトの3000から変更済み)
2. **モバイルファースト**: `/mobile`がメインエントリーポイント
3. **日本市場特化**: 顔型は5分類（卵型、丸顔、四角顔、ハート型、面長）
4. **セーフエリア対応**: `pt-safe`, `pb-safe`クラスを使用

## よく使うコマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# クリーンインストール
npm run clean:install

# フロントエンド＋バックエンド同時起動
npm run dev:all
```

## 実装済み機能
- ✅ スプラッシュ画面・オンボーディング
- ✅ AI顔型診断（5分類）
- ✅ 診断結果に基づく美容師マッチング
- ✅ 位置情報ベースの検索
- ✅ 予約システム基盤
- ✅ ユーザー認証（Firebase Auth）
- ✅ モバイル最適化UI/UX

## 実装予定機能（B-grade）
- パーソナルカラー診断（16分類）
- リアルタイムチャット
- レビュー・評価システム
- 決済システム統合

## トラブルシューティング
1. **500エラー**: `lucide-react`が不足 → `npm install lucide-react`
2. **ビルドエラー**: `npm run clean:install`で解決
3. **Firebase接続エラー**: `.env.local`の設定を確認

## デプロイメント
現在はローカル開発のみ。本番環境へのデプロイは今後実装予定。