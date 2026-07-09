"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUpVariants } from "@/lib/motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        variants={fadeUpVariants}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
        >
          <AlertTriangle className="h-10 w-10" strokeWidth={1.5} />
        </motion.div>
        <p className="text-sm font-semibold uppercase tracking-widest text-destructive">Error</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button className="rounded-xl" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
