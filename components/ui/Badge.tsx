'use client';
import { cn } from '@/lib/utils';

// ─── BADGE ───
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'blue';

const badgeStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-pale text-green-mid',
  warning: 'bg-ocre-pale text-ocre',
  danger:  'bg-red-50 text-red-700',
  info:    'bg-blue-50 text-blue-700',
  neutral: 'bg-bg text-text-light border border-border',
  blue:    'bg-blue-50 text-blue-800',
};

export function Badge({ variant = 'neutral', children, className }: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium',
      badgeStyles[variant],
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {children}
    </span>
  );
}

// ─── STATUS BADGE ───
export const ORDER_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING:   { label: 'En attente', variant: 'warning' },
  PAID:      { label: 'Payée', variant: 'success' },
  READY:     { label: 'Prête', variant: 'blue' },
  DELIVERED: { label: 'Livrée', variant: 'neutral' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
  FAILED:    { label: 'Échec paiement', variant: 'danger' },
};

export const DELIVERY_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING:    { label: 'En attente', variant: 'warning' },
  SCHEDULED:  { label: 'Planifiée', variant: 'info' },
  IN_TRANSIT: { label: 'En route', variant: 'blue' },
  DELIVERED:  { label: 'Livrée', variant: 'success' },
  FAILED:     { label: 'Échec', variant: 'danger' },
};

// ─── CARD ───
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-border overflow-hidden', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
      <div>
        <div className="text-[13px] font-medium text-green">{title}</div>
        {subtitle && <div className="text-[11px] text-text-light mt-0.5">{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── METRIC CARD ───
export function MetricCard({ label, value, sub, subColor = 'text-text-light' }: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
}) {
  return (
    <Card>
      <div className="p-5">
        <div className="text-[11px] text-text-light uppercase tracking-wide mb-2">{label}</div>
        <div className="font-serif text-3xl text-green leading-none">{value}</div>
        {sub && <div className={cn('text-[11px] mt-1.5', subColor)}>{sub}</div>}
      </div>
    </Card>
  );
}

// ─── ALERT BANNER ───
type AlertVariant = 'warning' | 'danger' | 'info' | 'success';

const alertStyles: Record<AlertVariant, string> = {
  warning: 'bg-ocre-pale border-[#E5C07A] text-ocre',
  danger:  'bg-red-50 border-red-200 text-red-700',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-pale border-green text-green-mid',
};

export function Alert({ variant = 'info', children }: {
  variant?: AlertVariant;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('border rounded-xl px-4 py-3 text-sm mb-4 leading-relaxed', alertStyles[variant])}>
      {children}
    </div>
  );
}
