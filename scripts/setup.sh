#!/bin/bash

# StyleMatch Premium セットアップスクリプト

set -e

echo "🚀 StyleMatch Premium セットアップを開始します..."

# Node.js バージョンチェック
echo "📦 Node.js バージョンをチェック中..."
node_version=$(node --version)
echo "Node.js バージョン: $node_version"

if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm をインストール中..."
    npm install -g pnpm
fi

echo "📦 依存関係をインストール中..."
pnpm install

# 環境変数ファイルをコピー
if [ ! -f .env ]; then
    echo "🔧 環境変数ファイルを作成中..."
    cp .env.example .env
    echo "⚠️  .envファイルを編集して必要な環境変数を設定してください"
fi

# データベースセットアップ
echo "🗄️  データベースをセットアップ中..."

if command -v docker &> /dev/null; then
    echo "🐳 Dockerを使用してPostgreSQLを起動中..."
    docker run -d \
        --name stylematch-postgres \
        -e POSTGRES_DB=stylematch \
        -e POSTGRES_USER=stylematch \
        -e POSTGRES_PASSWORD=password \
        -p 5432:5432 \
        postgres:15-alpine
    
    echo "⏳ PostgreSQLが起動するまで待機中..."
    sleep 10
fi

# Prismaセットアップ
echo "🔧 Prismaをセットアップ中..."
pnpm db:generate
pnpm db:push

echo "🌱 初期データをシード中..."
pnpm db:seed

# アップロードディレクトリ作成
echo "📁 アップロードディレクトリを作成中..."
mkdir -p public/uploads/{avatar,analysis,portfolio,style-history}

# SSL証明書生成（開発用）
if [ ! -f ssl/localhost.crt ]; then
    echo "🔒 開発用SSL証明書を生成中..."
    mkdir -p ssl
    openssl req -x509 -newkey rsa:4096 -keyout ssl/localhost.key -out ssl/localhost.crt -days 365 -nodes -subj "/CN=localhost"
fi

echo "✅ セットアップが完了しました！"
echo ""
echo "🚀 開発サーバーを起動するには:"
echo "   pnpm dev"
echo ""
echo "🌐 アプリケーションにアクセス:"
echo "   http://localhost:3000"
echo ""
echo "⚙️  管理画面にアクセス:"
echo "   http://localhost:3000/admin"
echo ""
echo "📚 その他のコマンド:"
echo "   pnpm build     - 本番ビルド"
echo "   pnpm test      - テスト実行"
echo "   pnpm lint      - リント実行"
echo "   pnpm db:studio - Prisma Studio起動"