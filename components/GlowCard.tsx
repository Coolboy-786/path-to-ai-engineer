"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  accent?: string;
  className?: string;
  glowClass?: string;
  delay?: number;
  hover?: boolean;
}

export default function GlowCard({
  children,
  accent,
  className,
  glowClass,
  delay = 0,
  hover = true,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={cn(
        "rounded-xl border glass-card transition-all duration-200",
        hover && "cursor-pointer",
        glowClass,
        className
      )}
      style={
        accent
          ? {
              borderColor: `${accent}20`,
              boxShadow: `0 0 24px ${accent}10`,
            }
          : { borderColor: "rgba(148,163,184,0.08)" }
      }
    >
      {children}
    </motion.div>
  );
}
