import { ReactNode } from 'react';
import { cn } from './utils';

interface GradientBgProps {
  children?: ReactNode;
  className?: string;
  variant?: 'champagne' | 'pearl' | 'taupe' | 'sage' | 'navy';
}

export function GradientBg({ children, className, variant = 'champagne' }: GradientBgProps) {
  const gradients = {
    champagne: 'bg-gradient-to-br from-luxury-pearl via-luxury-ivory to-luxury-champagne/20',
    pearl: 'bg-gradient-to-br from-luxury-ivory via-luxury-pearl to-luxury-warm-gray/10',
    taupe: 'bg-gradient-to-br from-luxury-pearl via-luxury-taupe/20 to-luxury-warm-gray/20',
    sage: 'bg-gradient-to-br from-luxury-pearl via-luxury-sage/10 to-luxury-ivory',
    navy: 'bg-gradient-to-br from-luxury-navy via-luxury-charcoal to-luxury-navy/90'
  };

  return (
    <div className={cn(gradients[variant], className)}>
      {children}
    </div>
  );
}