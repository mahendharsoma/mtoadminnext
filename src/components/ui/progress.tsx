"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  showLabel = false,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-info"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
