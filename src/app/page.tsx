'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/firebase/auth-context';
import { PulseButton, HoverSparkle } from '@/components/ui/MicroInteractions';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const isTestMode = process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === 'true';
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const revolutionaryFeatures = [
    {
      title: '3秒AI診断',
      subtitle: '世界最速の美容分析',
      description: '1枚の写真から68ポイント解析。日本人女性に特化した最先端AI技術',
      icon: '⚡',
      gradient: 'from-luxury-champagne to-luxury-rose-gold',
      stats: '精度96.8%'
    },
    {
      title: '16分類パーソナルカラー',
      subtitle: '従来の4倍の精密診断',
      description: '季節変化・肌質まで考慮した日本初の超精密カラー分析システム',
      icon: '🌈',
      gradient: 'from-luxury-sage to-luxury-pearl',
      stats: '16パターン対応'
    },
    {
      title: 'AR試着体験',
      subtitle: 'リアルタイム変身',
      description: 'スマホで即座にヘアスタイル試着。SNS映えする最適角度も提案',
      icon: '✨',
      gradient: 'from-luxury-champagne to-luxury-taupe',
      stats: '200+スタイル'
    },
    {
      title: '運命の美容師マッチ',
      subtitle: '99.2%満足度の出会い',
      description: '技術・性格・美意識まで分析した科学的マッチングシステム',
      icon: '💎',
      gradient: 'from-luxury-navy to-luxury-sage',
      stats: '満足度99.2%'
    },
  ];

  const testimonials = [
    {
      name: '田中 美咲さん',
      age: 25,
      occupation: 'OL',
      comment: '診断結果があまりにも的確で驚きました！今まで似合わないと思っていたカラーが実は運命色だったなんて...',
      before: '自分に似合う色が分からない',
      after: '毎日メイクが楽しい！褒められる回数が3倍に',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: '佐藤 里奈さん',
      age: 29,
      occupation: 'デザイナー',
      comment: '美容師さんとのマッチングが完璧！初回でこんなに意気投合できるなんて思いませんでした',
      before: '美容室選びで失敗続き',
      after: '理想のヘアスタイルに出会えて自信UP',
      avatar: '👩‍🎨',
      rating: 5
    },
    {
      name: '山田 ゆかりさん',
      age: 27,
      occupation: '看護師',
      comment: 'AR試着で色々試せるのが楽しすぎて、友達みんなでハマってます！',
      before: '冒険するのが怖かった',
      after: '新しいスタイルに挑戦する勇気が出た',
      avatar: '👩‍⚕️',
      rating: 5
    }
  ];

  const steps = [
    {
      number: '1',
      title: '3秒セルフィー',
      description: '自然光で1枚撮るだけ。AI が瞬時に68ポイントを解析',
      time: '3秒',
      icon: '📸'
    },
    {
      number: '2',
      title: 'AI美容分析',
      description: '顔型・骨格・肌質・パーソナルカラーを同時に分析',
      time: '30秒',
      icon: '🧠'
    },
    {
      number: '3',
      title: 'AR試着体験',
      description: 'おすすめスタイルをリアルタイムで試着・比較',
      time: '2分',
      icon: '✨'
    },
    {
      number: '4',
      title: '運命の美容師マッチ',
      description: '相性99%以上の美容師を厳選して紹介',
      time: '1分',
      icon: '💕'
    },
  ];

  const handleStartDiagnosis = () => {
    // 感動的なトランジション効果（将来実装）
    router.push(isTestMode || currentUser ? '/diagnosis' : '/signup');
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* 革命的ヒーローセクション */}
      <section className="relative min-h-screen bg-gradient-to-br from-luxury-navy via-luxury-charcoal to-luxury-rose-gold">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-32">
          <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-6">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm rounded-full mb-4">
                🎉 日本初！次世代美容AI 
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
              <span className="block bg-gradient-to-r from-white via-luxury-pearl to-luxury-champagne bg-clip-text text-transparent">
                あなたの
              </span>
              <span className="block bg-gradient-to-r from-luxury-champagne via-luxury-rose-gold to-luxury-taupe bg-clip-text text-transparent">
                美しさを
              </span>
              <span className="block bg-gradient-to-r from-luxury-sage via-luxury-pearl to-luxury-champagne bg-clip-text text-transparent">
                科学する
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed">
              たった3秒で、あなたの理想の美しさを実現する
            </p>
            <p className="text-lg md:text-xl text-white/75 mb-12 max-w-2xl mx-auto">
              20〜30代女性が選ぶ美容アプリ No.1 ⭐⭐⭐⭐⭐ (4.9/5.0)
            </p>
            
            {/* 感動的なCTAボタン */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <PulseButton
                onClick={handleStartDiagnosis}
                variant="primary"
                className="text-xl px-12 py-6"
              >
                ✨ 3秒で美容診断を始める
              </PulseButton>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xl px-8 py-6 rounded-full border-2 border-white text-white hover:bg-white hover:text-luxury-navy transition-all duration-300"
              >
                機能を見る 👀
              </Button>
            </div>
            
            {/* リアルタイム統計 */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">98,234</div>
                <div className="text-white/75 text-sm">診断完了数</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.9★</div>
                <div className="text-white/75 text-sm">ユーザー満足度</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">2,847</div>
                <div className="text-white/75 text-sm">提携美容師数</div>
              </div>
            </div>
          </div>
        </div>

        {/* 浮遊するアニメーション要素 */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-luxury-champagne to-luxury-rose-gold rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-16 w-16 h-16 bg-gradient-to-r from-luxury-sage to-luxury-pearl rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-gradient-to-r from-luxury-champagne to-luxury-taupe rounded-full opacity-25 animate-bounce delay-1000"></div>
      </section>

      {/* 革新的機能セクション */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-luxury-navy to-luxury-rose-gold bg-clip-text text-transparent">
              なぜ98%の女性が感動するのか
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              従来の美容診断を遥かに超える、革命的な4つの技術をご体験ください
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {revolutionaryFeatures.map((feature, index) => (
              <HoverSparkle key={index}>
                <Card className={`group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br ${feature.gradient} text-white relative`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-500"></div>
                <CardContent className="relative z-10 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-6xl mb-4">{feature.icon}</div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      {feature.stats}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-lg font-semibold mb-4 text-white/90">{feature.subtitle}</p>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </CardContent>
                </Card>
              </HoverSparkle>
            ))}
          </div>
        </div>
      </section>

      {/* 感動の使い方セクション */}
      <section className="py-24 bg-gradient-to-br from-luxury-pearl to-luxury-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              たった<span className="text-luxury-navy">5分</span>で人生が変わる
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              美容のプロが監修した科学的診断フローで、確実にあなたの魅力を引き出します
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-luxury-champagne to-luxury-rose-gold text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <div className="text-sm font-semibold text-luxury-navy mb-2">{step.time}</div>
                    <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* リアル体験談セクション */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              実際の<span className="text-luxury-rose-gold">変身ストーリー</span>
            </h2>
            <p className="text-xl text-gray-600">
              20〜30代女性のリアルな声をお聞きください
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-luxury-pearl to-luxury-ivory">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-r from-luxury-champagne to-luxury-rose-gold rounded-full flex items-center justify-center text-4xl">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">⭐</span>
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl font-medium text-gray-800 mb-6 leading-relaxed">
                      "{testimonials[currentTestimonial].comment}"
                    </blockquote>
                    <div className="mb-6">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="font-semibold text-red-600 mb-1">Before</div>
                          <div className="text-gray-700">{testimonials[currentTestimonial].before}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-600 mb-1">After</div>
                          <div className="text-gray-700">{testimonials[currentTestimonial].after}</div>
                        </div>
                      </div>
                    </div>
                    <footer className="text-gray-600">
                      <strong>{testimonials[currentTestimonial].name}</strong> 
                      ({testimonials[currentTestimonial].age}歳・{testimonials[currentTestimonial].occupation})
                    </footer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 体験談ナビゲーション */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-luxury-champagne w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 最終CTA（感動的） */}
      <section className="py-24 bg-gradient-to-r from-luxury-navy via-luxury-charcoal to-luxury-rose-gold text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            あなたの美しさの
            <br />
            <span className="bg-gradient-to-r from-luxury-champagne to-luxury-pearl bg-clip-text text-transparent">
              新しい章
            </span>
            が始まる
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 leading-relaxed">
            98,234人の女性が体験した感動を、今すぐあなたも
          </p>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm">
              <span className="text-yellow-400">🎁</span>
              <span className="font-semibold">今なら診断無料 + 初回カウンセリング50%OFF</span>
            </div>
          </div>
          <PulseButton
            onClick={handleStartDiagnosis}
            variant="magical"
            className="text-2xl px-16 py-8 font-bold"
          >
            ✨ 今すぐ無料で始める
          </PulseButton>
          <p className="text-sm text-white/60 mt-6">
            * クレジットカード不要 * 3分で完了 * 満足度保証
          </p>
        </div>

        {/* アニメーション要素 */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-luxury-champagne/30 to-luxury-rose-gold/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-luxury-champagne/30 to-luxury-taupe/30 rounded-full animate-pulse"></div>
      </section>

      {/* プレミアムフッター */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-luxury-champagne to-luxury-rose-gold bg-clip-text text-transparent">
                StyleMatch Premium
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                AI美容診断で理想の美容師と出会う、日本初の次世代美容プラットフォーム
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-2xl hover:text-luxury-champagne transition-colors">📱</a>
                <a href="#" className="text-2xl hover:text-luxury-champagne transition-colors">🐦</a>
                <a href="#" className="text-2xl hover:text-luxury-champagne transition-colors">📸</a>
                <a href="#" className="text-2xl hover:text-luxury-champagne transition-colors">📺</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">サービス</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">StyleMatchとは</Link></li>
                <li><Link href="/diagnosis" className="hover:text-white transition-colors">AI診断について</Link></li>
                <li><Link href="/stylists" className="hover:text-white transition-colors">美容師を探す</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">料金プラン</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">サポート</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">ヘルプセンター</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">よくある質問</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">美容ブログ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 StyleMatch Premium. All rights reserved. 
              <span className="mx-2">|</span>
              <Link href="/terms" className="hover:text-white transition-colors">利用規約</Link>
              <span className="mx-2">|</span>
              <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}