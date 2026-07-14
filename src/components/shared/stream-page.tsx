import { Suspense, type ReactNode } from "react";
import { SkeletonTable } from "@/components/ui/skeleton";

export function StreamPage({
  children,
  fallback = <SkeletonTable />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
