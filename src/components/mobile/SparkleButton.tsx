'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface SparkleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export function SparkleButton({ 
  children, 
  onClick, 
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false
}: SparkleButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 300);
      onClick?.();
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden transition-all duration-300 transform touch-feedback',
          variant === 'primary' && 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg',
          variant === 'secondary' && 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg',
          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'md' && 'px-6 py-3',
          size === 'lg' && 'px-8 py-4 text-lg',
          isPressed && 'scale-95',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <span className="animate-pulse">処理中...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </>
          ) : (
            <>
              {children}
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </span>
        
        {/* Sparkle effect */}
        {isPressed && !disabled && !loading && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full animate-ping -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-100" />
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-200" />
          </div>
        )}
      </Button>
    </div>
  );
}