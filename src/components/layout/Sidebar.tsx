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
  TrendingUp,
  Wifi,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/ts-dashboard",  label: "TS Strategy",   icon: TrendingUp,  badge: "NEW" },
  { href: "/rfid-proposal", label: "RFID 제안서",    icon: Wifi,        badge: "NEW" },
  { href: "/research",      label: "AI Research",   icon: SearchCheck },
  { href: "/products",      label: "Products",      icon: Package },
  { href: "/analyze",       label: "AI Analyze",    icon: BrainCircuit },
  { href: "/tasks",         label: "Tasks",         icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col z-20"
      style={{ width: "var(--sidebar-w, 240px)", background: "#0d1117", borderRight: "1px solid #21262d" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-[18px]" style={{ borderBottom: "1px solid #21262d" }}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 shrink-0">
          <Bird className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold leading-tight text-white tracking-wide">Bluebird</p>
          <p className="text-[11px] leading-tight" style={{ color: "#8b949e" }}>B-APO v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-brand-600/15 text-brand-300"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
              )}
            >
              {/* Active indicator bar */}
              <span
                className={clsx(
                  "absolute left-0 w-[3px] h-5 rounded-r-full transition-all duration-150",
                  active ? "bg-brand-500 opacity-100" : "opacity-0"
                )}
              />
              <Icon
                className={clsx(
                  "w-4 h-4 shrink-0 transition-colors",
                  active ? "text-brand-400" : "text-[#8b949e] group-hover:text-[#e6edf3]"
                )}
              />
              <span className="flex-1">{label}</span>
              {badge && !active && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-600/20 text-brand-400 tracking-wide">
                  {badge}
                </span>
              )}
              {active && (
                <ChevronRight className="w-3 h-3 text-brand-500 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid #21262d" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <p className="text-[11px]" style={{ color: "#8b949e" }}>FAE / PM Internal Tool</p>
        </div>
      </div>
    </aside>
  );
}
