import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("bg-white rounded-xl border border-gray-200 shadow-sm p-5", className)}>
      {children}
    </div>
  );
}
