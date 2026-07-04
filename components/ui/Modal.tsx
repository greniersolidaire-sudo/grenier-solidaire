'use client';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  danger?: boolean;
}

const sizes = { sm: 'max-w-[380px]', md: 'max-w-[480px]', lg: 'max-w-[580px]' };

export function Modal({ open, onClose, title, subtitle, children, size = 'md', danger }: ModalProps) {
  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={cn('bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto', sizes[size])}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className={cn('font-serif text-xl', danger ? 'text-red-700' : 'text-green')}>
              {title}
            </h2>
            {subtitle && <p className="text-sm text-text-mid mt-1 font-light">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text transition-colors ml-4 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2.5 justify-end pt-4 border-t border-border mt-4">{children}</div>;
}

export function ModalDangerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4 leading-relaxed">
      {children}
    </div>
  );
}
