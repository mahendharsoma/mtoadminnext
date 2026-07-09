"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { dropdownVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} asChild {...props}>
      <motion.div
        variants={dropdownVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          "z-50 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-[var(--shadow-elevated)] outline-none",
          className
        )}
      >
        {children}
      </motion.div>
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
