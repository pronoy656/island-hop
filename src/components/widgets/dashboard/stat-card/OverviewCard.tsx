import * as React from "react";
import { cn } from "@/lib/utils";

export interface OverviewMetricItem {
  label: string;
  value: string | number;
  color?: "default" | "green" | "red" | "blue" | "amber" | "purple";
  subtext?: string;
}

export interface OverviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  items: OverviewMetricItem[];
  titleClassName?: string;
}

const colorClassMap: Record<NonNullable<OverviewMetricItem["color"]>, string> = {
  default: "text-foreground",
  green: "text-emerald-600 dark:text-emerald-500",
  red: "text-rose-600 dark:text-rose-500",
  blue: "text-blue-600 dark:text-blue-500",
  amber: "text-amber-600 dark:text-amber-500",
  purple: "text-purple-600 dark:text-purple-500"
};

export function OverviewCard({
  title,
  items,
  className,
  titleClassName,
  ...props
}: OverviewCardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border/80 rounded-xl border p-5 shadow-xs transition-all md:p-6",
        className
      )}
      {...props}
    >
      <h3
        className={cn(
          "text-sm font-bold tracking-tight text-foreground",
          titleClassName
        )}
      >
        {title}
      </h3>

      <div
        className={cn(
          "mt-4 grid gap-4",
          items.length === 2 && "grid-cols-2",
          items.length === 3 && "grid-cols-1 sm:grid-cols-3",
          items.length >= 4 && "grid-cols-2 sm:grid-cols-4"
        )}
      >
        {items.map((item, idx) => {
          const colorClass = item.color ? colorClassMap[item.color] : colorClassMap.default;

          return (
            <div key={idx} className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">{item.label}</p>
              <p className={cn("text-2xl font-bold tracking-tight md:text-2xl", colorClass)}>
                {item.value}
              </p>
              {item.subtext && (
                <p className="text-muted-foreground text-[11px]">{item.subtext}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
