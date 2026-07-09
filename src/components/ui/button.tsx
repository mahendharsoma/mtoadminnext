"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-input bg-card hover:bg-muted/60 hover:border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90",
        ghost: "hover:bg-muted/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([]);

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (!asChild && !props.disabled) {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRipples((prev) => [
          ...prev,
          { x: e.clientX - rect.left, y: e.clientY - rect.top, id },
        ]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
      onClick?.(e);
    }

    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }), "active:scale-[0.98]")}
          ref={ref}
          onClick={onClick}
          {...props}
        />
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "active:scale-[0.98]")}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute animate-ripple rounded-full bg-white/35"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
            }}
          />
        ))}
        <span className="relative z-[1] inline-flex items-center justify-center gap-2">
          {props.children}
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
