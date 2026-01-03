import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "relative overflow-hidden rounded-lg border",
  {
    variants: {
      variant: {
        default: "glass-card",
        hover: "glass-card-hover",
        gradient: "glass-card bg-gradient-to-br from-primary/5 to-accent/5",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
