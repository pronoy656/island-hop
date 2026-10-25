"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer group relative h-4 w-4 shrink-0 rounded-md border border-border/80 bg-background shadow-2xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 data-[state=checked]:text-white data-[state=indeterminate]:bg-emerald-600 data-[state=indeterminate]:border-emerald-600 data-[state=indeterminate]:text-white dark:data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:border-emerald-500 dark:data-[state=indeterminate]:bg-emerald-500 dark:data-[state=indeterminate]:border-emerald-500",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-3 w-3 stroke-[3] group-data-[state=indeterminate]:hidden" />
      <Minus className="hidden h-3 w-3 stroke-[3] group-data-[state=indeterminate]:block" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
