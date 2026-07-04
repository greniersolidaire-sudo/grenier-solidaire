'use client';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  loading,
  emptyMessage = 'Aucune donnée',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={cn(
                  'text-[10px] font-medium text-text-light text-left px-4 py-2.5 bg-bg border-b border-border uppercase tracking-wide whitespace-nowrap',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 border-b border-bg">
                    <div className="h-3.5 bg-border rounded-full animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-sm text-text-light">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn('hover:bg-[#FAFAF8] transition-colors', onRowClick && 'cursor-pointer')}
              >
                {columns.map(col => (
                  <td key={col.key} className="text-xs text-text px-4 py-3 border-b border-bg align-middle">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Action button for table rows ───
export function TableAction({ onClick, title, variant, children }: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  variant?: 'success' | 'danger' | 'default';
  children: React.ReactNode;
}) {
  const colors = {
    success: 'hover:border-green hover:text-green hover:bg-green-xpale',
    danger:  'hover:border-red-500 hover:text-red-500 hover:bg-red-50',
    default: 'hover:border-green hover:text-green hover:bg-green-xpale',
  };

  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(e); }}
      title={title}
      className={cn(
        'w-7 h-7 rounded-md border border-border bg-white flex items-center justify-center text-xs text-text-light transition-all',
        colors[variant ?? 'default']
      )}
    >
      {children}
    </button>
  );
}

// ─── Filter tabs ───
export function FilterTabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] border transition-all flex-shrink-0',
            active === tab.id
              ? 'bg-green text-white border-green'
              : 'bg-white text-text-light border-border hover:border-green-soft'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('ml-1.5', active === tab.id ? 'text-white/70' : 'text-text-light')}>
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
