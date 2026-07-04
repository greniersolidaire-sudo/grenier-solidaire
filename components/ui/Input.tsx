'use client';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-wide text-text-light">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3.5 py-3 border rounded-[10px] text-[15px] text-text outline-none transition-colors bg-white font-sans',
          error ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-green',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-text-light">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Select ───
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-wide text-text-light">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full px-3.5 py-3 border rounded-[10px] text-[15px] text-text outline-none transition-colors bg-white font-sans',
          error ? 'border-red-400' : 'border-border focus:border-green',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ─── Textarea ───
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-wide text-text-light">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3.5 py-3 border rounded-[10px] text-[15px] text-text outline-none transition-colors bg-white font-sans resize-none',
          error ? 'border-red-400' : 'border-border focus:border-green',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
