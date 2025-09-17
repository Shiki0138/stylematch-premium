'use client';

import { cn } from './utils';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className="relative">
        <div className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-luxury-champagne',
          sizeClasses[size]
        )} />
        <Sparkles className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-luxury-champagne animate-pulse',
          size === 'sm' && 'w-2 h-2',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-6 h-6'
        )} />
      </div>
      {text && (
        <p className={cn(
          'text-gray-600 animate-pulse',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {text}
        </p>
      )}
    </div>
  );
}