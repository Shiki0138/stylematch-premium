import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientBgProps {
  children?: ReactNode;
  className?: string;
  variant?: 'rose' | 'lavender' | 'coral' | 'soft';
}

export function GradientBg({ children, className, variant = 'rose' }: GradientBgProps) {
  const gradients = {
    rose: 'bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200',
    lavender: 'bg-gradient-to-br from-purple-100 via-violet-50 to-purple-200',
    coral: 'bg-gradient-to-br from-orange-100 via-red-50 to-orange-200',
    soft: 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
  };

  return (
    <div className={cn(gradients[variant], className)}>
      {children}
    </div>
  );
}