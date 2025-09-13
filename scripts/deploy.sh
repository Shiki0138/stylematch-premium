#!/bin/bash

# StyleMatch Premium デプロイスクリプト

set -e

echo "🚀 StyleMatch Premium のデプロイを開始します..."

# 環境選択
ENVIRONMENT=${1:-staging}
echo "📍 デプロイ環境: $ENVIRONMENT"

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ 不正な環境です。'staging' または 'production' を指定してください。"
    exit 1
fi

# Pre-deploy checks
echo "🔍 デプロイ前チェックを実行中..."

# TypeScript型チェック
echo "📝 TypeScript型チェック中..."
pnpm type-check

# リントチェック
echo "🔍 リントチェック中..."
pnpm lint

# テスト実行
echo "🧪 テスト実行中..."
pnpm test

# ビルドテスト
echo "🏗️  ビルドテスト中..."
pnpm build

echo "✅ 全ての事前チェックが完了しました"

# デプロイ実行
case $ENVIRONMENT in
  staging)
    echo "🚀 ステージング環境にデプロイ中..."
    # Vercel Preview deploy
    vercel --env .env.staging
    ;;
  production)
    echo "🚀 本番環境にデプロイ中..."
    # 本番デプロイ前の最終確認
    read -p "本番環境にデプロイしますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Vercel Production deploy
        vercel --prod --env .env.production
        
        # データベースマイグレーション
        echo "🗄️  本番データベースマイグレーション実行中..."
        pnpm db:deploy
        
        # Slack通知（オプション）
        if [ -n "$SLACK_WEBHOOK_URL" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data '{"text":"🚀 StyleMatch Premium が本番環境にデプロイされました"}' \
                $SLACK_WEBHOOK_URL
        fi
        
        echo "🎉 本番デプロイが完了しました！"
    else
        echo "❌ デプロイがキャンセルされました"
        exit 1
    fi
    ;;
esac

# デプロイ後のヘルスチェック
echo "🏥 デプロイ後ヘルスチェック中..."
sleep 30

if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="https://stylematch.jp/api/health"
else
    HEALTH_URL="https://stylematch-staging.vercel.app/api/health"
fi

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
if [ $response = "200" ]; then
    echo "✅ ヘルスチェック成功: アプリケーションは正常に動作しています"
else
    echo "❌ ヘルスチェック失敗: HTTP $response"
    exit 1
fi

echo ""
echo "🎉 デプロイが正常に完了しました！"
echo "🌐 URL: $HEALTH_URL"