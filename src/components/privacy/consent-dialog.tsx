'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Info, Lock } from 'lucide-react';

interface ConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentDialog({ open, onAccept, onDecline }: ConsentDialogProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeData, setAgreeData] = useState(false);
  const [agreeStorage, setAgreeStorage] = useState(false);

  const allAgreed = agreeTerms && agreeData && agreeStorage;

  // 同意情報をローカルストレージに保存
  const saveConsent = () => {
    const consentData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      agreements: {
        terms: agreeTerms,
        dataProcessing: agreeData,
        dataStorage: agreeStorage,
      },
      ipAddress: 'stored-on-server', // サーバー側で記録
    };

    localStorage.setItem('privacyConsent', JSON.stringify(consentData));
    
    // サーバーにも送信
    if (typeof window !== 'undefined') {
      fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData),
      }).catch(console.error);
    }
  };

  const handleAccept = () => {
    if (allAgreed) {
      saveConsent();
      onAccept();
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <AlertDialogTitle className="text-xl">
              プライバシーポリシーと利用規約への同意
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            StyleMatchをご利用いただくには、以下の内容にご同意いただく必要があります。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-6">
            {/* 個人情報の取り扱い */}
            <section>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                個人情報の取り扱いについて
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  当サービスでは、AI診断のために以下の情報を取得・処理します：
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>顔写真（顔型診断のため）</li>
                  <li>顔の特徴点データ（23箇所の座標情報）</li>
                  <li>肌の色調データ（パーソナルカラー診断のため）</li>
                  <li>位置情報（近隣の美容師検索のため - オプション）</li>
                </ul>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="font-medium text-blue-900">重要：</p>
                  <ul className="list-disc pl-5 mt-1 text-blue-800">
                    <li>顔写真は診断後、30日間保存され、その後自動的に削除されます</li>
                    <li>特徴点データは統計的に処理され、個人を特定できない形で保存されます</li>
                    <li>第三者への提供は、法令に基づく場合を除き、一切行いません</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* データの利用目的 */}
            <section>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                データの利用目的
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>取得したデータは以下の目的でのみ利用します：</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>AI顔型診断の実行</li>
                  <li>パーソナルカラー診断の実行</li>
                  <li>診断結果に基づく美容師マッチング</li>
                  <li>サービス品質の向上（統計データとして）</li>
                  <li>お問い合わせ対応</li>
                </ol>
              </div>
            </section>

            {/* データの保護 */}
            <section>
              <h3 className="font-semibold text-lg mb-3">データの保護について</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  お客様のデータは以下の方法で保護されています：
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>通信はすべてSSL/TLSで暗号化</li>
                  <li>データベースは暗号化して保存</li>
                  <li>アクセス権限は最小限に制限</li>
                  <li>定期的なセキュリティ監査を実施</li>
                </ul>
              </div>
            </section>

            {/* 権利について */}
            <section>
              <h3 className="font-semibold text-lg mb-3">お客様の権利</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>お客様は以下の権利を有します：</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>データの開示請求</li>
                  <li>データの訂正・削除請求</li>
                  <li>データ処理の停止請求</li>
                  <li>データポータビリティの請求</li>
                </ul>
                <p className="mt-2">
                  これらの権利行使については、support@stylematch.app までご連絡ください。
                </p>
              </div>
            </section>

            {/* Cookie使用について */}
            <section>
              <h3 className="font-semibold text-lg mb-3">Cookie使用について</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  当サービスでは、以下の目的でCookieを使用します：
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>ログイン状態の維持</li>
                  <li>設定の保存</li>
                  <li>利用状況の分析（Google Analytics）</li>
                </ul>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* 同意チェックボックス */}
        <div className="space-y-3 mt-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              利用規約に同意します
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="data"
              checked={agreeData}
              onCheckedChange={(checked) => setAgreeData(checked as boolean)}
            />
            <Label htmlFor="data" className="text-sm cursor-pointer">
              個人情報の取得・処理に同意します
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="storage"
              checked={agreeStorage}
              onCheckedChange={(checked) => setAgreeStorage(checked as boolean)}
            />
            <Label htmlFor="storage" className="text-sm cursor-pointer">
              データの保存・利用に同意します（30日間）
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>
            同意しない
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAccept}
            disabled={!allAgreed}
            className={!allAgreed ? 'opacity-50 cursor-not-allowed' : ''}
          >
            すべてに同意して開始
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}