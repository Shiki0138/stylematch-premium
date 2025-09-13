'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: 'AI顔型診断',
      description: '最新のAI技術で5つの顔型タイプを正確に診断',
      icon: '🎯',
    },
    {
      title: 'パーソナルカラー診断',
      description: 'イエベ・ブルベを含む4シーズンカラーを分析',
      icon: '🎨',
    },
    {
      title: '美容師マッチング',
      description: '診断結果に基づいて最適な美容師をご提案',
      icon: '💇',
    },
    {
      title: '簡単予約',
      description: 'アプリ内で美容師の予約まで完結',
      icon: '📅',
    },
  ];

  const steps = [
    {
      number: '1',
      title: '写真をアップロード',
      description: '正面から撮影した写真を1枚用意するだけ',
    },
    {
      number: '2',
      title: 'AI診断',
      description: '顔型とパーソナルカラーを瞬時に分析',
    },
    {
      number: '3',
      title: '美容師を探す',
      description: '診断結果に合った美容師をマッチング',
    },
    {
      number: '4',
      title: '予約する',
      description: 'アプリ内で簡単に予約完了',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              StyleMatch
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8">
              AI美容診断で、あなたに最適な美容師と出会う
            </p>
            <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
              顔型診断とパーソナルカラー診断をAIで行い、
              診断結果に基づいてあなたにぴったりの美容師をマッチング。
              理想のヘアスタイルを実現します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/signup')}
                className="text-lg px-8"
              >
                無料で診断を始める
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/login')}
                className="text-lg px-8"
              >
                ログイン
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            StyleMatchの特徴
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-scale">
                <CardContent className="pt-8">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            かんたん4ステップ
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                    <p className="text-text-secondary">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            今すぐ無料で診断を始めましょう
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            AIによる正確な診断で、あなたに似合うヘアスタイルを見つけてください
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/signup')}
            className="text-lg px-8"
          >
            無料登録して診断開始
          </Button>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">StyleMatch</h3>
              <p className="text-gray-400">
                AI美容診断で理想の美容師と出会う
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">StyleMatchとは</Link></li>
                <li><Link href="/diagnosis" className="hover:text-white transition-colors">AI診断について</Link></li>
                <li><Link href="/stylists" className="hover:text-white transition-colors">美容師を探す</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">ヘルプ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">よくある質問</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">法的情報</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="/law" className="hover:text-white transition-colors">特定商取引法</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StyleMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
