# StyleMatch Premium - AI美容診断プラットフォーム

StyleMatchは、AI技術を活用した美容診断と、プロの美容師とのマッチングを提供する革新的なプラットフォームです。

## 🌟 主な機能

- **AI診断**: 顔型・パーソナルカラーを高精度で分析
- **美容師マッチング**: 診断結果に基づいて最適な美容師を提案
- **オンライン相談**: ビデオ通話でプロに相談
- **予約管理**: シームレスな予約・決済システム
- **ポートフォリオ**: 美容師の実績を確認

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: tRPC, Prisma, PostgreSQL
- **認証**: NextAuth.js (Google, LINE, Email)
- **UI**: Radix UI, カスタムコンポーネント
- **AI**: Hair_Style_Recommendation (顔認識・分析)
- **インフラ**: Docker, Vercel/AWS

## 📦 プロジェクト構成

```
stylematch-premium/
├── apps/
│   └── web/              # Next.jsアプリケーション
├── packages/
│   ├── database/         # Prismaスキーマ・クライアント
│   ├── ui/              # 共有UIコンポーネント
│   └── auth/            # 認証設定
└── turbo.json           # Turborepo設定
```

## 🛠️ セットアップ

### 必要な環境

- Node.js 18以上
- PostgreSQL
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定

# データベースのセットアップ
pnpm db:push

# 開発サーバーの起動
pnpm dev
```

### 環境変数

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
LINE_CLIENT_ID="..."
LINE_CLIENT_SECRET="..."

# Email (SendGrid)
SENDGRID_API_KEY="..."
EMAIL_FROM="noreply@stylematch.jp"

# AI Service
AI_SERVICE_URL="..."
AI_SERVICE_API_KEY="..."

# AWS (画像アップロード)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-northeast-1"
AWS_S3_BUCKET="..."

# Payment (Stripe)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
```

## 🔧 開発コマンド

```bash
# 開発サーバー
pnpm dev

# ビルド
pnpm build

# テスト
pnpm test

# リント
pnpm lint

# フォーマット
pnpm format

# データベースマイグレーション
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## 📱 外出先での開発

### 1. GitHub Codespaces（推奨）

1. GitHubリポジトリにアクセス
2. "Code" → "Codespaces" → "Create codespace"
3. ブラウザ上で完全な開発環境が利用可能

### 2. Gitpod

1. リポジトリURLの前に `gitpod.io/#` を追加
   例: `gitpod.io/#https://github.com/yourusername/stylematch-premium`

### 3. ローカル開発（別デバイス）

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/stylematch-premium.git
cd stylematch-premium

# セットアップ
pnpm install
cp .env.example .env
# 環境変数を設定
pnpm dev
```

### 4. クラウドIDE

- **Replit**: オンラインIDE、即座に開発開始
- **StackBlitz**: ブラウザ上でNext.js開発
- **CodeSandbox**: クラウド開発環境

### 5. リモートアクセス

- **VS Code Remote**: SSH経由で自宅のPCに接続
- **Tailscale**: VPN経由で安全にアクセス
- **ngrok**: ローカルサーバーを外部公開

## 🚀 デプロイ

### Vercel（推奨）

```bash
# Vercel CLIをインストール
pnpm i -g vercel

# デプロイ
vercel
```

### Docker

```bash
# ビルド
docker build -t stylematch-premium .

# 実行
docker run -p 3000:3000 stylematch-premium
```

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📞 サポート

質問や問題がある場合は、GitHubのissueを作成してください。