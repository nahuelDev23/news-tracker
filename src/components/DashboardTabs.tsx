"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const tabs = [
  {
    href: "/dashboard",
    label: "Redirects",
    match: (path: string) =>
      path === "/dashboard" || path.startsWith("/dashboard/redirects"),
  },
  {
    href: "/dashboard/seetransfer",
    label: "Seetransfer",
    match: (path: string) => path.startsWith("/dashboard/seetransfer"),
  },
  {
    href: "/dashboard/fake-new",
    label: "Fake News",
    beta: true,
    match: (path: string) => path.startsWith("/dashboard/fake-new"),
  },
];

interface DashboardTabsProps {
  initialPathname: string;
}

export default function DashboardTabs({ initialPathname }: DashboardTabsProps) {
  const pathname = usePathname() ?? initialPathname;

  return (
    <nav className="flex gap-2 border-b border-slate-800">
      {tabs.map((tab) => {
        const active = tab.match(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
            {"beta" in tab && tab.beta && (
              <span className="rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/20 text-amber-400">
                beta
              </span>
            )}
            {active && (
              <motion.span
                layoutId="dashboard-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-amber-500"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
