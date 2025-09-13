import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  as?: 'button' | 'span';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  as = 'button',
  ...props
}) => {
  const baseStyles = 'font-bold rounded-3xl transition-base focus-ring inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 disabled:bg-gray-300',
    secondary: 'bg-secondary text-white hover:bg-secondary-600 disabled:bg-gray-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:border-gray-300 disabled:text-gray-400',
    ghost: 'text-primary hover:bg-primary/10 disabled:text-gray-400',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  const Component = as;
  
  const elementProps = as === 'button' 
    ? { ...props, disabled: disabled || loading }
    : { ...props, role: 'button', tabIndex: disabled || loading ? -1 : 0 };

  return (
    <Component
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (loading || disabled) && 'cursor-not-allowed opacity-70',
        className
      )}
      {...elementProps}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </Component>
  );
};