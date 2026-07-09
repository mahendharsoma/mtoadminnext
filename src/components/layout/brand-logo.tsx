import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 64,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/hyderabad-police-logo.png"
      alt="Hyderabad City Police"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
