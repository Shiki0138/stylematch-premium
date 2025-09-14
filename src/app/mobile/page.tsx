'use client';

import { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { SplashScreen } from '@/components/mobile/SplashScreen';
import { Onboarding } from '@/components/mobile/Onboarding';
import { GradientBg } from '@/components/mobile/GradientBg';
import { SparkleButton } from '@/components/mobile/SparkleButton';
import { useRouter } from 'next/navigation';
import { Camera, Users, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileAppPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && !showSplash) {
      setShowOnboarding(true);
    }
  }, [showSplash]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const features = [
    {
      icon: Camera,
      title: 'AI診断を開始',
      description: '顔型を分析してあなたに似合うスタイルを発見',
      path: '/mobile/diagnosis',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Users,
      title: '美容師を探す',
      description: 'あなたにぴったりの美容師を見つけよう',
      path: '/mobile/stylists',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Calendar,
      title: '予約管理',
      description: '予約状況を確認・管理',
      path: '/mobile/dashboard',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: User,
      title: 'マイページ',
      description: 'プロフィールと診断履歴',
      path: '/mobile/dashboard',
      color: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <MobileContainer>
      <GradientBg variant="soft" className="min-h-screen flex flex-col">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Header with safe area */}
          <div className="pt-safe pb-6 px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              こんにちは！
            </h1>
            <p className="text-base text-gray-600">
              今日はどんなスタイルにしますか？
            </p>
          </motion.div>
          </div>

          {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-6 mb-8"
        >
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 shadow-xl text-white">
            <h2 className="text-2xl font-bold mb-2">AI診断でスタイル発見</h2>
            <p className="text-base opacity-90 mb-4">
              わずか30秒で、あなたの顔型を分析
            </p>
            <SparkleButton
              onClick={() => router.push('/mobile/diagnosis')}
              className="w-full"
              variant="primary"
            >
              診断を始める
            </SparkleButton>
          </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="px-6 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.title}
                  onClick={() => router.push(feature.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-left touch-feedback active:scale-95"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-base mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {feature.description}
                  </p>
                </motion.button>
              );
            })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation with safe area */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-around pt-2 pb-safe">
              <button 
                onClick={() => router.push('/mobile/diagnosis')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-pink-500 touch-feedback active:bg-pink-50 rounded-lg transition-colors"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">診断</span>
              </button>
              <button 
                onClick={() => router.push('/mobile/stylists')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-gray-400 touch-feedback active:bg-gray-50 rounded-lg transition-colors"
              >
                <Users className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">美容師</span>
              </button>
              <button 
                onClick={() => router.push('/mobile/dashboard')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-gray-400 touch-feedback active:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">予約</span>
              </button>
              <button 
                onClick={() => router.push('/mobile/dashboard')}
                className="flex flex-col items-center p-3 min-w-[80px] min-h-[60px] text-gray-400 touch-feedback active:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">マイページ</span>
              </button>
            </div>
          </div>
        </div>
      </GradientBg>
    </MobileContainer>
  );
}