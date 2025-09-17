import { ReactNode } from 'react';
import { cn } from './utils';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn(
      "mx-auto max-w-sm bg-white min-h-screen relative overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
}