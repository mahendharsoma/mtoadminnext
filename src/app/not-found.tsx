"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUpVariants } from "@/lib/motion";

export default function NotFound() {
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
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          <FileQuestion className="h-10 w-10" strokeWidth={1.5} />
        </motion.div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
