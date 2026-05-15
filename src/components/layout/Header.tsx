"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7 pb-5 border-b border-slate-200/70">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}
