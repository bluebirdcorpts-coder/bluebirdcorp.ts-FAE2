"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Package,
  BrainCircuit,
  ClipboardList,
  Bird,
  SearchCheck,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/research", label: "AI Research", icon: SearchCheck, highlight: true },
  { href: "/products", label: "Products", icon: Package },
  { href: "/analyze", label: "AI Analyze", icon: BrainCircuit },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-[220px] bg-brand-900 text-white flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-brand-700">
        <Bird className="w-6 h-6 text-brand-100" />
        <div>
          <p className="text-sm font-bold leading-tight">Bluebird</p>
          <p className="text-xs text-brand-300 leading-tight">B-APO v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand-600 text-white"
                  : highlight
                  ? "text-yellow-300 hover:bg-brand-800 hover:text-yellow-200"
                  : "text-brand-200 hover:bg-brand-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {highlight && !active && (
                <span className="ml-auto text-xs bg-yellow-400 text-yellow-900 rounded-full px-1.5 py-0.5 font-bold">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-brand-700">
        <p className="text-xs text-brand-400">FAE / PM Internal Tool</p>
      </div>
    </aside>
  );
}
