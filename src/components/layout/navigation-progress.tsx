"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function NavigationProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPending(false);
    setProgress(100);
    const done = window.setTimeout(() => setProgress(0), 250);
    return () => window.clearTimeout(done);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
        return;

      let targetPath = href;
      try {
        targetPath = new URL(href, window.location.origin).pathname;
      } catch {
        return;
      }

      if (targetPath !== pathname) {
        setPending(true);
        setProgress(12);
        window.setTimeout(() => setProgress((p) => (p < 70 ? 70 : p)), 120);
        window.setTimeout(() => setProgress((p) => (p < 88 ? 88 : p)), 400);
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  if (progress === 0 && !pending) return null;

  return (
    <AnimatePresence>
      {(pending || progress > 0) && (
        <motion.div
          key="nav-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 bg-transparent"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-info to-primary shadow-[0_0_8px_rgba(15,76,129,0.45)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: progress >= 100 ? 0.2 : 0.35, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
