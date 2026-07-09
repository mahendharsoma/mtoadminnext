import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  trend?: string;
}

export function StatCard({ title, value, icon, className, trend }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-[var(--shadow-elevated)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary/15">
          {icon}
        </div>
      </div>
    </div>
  );
}
