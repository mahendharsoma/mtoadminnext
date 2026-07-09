"use client";

import { motion } from "framer-motion";

/** Lightweight fade-in only — no exit animation so navigation never blocks. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="min-h-0"
    >
      {children}
    </motion.div>
  );
}
