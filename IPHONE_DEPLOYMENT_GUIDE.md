# 📱 iPhone実機デプロイ手順

## 🚀 事前準備

### 1. 必要なもの
- Mac（Xcode用）
- iPhone実機
- Lightningケーブル or USB-Cケーブル
- Apple ID（無料でOK）

### 2. 開発環境の確認
```bash
# Node.jsバージョン確認（18以上推奨）
node --version

# Capacitorがインストールされているか確認
npx cap --version
```

## 📋 実機デプロイ手順

### Step 1: ビルドとCapacitor準備

```bash
# 1. プロジェクトディレクトリに移動
cd /Users/MBP/Library/Mobile\ Documents/com~apple~CloudDocs/Desktop/system/044_診断/stylematch

# 2. 依存関係の確認
npm install

# 3. Next.jsビルド（Capacitor用設定を使用）
npm run cap:build:export

# 4. iOSプロジェクトを同期
npm run cap:sync
```

### Step 2: Xcodeでの設定

```bash
# Xcodeでプロジェクトを開く
npm run cap:open:ios
```

#### Xcodeでの設定手順:

1. **Team設定**
   - 左側のプロジェクトナビゲータで「App」を選択
   - 「Signing & Capabilities」タブを開く
   - 「Team」で個人のApple IDを選択（初回は追加が必要）

2. **Bundle Identifier変更**
   - 「Bundle Identifier」を一意の値に変更
   - 例: `com.yourname.stylematch` → `com.tanaka.stylematch`

3. **デバイス登録**
   - iPhoneをMacに接続
   - Xcodeの上部でデバイスを選択（「iPhone」と表示される）

### Step 3: 実機へのインストール

#### A. Xcodeから直接実行（推奨）
```
1. Xcodeの左上の「▶️」ボタンをクリック
2. 初回は「信頼されていないデベロッパ」エラーが出る
```

#### B. エラーが出た場合の対処
iPhoneで以下の設定:
```
設定 > 一般 > VPNとデバイス管理 > デベロッパAPP
→ あなたのApple IDを選択
→ 「信頼」をタップ
```

### Step 4: デバッグとテスト

#### Safari開発者ツールでデバッグ

1. **iPhoneの設定**
   ```
   設定 > Safari > 詳細 > Webインスペクタ をON
   ```

2. **Macの設定**
   ```
   Safari > 環境設定 > 詳細 > 
   「メニューバーに"開発"メニューを表示」をチェック
   ```

3. **デバッグ開始**
   ```
   Mac Safari > 開発 > あなたのiPhone > StyleMatch
   ```

## 🔧 トラブルシューティング

### 1. 「信頼されていない開発元」エラー
```
解決方法:
iPhone: 設定 > 一般 > VPNとデバイス管理
→ デベロッパAPPで信頼を設定
```

### 2. Bundle ID競合エラー
```
解決方法:
Bundle IDを完全にユニークな値に変更
例: com.{あなたの名前}.stylematch.{日付}
```

### 3. Provisioning Profileエラー
```
解決方法:
1. Xcodeでチームを再選択
2. 「Automatically manage signing」をON
3. クリーンビルド: Cmd+Shift+K → Cmd+B
```

### 4. アプリがクラッシュする
```bash
# ログを確認
# Xcode > Window > Devices and Simulators
# デバイスを選択 > View Device Logs
```

## 📝 チェックリスト

実機で確認すべき項目:

### 基本機能
- [ ] アプリの起動
- [ ] スプラッシュ画面の表示
- [ ] オンボーディング画面の動作
- [ ] カメラアクセス（顔型診断）
- [ ] 位置情報アクセス（美容師検索）
- [ ] プッシュ通知の許可
- [ ] ログイン/ログアウト

### パフォーマンス
- [ ] 画面遷移のスムーズさ
- [ ] 画像の読み込み速度
- [ ] タップレスポンス
- [ ] スクロールの滑らかさ

### UI/UX
- [ ] セーフエリアの対応
- [ ] ダークモード対応
- [ ] 横画面の挙動
- [ ] キーボードの表示/非表示

### ネットワーク
- [ ] オフライン時の挙動
- [ ] 3G/4G/5G/WiFiでの動作
- [ ] APIレスポンス速度

## 🚨 注意事項

1. **無料のApple IDの制限**
   - 7日間でアプリが無効になる
   - 同時に3つまでのアプリ
   - 1週間に10個のApp IDまで

2. **本番リリース前に必要なもの**
   - Apple Developer Program（年額$99）
   - App Store用のスクリーンショット
   - プライバシーポリシー
   - アプリ説明文

## 🎯 次のステップ

1. **実機テスト完了後**
   - フィードバックの収集
   - パフォーマンスの最適化
   - バグ修正

2. **TestFlight配布**（要Developer Program）
   ```bash
   # アーカイブ作成
   Product > Archive
   
   # TestFlightにアップロード
   Window > Organizer > Distribute App
   ```

3. **App Store申請準備**
   - アイコン（1024x1024）
   - スクリーンショット（各サイズ）
   - アプリ説明文
   - レビュー用情報

---

問題が発生した場合は、エラーメッセージと共にお知らせください。サポートいたします！