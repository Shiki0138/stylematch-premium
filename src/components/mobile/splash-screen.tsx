'use client';

import { useEffect, useState } from 'react';
import { GradientBg } from '../ui/gradient-bg';
import { Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <GradientBg variant="rose" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-300"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              rotate: 360
            }}
            transition={{ 
              duration: 3, 
              delay: i * 0.2, 
              repeat: Infinity,
              repeatDelay: 1
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-6 z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <div className="relative">
              <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
              <Sparkles className="w-6 h-6 text-rose-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            StyleMatch
          </h1>
          <p className="text-gray-600 text-lg">あなたらしい美しさを見つけよう</p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed"
        >
          AI顔型診断で、あなたにぴったりの美容師を見つけます
        </motion.p>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center space-x-2 mt-8"
          >
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </motion.div>
        )}
      </div>
    </GradientBg>
  );
}