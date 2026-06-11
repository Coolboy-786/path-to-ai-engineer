"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Roadmap", icon: "◈" },
  { href: "/board", label: "Board", icon: "▦" },
  { href: "/dashboard", label: "Stats", icon: "◉" },
  { href: "/jobs", label: "Jobs", icon: "◆" },
];

export default function Nav() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-800/50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
            AI
          </div>
          <span className="text-sm font-bold text-white tracking-tight font-mono hidden sm:block">
            Path to AI Engineer
          </span>
          <span className="text-sm font-bold text-white tracking-tight font-mono sm:hidden">
            PathAI
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => {
            const active =
              path === l.href ||
              (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer",
                  active
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <span className="text-xs opacity-60 font-mono hidden md:inline">
                    {l.icon}
                  </span>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
