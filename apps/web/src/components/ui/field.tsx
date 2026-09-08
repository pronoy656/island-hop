import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";

const fieldVariants = cva("space-y-1.5", {
  variants: {
    orientation: {
      vertical: "space-y-1.5",
      horizontal: "grid grid-cols-1 items-center gap-2 sm:grid-cols-3"
    }
  },
  defaultVariants: {
    orientation: "vertical"
  }
});

function Field({
  className,
  orientation,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof fieldVariants>) {
  return <div className={cn(fieldVariants({ orientation }), className)} {...props} />;
}

function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={cn("text-foreground text-xs font-bold", className)} {...props} />;
}

function FieldError({
  errors,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const errorMsg = errors?.find((e) => e?.message)?.message;
  if (!errorMsg) return null;

  return (
    <p className={cn("text-destructive text-[11px] font-medium", className)} {...props}>
      {errorMsg}
    </p>
  );
}

export { Field, FieldGroup, FieldLabel, FieldError };
