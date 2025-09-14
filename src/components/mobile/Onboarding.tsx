'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GradientBg } from './GradientBg';
import { SparkleButton } from './SparkleButton';
import { ChevronLeft, ChevronRight, Camera, Users, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    icon: Camera,
    title: 'AI顔型診断',
    subtitle: 'あなたの顔型を科学的に分析',
    description: '最新のAI技術であなたの顔型を正確に診断。日本人女性に特化した分析で、より精密な結果をお届けします。',
    color: 'rose' as const
  },
  {
    id: 2,
    icon: Users,
    title: '最適な美容師マッチング',
    subtitle: '相性の良い美容師を見つける',
    description: '顔型とパーソナルカラー分析に基づいて、あなたにぴったりの美容師をマッチング。失敗しないサロン選びを実現します。',
    color: 'lavender' as const
  },
  {
    id: 3,
    icon: Sparkles,
    title: 'パーソナライズされた提案',
    subtitle: 'あなただけの美容体験',
    description: '診断結果に基づいたヘアスタイル提案と、専門知識を持つ美容師による個別カウンセリング。',
    color: 'coral' as const
  },
  {
    id: 4,
    icon: MapPin,
    title: '簡単予約システム',
    subtitle: 'スムーズな予約体験',
    description: 'リアルタイム空き状況確認と3ステップで完了する簡単予約。あなたの理想の美容体験が始まります。',
    color: 'soft' as const
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <GradientBg variant={currentSlideData.color} className="min-h-screen relative overflow-hidden">
      <div className="flex flex-col min-h-screen">
        {/* Header with skip button */}
        <div className="flex justify-between items-center p-6 pt-12 safe-top">
          {currentSlide > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrev}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1" />
          <Button 
            variant="ghost" 
            onClick={onComplete}
            className="text-gray-500 hover:text-gray-700"
          >
            スキップ
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-8 max-w-sm"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-xl"
              >
                <currentSlideData.icon className="w-12 h-12 text-pink-500" />
              </motion.div>

              {/* Title and subtitle */}
              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  {currentSlideData.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-pink-600 font-medium"
                >
                  {currentSlideData.subtitle}
                </motion.p>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 leading-relaxed text-sm"
              >
                {currentSlideData.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div className="p-8 space-y-6 safe-bottom">
          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-pink-500 w-6' 
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <SparkleButton
            onClick={handleNext}
            className="w-full py-4 text-lg"
            variant="primary"
            size="lg"
          >
            {currentSlide === slides.length - 1 ? '始める' : '次へ'}
          </SparkleButton>
        </div>
      </div>
    </GradientBg>
  );
}