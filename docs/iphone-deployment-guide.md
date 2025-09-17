# iPhone実機確認ガイド

## 1. 開発サーバーでの確認（推奨）

### 手順：

1. **開発サーバーが起動していることを確認**
   ```bash
   # 現在のディレクトリで実行
   npm run dev
   ```
   サーバーが http://localhost:3003 で起動します

2. **MacとiPhoneが同じWi-Fiネットワークに接続されていることを確認**

3. **MacのIPアドレスを確認**
   ```bash
   # ターミナルで実行
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   例: 192.168.1.100

4. **iPhoneのSafariで以下のURLにアクセス**
   ```
   http://[MacのIPアドレス]:3003
   ```
   例: http://192.168.1.100:3003

## 2. Capacitorアプリとしての実機確認

### 前提条件：
- Xcode 14以上がインストール済み
- Apple Developer アカウント（無料版でも可）
- iOS 13以上のiPhone

### 手順：

1. **Capacitorの同期**
   ```bash
   npm run build
   npx cap sync ios
   ```

2. **Xcodeでプロジェクトを開く**
   ```bash
   npx cap open ios
   ```

3. **Xcodeでの設定**
   - 左のナビゲーターで「App」を選択
   - 「Signing & Capabilities」タブを開く
   - 「Team」でApple Developer アカウントを選択
   - 「Bundle Identifier」を一意のものに変更（例: com.yourname.stylematch）

4. **iPhoneをMacに接続**
   - iPhoneをUSBケーブルでMacに接続
   - iPhoneで「このコンピュータを信頼」を選択

5. **実機を選択**
   - Xcodeの上部のデバイス選択で、接続したiPhoneを選択

6. **ビルドと実行**
   - ▶️ ボタンをクリックしてビルドを開始
   - 初回は「Developer Mode」を有効にする必要があります：
     - iPhone: 設定 > プライバシーとセキュリティ > デベロッパモード > ON

7. **信頼設定（初回のみ）**
   - iPhone: 設定 > 一般 > VPNとデバイス管理
   - 開発者APPで自分のアカウントを選択し「信頼」

## 3. トラブルシューティング

### 開発サーバーに接続できない場合：
1. ファイアウォール設定を確認
2. ポート3003が開いているか確認
3. 両デバイスが同じネットワークにあるか確認

### Xcodeエラーの場合：
1. **「Signing」エラー**: Apple IDでサインインし、Teamを選択
2. **「Bundle Identifier」エラー**: ユニークなIDに変更
3. **「iOS Version」エラー**: Deployment Targetを下げる

### カメラが動作しない場合：
1. Info.plistにカメラ権限が設定されているか確認
2. iPhoneの設定でアプリにカメラ権限を許可

## 4. 推奨される確認項目

- [ ] トップページの表示とスクロール
- [ ] 診断機能の動作（カメラ起動）
- [ ] ボタンのタップ反応
- [ ] 画面遷移のスムーズさ
- [ ] テキストの可読性
- [ ] 色の表示（高級感が伝わるか）
- [ ] レスポンシブデザインの確認

## 5. デバッグ方法

### Safari開発者ツール：
1. iPhone: 設定 > Safari > 詳細 > Webインスペクタ ON
2. Mac: Safari > 環境設定 > 詳細 > 「メニューバーに開発メニューを表示」
3. Mac Safari: 開発 > [iPhoneの名前] > [サイト名]

これでMacのSafariからiPhoneのWebページをデバッグできます。