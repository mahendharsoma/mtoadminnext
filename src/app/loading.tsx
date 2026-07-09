import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-4 text-center">
        <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
        <Skeleton className="mx-auto h-5 w-48" />
        <Skeleton className="mx-auto h-3 w-64" />
      </div>
    </div>
  );
}
