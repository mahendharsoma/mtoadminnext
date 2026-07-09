"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUpVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There is nothing to display here yet.",
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="initial"
      animate="animate"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </motion.div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <Button asChild className="rounded-xl">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button className="rounded-xl" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
