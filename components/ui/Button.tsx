'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'wave';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-green text-white hover:bg-green-mid',
  secondary: 'bg-white text-text-mid border border-border hover:border-green hover:text-green',
  danger: 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100',
  ghost: 'bg-transparent text-text-mid hover:bg-green-xpale',
  wave: 'bg-[#1A73E8] text-white hover:bg-[#1557B0]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-full',
  md: 'px-4 py-2.5 text-sm rounded-full',
  lg: 'px-6 py-3.5 text-[15px] rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, full, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'font-medium transition-all font-sans flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        full && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
