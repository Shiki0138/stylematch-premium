# StyleMatch iPhoneアプリ実行手順

## 前提条件
- Xcode 14以上がインストールされていること
- Node.js 18以上がインストールされていること
- CocoaPodsがインストールされていること

## 実行手順

### 1. プロジェクトディレクトリに移動
```bash
cd "/Users/MBP/Library/Mobile Documents/com~apple~CloudDocs/Desktop/system/044_診断/stylematch"
```

### 2. 依存関係のインストール（初回のみ）
```bash
npm install
```

### 3. iOSアプリの実行方法

#### 方法A: Xcodeから実行（推奨）
```bash
npm run cap:open:ios
```
- Xcodeが開いたら、シミュレーターを選択して `⌘ + R` で実行

#### 方法B: コマンドラインから実行
```bash
npm run cap:run:ios
```
- シミュレーターのリストが表示されるので、矢印キーで選択
- 推奨: iPhone 16 または iPhone 16 Pro

#### 方法C: ライブリロード開発
```bash
npm run ios:dev
```
- ソースコードの変更が自動的に反映される

### 4. ビルドエラーが発生した場合
```bash
# キャッシュクリア
npm run clean

# 再ビルド
npm run cap:build
```

## よくある問題と解決方法

### エラー: "Could not read package.json"
現在のディレクトリが正しくない。必ず`stylematch`フォルダ内で実行すること。

### エラー: "No such module 'Capacitor'"
```bash
cd ios/App
pod install
```

### シミュレーターが起動しない
1. Xcodeを開く
2. Window > Devices and Simulators
3. 新しいシミュレーターを追加

## モバイルUIへのアクセス
アプリが起動したら、自動的にモバイル用UIが表示されます。
- ホーム画面: `/mobile`
- AI診断: `/mobile/diagnosis`
- 美容師検索: `/mobile/stylists`