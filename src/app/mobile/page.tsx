'use client';

import { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/ui/mobile-container';
import { SplashScreen } from '@/components/mobile/splash-screen';
import { Onboarding } from '@/components/mobile/onboarding';
import { GradientBg } from '@/components/ui/gradient-bg';
import { SparkleButton } from '@/components/ui/sparkle-button';
import { useRouter } from 'next/navigation';
import { Camera, Users, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 pt-safe pb-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">こんにちは！</h1>
              <p className="text-pink-100 text-sm">今日も素敵な一日を</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="px-4 py-6 space-y-6">
            {/* Main CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    AI顔型診断を始めよう
                  </h2>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    最新のAI技術であなたの顔型を診断し、最適な美容師をマッチング
                  </p>
                  <SparkleButton 
                    onClick={() => router.push('/mobile/diagnosis')}
                    size="lg"
                    className="w-full"
                  >
                    診断スタート
                  </SparkleButton>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <Button
                variant="outline"
                onClick={() => router.push('/mobile/stylists')}
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-pink-50 hover:border-pink-200"
              >
                <Users className="w-6 h-6 text-pink-500" />
                <span className="text-sm">美容師を探す</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/mobile/dashboard')}
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
              >
                <Calendar className="w-6 h-6 text-purple-500" />
                <span className="text-sm">予約確認</span>
              </Button>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    <Card 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(feature.path)}
                    >
                      <CardContent className="p-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-base mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
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
      </div>
    </MobileContainer>
  );
}