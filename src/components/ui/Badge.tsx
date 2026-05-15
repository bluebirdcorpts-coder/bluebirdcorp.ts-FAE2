import { clsx } from "clsx";

const VARIANTS = {
  green:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  yellow: "bg-amber-50   text-amber-700   ring-1 ring-amber-200/60",
  red:    "bg-red-50     text-red-700     ring-1 ring-red-200/60",
  blue:   "bg-brand-50   text-brand-700   ring-1 ring-brand-200/60",
  gray:   "bg-slate-100  text-slate-600   ring-1 ring-slate-200/60",
  purple: "bg-violet-50  text-violet-700  ring-1 ring-violet-200/60",
} as const;

interface BadgeProps {
  label: string;
  variant?: keyof typeof VARIANTS;
}

export default function Badge({ label, variant = "gray" }: BadgeProps) {
  return (
    <span className={clsx("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", VARIANTS[variant])}>
      {label}
    </span>
  );
}
