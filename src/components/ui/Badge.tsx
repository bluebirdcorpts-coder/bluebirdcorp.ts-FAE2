import { clsx } from "clsx";

const VARIANTS = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-800",
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
