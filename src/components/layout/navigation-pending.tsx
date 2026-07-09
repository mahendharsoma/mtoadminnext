"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/** Shows skeleton immediately on sidebar/link click until the new route is ready. */
export function NavigationPending({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
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
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return (
    <div className="relative min-h-0">
      <AnimatePresence>
        {pending && (
          <motion.div
            key="nav-pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-10 bg-background p-0"
          >
            <div className="space-y-4">
              <div className="animate-shimmer h-8 w-48 rounded-xl bg-muted" />
              <div className="animate-shimmer h-64 rounded-xl bg-muted" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
