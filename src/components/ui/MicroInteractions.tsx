'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface FloatingHeartProps {
  x: number;
  y: number;
  id: number;
  onComplete: (id: number) => void;
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({ x, y, id, onComplete }) => {
  return (
    <motion.div
      initial={{ 
        x, 
        y, 
        scale: 0.5, 
        opacity: 1,
        rotate: 0
      }}
      animate={{ 
        y: y - 100, 
        scale: [0.5, 1.2, 0.8], 
        opacity: [1, 0.8, 0],
        rotate: [0, 15, -10, 0]
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ 
        duration: 1.5, 
        ease: "easeOut",
        scale: { times: [0, 0.3, 1], duration: 0.6 }
      }}
      onAnimationComplete={() => onComplete(id)}
      className="absolute pointer-events-none z-50"
      style={{ fontSize: '2rem' }}
    >
      💕
    </motion.div>
  );
};

interface PulseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'magical';
}

export const PulseButton: React.FC<PulseButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'primary'
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [heartId, setHeartId] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const removeHeart = (id: number) => {
    setHearts(prev => prev.filter(heart => heart.id !== id));
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // ハートエフェクトを追加
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const newHeart = {
        id: heartId,
        x: e.clientX - rect.left - 16,
        y: e.clientY - rect.top - 16
      };
      setHearts(prev => [...prev, newHeart]);
      setHeartId(prev => prev + 1);
    }

    // ボタン押下エフェクト
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    onClick?.();
    
    // バイブレーション（対応デバイスのみ）
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-luxury-champagne to-luxury-rose-gold text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-luxury-navy to-luxury-charcoal text-white shadow-lg hover:shadow-xl',
    magical: 'bg-gradient-to-r from-luxury-champagne to-luxury-taupe text-luxury-charcoal shadow-2xl hover:shadow-3xl'
  };

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isPressed ? 0.95 : 1,
          boxShadow: isPressed 
            ? "0 5px 15px rgba(0,0,0,0.2)" 
            : "0 10px 30px rgba(0,0,0,0.3)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative overflow-hidden px-8 py-4 rounded-full font-bold text-lg
          transform transition-all duration-200 ease-out
          ${variantStyles[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        <motion.div
          animate={isPressed ? { scale: 1.5, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {children}
        </motion.div>
        
        {/* リップル効果 */}
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={isPressed ? { scale: 4, opacity: 0 } : { scale: 0, opacity: 0.5 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-full bg-white pointer-events-none"
        />
      </motion.button>
      
      {/* フローティングハート */}
      <AnimatePresence>
        {hearts.map(heart => (
          <FloatingHeart
            key={heart.id}
            id={heart.id}
            x={heart.x}
            y={heart.y}
            onComplete={removeHeart}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  className = ''
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);
  
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  const handleDragEnd = () => {
    const currentX = x.get();
    
    if (currentX < -100) {
      setDirection('left');
      onSwipeLeft?.();
    } else if (currentX > 100) {
      setDirection('right');
      onSwipeRight?.();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -300, right: 300 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      whileDrag={{ 
        scale: 1.05,
        zIndex: 50,
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
      }}
      className={`
        relative cursor-grab active:cursor-grabbing
        transform-gpu will-change-transform
        ${className}
      `}
    >
      {children}
      
      {/* スワイプインジケーター */}
      <motion.div
        animate={{
          opacity: Math.abs(x.get()) > 50 ? 1 : 0,
          scale: Math.abs(x.get()) > 50 ? 1.2 : 1
        }}
        className="absolute top-4 left-4 text-4xl pointer-events-none"
      >
        {direction === 'left' ? '❌' : direction === 'right' ? '❤️' : ''}
      </motion.div>
    </motion.div>
  );
};

interface MagicalLoadingProps {
  isLoading: boolean;
  message?: string;
}

export const MagicalLoading: React.FC<MagicalLoadingProps> = ({ 
  isLoading, 
  message = "AIが魔法をかけています..." 
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number }>>([]);
  
  useEffect(() => {
    if (isLoading) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: i * 0.1
      }));
      setParticles(newParticles);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        {/* 魔法の粒子エフェクト */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-luxury-champagne to-luxury-rose-gold"
              style={{
                left: `${50 + 40 * Math.cos(particle.id * 30 * Math.PI / 180)}%`,
                top: `${50 + 40 * Math.sin(particle.id * 30 * Math.PI / 180)}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* 中央のクリスタル */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
          >
            💎
          </motion.div>
        </div>
        
        {/* メッセージ */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-xl font-semibold mb-4"
        >
          {message}
        </motion.p>
        
        {/* プログレスバー */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="h-full w-1/3 bg-gradient-to-r from-luxury-champagne to-luxury-rose-gold rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

interface HoverSparkleProps {
  children: React.ReactNode;
  className?: string;
}

export const HoverSparkle: React.FC<HoverSparkleProps> = ({ children, className = '' }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [sparkleId, setSparkleId] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newSparkle = {
      id: sparkleId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setSparkles(prev => [...prev.slice(-5), newSparkle]);
    setSparkleId(prev => prev + 1);
  };

  const removeSparkle = (id: number) => {
    setSparkles(prev => prev.filter(sparkle => sparkle.id !== id));
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
    >
      {children}
      
      {/* キラキラエフェクト */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            initial={{ 
              scale: 0, 
              opacity: 1,
              x: sparkle.x,
              y: sparkle.y
            }}
            animate={{ 
              scale: [0, 1.5, 0], 
              opacity: [1, 0.8, 0],
              rotate: [0, 180]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onAnimationComplete={() => removeSparkle(sparkle.id)}
            className="absolute pointer-events-none text-yellow-400"
            style={{ fontSize: '1rem' }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

interface SuccessConfettiProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const SuccessConfetti: React.FC<SuccessConfettiProps> = ({ isVisible, onComplete }) => {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ['#D4AF37', '#B76E79', '#87A96B', '#1F2F56', '#B8A99A'][i % 5],
    delay: Math.random() * 0.5,
    x: Math.random() * 100,
    rotation: Math.random() * 360
  }));

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-40"
      onAnimationComplete={onComplete}
    >
      {confettiPieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{
            y: -10,
            x: `${piece.x}vw`,
            rotation: piece.rotation,
            scale: 0
          }}
          animate={{
            y: '100vh',
            rotation: piece.rotation + 360,
            scale: [0, 1, 0.8]
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </motion.div>
  );
};

export default {
  PulseButton,
  SwipeableCard,
  MagicalLoading,
  HoverSparkle,
  SuccessConfetti
};