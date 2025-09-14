import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn(
      "mx-auto max-w-md bg-white min-h-screen relative",
      className
    )}>
      {children}
    </div>
  );
}