'use client';
export function Topbar({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white border-b border-border px-6 h-14 flex items-center justify-between sticky top-0 z-40">
      <div>
        <span className="font-serif text-xl text-green">{title}</span>
        {subtitle && <span className="text-[11px] text-text-light ml-3">{subtitle}</span>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
