/**
 * StyleMatchアプリ テストフィードバック用 Googleフォーム自動作成スクリプト
 * 
 * 使用方法:
 * 1. Google Apps Script (script.google.com) で新しいプロジェクトを作成
 * 2. このコードを貼り付け
 * 3. 実行してフォームを自動作成
 */

function createStyleMatchFeedbackForm() {
  try {
    // フォームを作成
    const form = FormApp.create('StyleMatch アプリ テストフィードバック');
    
    // フォームの説明を設定
    form.setDescription(`
🎨 StyleMatchアプリのテストにご協力いただき、ありがとうございます！

アプリをお試しいただいた感想やご意見をお聞かせください。
回答時間の目安: 約3-5分

【テスト内容】
✓ 写真撮影 → 性別選択 → 髪型スタイル選択 → AI編集結果の確認
✓ 設定メニューの確認
✓ 全体的な操作性の確認

皆様のフィードバックは今後の改善に活用させていただきます。
    `);

    // 1. 基本情報セクション
    form.addSectionHeaderItem()
        .setTitle('📱 基本情報')
        .setHelpText('まずは基本的な情報をお聞かせください');

    // テスター名（任意）
    form.addTextItem()
        .setTitle('お名前（任意）')
        .setHelpText('匿名でも結構です')
        .setRequired(false);

    // 使用デバイス
    form.addMultipleChoiceItem()
        .setTitle('使用したデバイス')
        .setChoiceValues(['iPhone', 'Android', 'その他'])
        .setRequired(true);

    // テスト完了確認
    form.addMultipleChoiceItem()
        .setTitle('アプリのテストを最後まで完了できましたか？')
        .setChoiceValues([
          'はい、問題なく最後まで完了した',
          'ほぼ完了したが、一部問題があった', 
          '途中でエラーや問題が発生した',
          'アプリが起動しなかった'
        ])
        .setRequired(true);

    // 2. 操作性・UI評価セクション
    form.addSectionHeaderItem()
        .setTitle('🎯 操作性・ユーザビリティ評価')
        .setHelpText('アプリの使いやすさについて評価してください');

    // 全体的な操作の分かりやすさ
    form.addScaleItem()
        .setTitle('全体的な操作の分かりやすさ')
        .setHelpText('1: 非常に分かりにくい ← → 5: 非常に分かりやすい')
        .setBounds(1, 5)
        .setRequired(true);

    // 画面レイアウト・デザイン
    form.addScaleItem()
        .setTitle('画面レイアウト・デザインの評価')
        .setHelpText('1: 非常に悪い ← → 5: 非常に良い')
        .setBounds(1, 5)
        .setRequired(true);

    // ボタン・メニューの見つけやすさ
    form.addScaleItem()
        .setTitle('必要なボタンやメニューの見つけやすさ')
        .setHelpText('1: 非常に見つけにくい ← → 5: 非常に見つけやすい')
        .setBounds(1, 5)
        .setRequired(true);

    // スマホ画面への適合度
    form.addScaleItem()
        .setTitle('スマートフォン画面への適合度')
        .setHelpText('1: 画面からはみ出る ← → 5: ぴったりフィット')
        .setBounds(1, 5)
        .setRequired(true);

    // 3. 機能評価セクション
    form.addSectionHeaderItem()
        .setTitle('⚙️ 機能評価')
        .setHelpText('各機能について評価してください');

    // 写真撮影機能
    form.addScaleItem()
        .setTitle('写真撮影機能の使いやすさ')
        .setHelpText('1: 非常に使いにくい ← → 5: 非常に使いやすい')
        .setBounds(1, 5)
        .setRequired(true);

    // 性別・スタイル選択
    form.addScaleItem()
        .setTitle('性別・髪型スタイル選択の分かりやすさ')
        .setHelpText('1: 非常に分かりにくい ← → 5: 非常に分かりやすい')
        .setBounds(1, 5)
        .setRequired(true);

    // AI画像生成結果
    form.addScaleItem()
        .setTitle('AI髪型編集結果の品質')
        .setHelpText('1: 非常に悪い ← → 5: 非常に良い')
        .setBounds(1, 5)
        .setRequired(true);

    // 画像表示速度
    form.addScaleItem()
        .setTitle('画像生成・表示速度')
        .setHelpText('1: 非常に遅い ← → 5: 非常に速い')
        .setBounds(1, 5)
        .setRequired(true);

    // 設定メニュー
    form.addScaleItem()
        .setTitle('設定メニューの使いやすさ')
        .setHelpText('1: 非常に使いにくい ← → 5: 非常に使いやすい')
        .setBounds(1, 5)
        .setRequired(false);

    // 4. 問題・エラー報告セクション
    form.addSectionHeaderItem()
        .setTitle('🚨 問題・エラー報告')
        .setHelpText('発生した問題やエラーがあれば教えてください');

    // 発生した問題
    form.addCheckboxItem()
        .setTitle('テスト中に発生した問題（複数選択可）')
        .setChoiceValues([
          'アプリが起動しない',
          'カメラが動作しない',
          '写真が撮影できない',
          '画像が表示されない',
          'AI編集が動作しない',
          '画面が崩れている',
          'ボタンが押せない',
          'アプリが重い・遅い',
          'その他',
          '特に問題なし'
        ])
        .setRequired(false);

    // 具体的な問題内容
    form.addParagraphTextItem()
        .setTitle('発生した問題の詳細（任意）')
        .setHelpText('上記で選択した問題について、具体的な状況や手順があれば教えてください')
        .setRequired(false);

    // 5. 改善提案セクション
    form.addSectionHeaderItem()
        .setTitle('💡 改善提案・要望')
        .setHelpText('アプリをより良くするためのご提案をお聞かせください');

    // 追加してほしい機能
    form.addCheckboxItem()
        .setTitle('追加してほしい機能（複数選択可）')
        .setChoiceValues([
          'より多くの髪型バリエーション',
          'ヘアカラーの種類を増やす',
          'メイクアップ機能',
          'ビフォーアフター比較機能',
          'SNSシェア機能',
          'お気に入り保存機能',
          '美容室検索・予約機能',
          'AR（拡張現実）での試着',
          'その他',
          '特になし'
        ])
        .setRequired(false);

    // 自由記述での改善提案
    form.addParagraphTextItem()
        .setTitle('改善提案・要望（自由記述）')
        .setHelpText('アプリに対するご意見、改善点、要望など、何でもお聞かせください')
        .setRequired(false);

    // 6. 総合評価セクション
    form.addSectionHeaderItem()
        .setTitle('⭐ 総合評価')
        .setHelpText('アプリ全体についての評価をお聞かせください');

    // 総合満足度
    form.addScaleItem()
        .setTitle('アプリ全体の満足度')
        .setHelpText('1: 非常に不満 ← → 5: 非常に満足')
        .setBounds(1, 5)
        .setRequired(true);

    // 実用性
    form.addMultipleChoiceItem()
        .setTitle('実際にこのアプリを使ってみたいと思いますか？')
        .setChoiceValues([
          'ぜひ使いたい',
          '機能改善されれば使いたい',
          'どちらとも言えない', 
          'あまり使いたくない',
          '全く使いたくない'
        ])
        .setRequired(true);

    // 他人への推奨度
    form.addScaleItem()
        .setTitle('このアプリを他の人に勧める可能性')
        .setHelpText('1: 絶対に勧めない ← → 5: 積極的に勧める')
        .setBounds(1, 5)
        .setRequired(true);

    // 最終コメント
    form.addParagraphTextItem()
        .setTitle('最後に一言（任意）')
        .setHelpText('アプリの印象、開発者へのメッセージなど、何でもお聞かせください')
        .setRequired(false);

    // フォームの設定
    form.setAcceptingResponses(true)
        .setAllowResponseEdits(true)
        .setCollectEmail(false)
        .setShowLinkToRespondAgain(false);

    // 完了メッセージを設定
    form.setConfirmationMessage(`
🎉 フィードバックの送信が完了しました！

StyleMatchアプリのテストにご協力いただき、誠にありがとうございました。
いただいたご意見は今後の開発・改善に活用させていただきます。

引き続きアプリ開発の進捗にご注目ください！

開発チーム一同
    `);

    // フォームのURLを取得して表示
    const formUrl = form.getPublishedUrl();
    const editUrl = form.getEditUrl();
    
    console.log('✅ StyleMatchテストフィードバックフォームが作成されました！');
    console.log('');
    console.log('📋 フォームURL（テスターに送信）:');
    console.log(formUrl);
    console.log('');
    console.log('⚙️ 編集URL（あなた専用）:');
    console.log(editUrl);
    console.log('');
    console.log('📊 回答の確認:');
    console.log('Googleフォーム → 回答 → スプレッドシートを作成 で結果をExcelで確認できます');

    return {
      formUrl: formUrl,
      editUrl: editUrl,
      formId: form.getId()
    };

  } catch (error) {
    console.error('❌ フォーム作成エラー:', error);
    throw error;
  }
}

/**
 * フォーム作成の実行
 * Google Apps Scriptでこの関数を実行してください
 */
function main() {
  const result = createStyleMatchFeedbackForm();
  
  // 結果をスプレッドシートにも記録（オプション）
  try {
    const sheet = SpreadsheetApp.create('StyleMatch フォーム管理');
    const range = sheet.getActiveRange();
    range.getSheet().getRange(1, 1, 3, 2).setValues([
      ['項目', 'URL'],
      ['フォームURL', result.formUrl],
      ['編集URL', result.editUrl]
    ]);
    
    console.log('📝 管理用スプレッドシートも作成しました');
    console.log('スプレッドシートURL:', sheet.getUrl());
  } catch (sheetError) {
    console.log('⚠️ スプレッドシート作成はスキップされました');
  }
}