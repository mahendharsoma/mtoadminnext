import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "success" | "warning" | "destructive" | "secondary";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "success" && "bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[var(--success)]",
        variant === "warning" && "bg-[color-mix(in_srgb,var(--warning)_14%,white)] text-[var(--warning)]",
        variant === "destructive" && "bg-[color-mix(in_srgb,var(--destructive)_12%,white)] text-[var(--destructive)]",
        variant === "secondary" && "bg-[color-mix(in_srgb,var(--secondary)_12%,white)] text-[var(--secondary)]",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
