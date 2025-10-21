# App Store Submission Checklist

準備が整ったプロジェクトから App Store Connect へ提出するまでの実務手順をまとめました。Expo（EAS）を利用したビルド／申請を前提にしています。

## 1. 事前確認

- `.env` に `EXPO_PUBLIC_GEMINI_API_KEY` を設定し、Expo の Secrets でも同名キーを登録する。
- `app.json` で `bundleIdentifier`, `usesNonExemptEncryption`, 各種権限文言を最終確認。
- `app.json` / `assets/` のアイコン・スプラッシュが最終デザインか確認。
- `package.json` の `version`、`app.json` の `expo.version` をリリース値へ更新し、`eas.json` で `autoIncrement` が適切か確認。
- `npm install` → `npm run lint` でローカル整合性を再確認。
- 物理デバイスで Expo Go もしくは Development Build を用いて基本動作を確認（カメラ・保存処理など）。

## 2. EAS Build（iOS）

```bash
eas login               # 未ログインの場合
npm install              # 依存更新（初回のみ）
npm run lint             # 静的解析がクリーンか確認
eas build --profile production --platform ios
```

- 初回は iOS ビルド用証明書を EAS が自動生成する。既存証明書を利用する場合は `--clear-credentials` などを適宜使用。
- ビルド後、`eas build:list` で成果物（.ipa）へのリンクを取得し、TestFlight で実機確認。

## 3. EAS Submit（任意）

自動アップロードを行う場合:

```bash
eas submit --profile production --platform ios
```

- `EAS_APPLE_APP_SPECIFIC_PASSWORD` などの App Store Connect 資格情報を事前に設定しておく。
- 自動提出を使わない場合は `.ipa` を手動で Transporter に取り込んでも問題はありません。

## 4. App Store Connect の準備物

- アプリ名 / サブタイトル / プロモーションテキスト
- プライバシーポリシー URL（Expo で配信するなら必須）
- スクリーンショット（6.7" と 5.5" 推奨）
- App Store 用アイコン（1024x1024 PNG）
- カテゴリ、年齢区分、キーワード
- App プライバシー質問票（カメラ利用・写真保存の扱いなど）
- サポート URL・マーケティング URL（任意）

## 5. 審査向け注意点

- 初回起動時にカメラ/フォトライブラリの権限説明が自然なことを確認。
- Gemini API が動作するか（API キー失効時のハンドリング含む）。
- エラー時の fallback メッセージが日本語で適切か確認。
- TestFlight で主要フロー（撮影 → スタイル生成 → 保存）が成功すること。
- テスター／サブスクリプション表現が審査基準に抵触しないかチェック（有料課金がまだなら文言調整を検討）。

## 6. バージョンアップ手順

1. `package.json` と `app.json` の `version` を上げる。
2. `eas build --profile production --platform ios`
3. `eas submit` もしくは Transporter で提出。
4. App Store Connect のメタデータ・スクリーンショット更新。
5. 審査ステータスを追跡、リジェクト時はフィードバックに応じて修正。

## 参考

- [EAS Build iOS ドキュメント](https://docs.expo.dev/build-reference/ios-builds/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Connect ガイド](https://developer.apple.com/app-store-connect/)

---
**Note:** ここに記載の調整は手元の Mac で実行可能な内容です。App Store Connect 上の操作（スクリーンショット登録など）は開発者アカウントで行ってください。
