# StyleMatch セットアップガイド

このドキュメントでは、StyleMatchプロジェクトを新しい開発環境でセットアップする詳細な手順を説明します。

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Node.js** 18.x以上 (推奨: 20.x)
- **Python** 3.8以上
- **Git**
- **Firebase CLI** (オプション、デプロイ時に必要)

## セットアップ手順

### 1. プロジェクトのクローン

```bash
git clone https://github.com/your-username/stylematch.git
cd stylematch
```

### 2. 環境変数の設定

#### 2.1 環境変数ファイルの作成

```bash
cp .env.example .env.local
```

#### 2.2 Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 新しいプロジェクトを作成、または既存のプロジェクトを選択
3. プロジェクト設定 > 全般 から設定情報を取得
4. `.env.local`に以下の値を設定：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### 2.3 Firebase Admin SDK (サーバーサイド用)

1. Firebase Console > プロジェクト設定 > サービスアカウント
2. 「新しい秘密鍵を生成」をクリック
3. ダウンロードしたJSONファイルの内容を`FIREBASE_SERVICE_ACCOUNT_KEY`に設定

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

#### 2.4 その他の設定（オプション）

**OpenAI API（AI機能を使用する場合）**
```env
OPENAI_API_KEY=sk-...
```

**Stripe（決済機能を使用する場合）**
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. フロントエンドのセットアップ

#### 3.1 依存関係のインストール

```bash
npm install
```

#### 3.2 開発サーバーの起動

```bash
npm run dev
```

アプリケーションが http://localhost:3003 で起動します。

### 4. バックエンド（Python）のセットアップ

#### 4.1 仮想環境の作成

```bash
cd backend
python -m venv venv
```

#### 4.2 仮想環境の有効化

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

#### 4.3 依存関係のインストール

```bash
pip install -r requirements.txt
```

#### 4.4 バックエンドサーバーの起動

```bash
python app.py
```

バックエンドAPIが http://localhost:8000 で起動します。

### 5. Firebaseの初期設定

#### 5.1 Firebase Authentication

1. Firebase Console > Authentication > Sign-in method
2. 以下の認証プロバイダーを有効化：
   - メール/パスワード
   - Google (オプション)

#### 5.2 Firestore Database

1. Firebase Console > Firestore Database
2. 「データベースを作成」をクリック
3. 本番環境モードで開始（後でルールを設定）

#### 5.3 Firebase Storage

1. Firebase Console > Storage
2. 「始める」をクリック
3. デフォルトのバケットを作成

### 6. データベースセキュリティルール

Firestoreのセキュリティルールを設定：

```javascript
// firestore.rules の内容をFirebase Consoleに貼り付け
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証済みユーザーのみアクセス可能
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. npm installでエラーが発生する

```bash
# キャッシュをクリアして再インストール
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. Next.jsの起動エラー

```bash
# .nextディレクトリを削除して再ビルド
rm -rf .next
npm run dev
```

#### 3. Pythonバックエンドが起動しない

```bash
# 依存関係の再インストール
pip install --upgrade -r requirements.txt
```

#### 4. Firebase認証エラー

- Firebase Consoleで認証プロバイダーが有効になっているか確認
- 環境変数が正しく設定されているか確認
- ドメインがFirebase Authenticationの承認済みドメインに追加されているか確認

## 開発のヒント

### 推奨されるVS Code拡張機能

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### Git設定

```bash
# コミット前のフォーマット自動実行
npm install --save-dev husky lint-staged
npx husky install
```

### デバッグ

1. Chrome DevToolsを使用したフロントエンドデバッグ
2. `console.log`や`debugger`ステートメントの活用
3. React Developer Toolsの使用

## デプロイ準備

### プロダクションビルド

```bash
npm run build
```

### 環境変数の確認

本番環境用の環境変数が正しく設定されているか確認：

- Vercel、Netlify、またはその他のホスティングサービスの環境変数設定
- Firebase プロジェクトが本番用に設定されているか

## サポート

問題が発生した場合：

1. プロジェクトのIssuesを確認
2. エラーメッセージを含めて新しいIssueを作成
3. コミュニティフォーラムで質問

---

最終更新: 2025年9月14日