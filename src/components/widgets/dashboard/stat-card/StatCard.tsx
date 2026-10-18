import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  changePercent?: number;
  trend?: "up" | "down" | "neutral";
  comparisonText?: string;
  showWave?: boolean;
  valueClassName?: string;
  labelClassName?: string;
}

export function TrendSparklineWave({
  trend = "neutral",
  className
}: {
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  const gradientId = React.useId();

  const isUp = trend === "up";
  const isDown = trend === "down";

  // Smooth bezier curves with gentle undulations
  const linePath = isUp
    ? "M0,24 C20,26 35,14 55,16 C75,18 85,6 100,4"
    : isDown
      ? "M0,6 C20,4 35,18 55,16 C75,14 85,24 100,26"
      : "M0,18 C20,12 40,22 60,14 C80,20 90,16 100,16";

  const areaPath = `${linePath} L100,32 L0,32 Z`;

  const strokeColor = isUp
    ? "stroke-emerald-500"
    : isDown
      ? "stroke-rose-500"
      : "stroke-blue-500/70 dark:stroke-blue-400/70";

  const stopColor = isUp
    ? "#10b981"
    : isDown
      ? "#f43f5e"
      : "#3b82f6";

  return (
    <div className={cn("relative h-9 w-24 overflow-hidden", className)}>
      <svg
        viewBox="0 0 100 32"
        fill="none"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stopColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={stopColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={strokeColor}
        />
      </svg>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  changePercent,
  trend,
  comparisonText,
  showWave = true,
  className,
  valueClassName,
  labelClassName,
  ...props
}: StatCardProps) {
  // Determine trend automatically if not explicitly provided
  const resolvedTrend: "up" | "down" | "neutral" =
    trend ||
    (changePercent === undefined || Math.abs(changePercent) < 0.001
      ? "neutral"
      : changePercent > 0
        ? "up"
        : "down");

  const isUp = resolvedTrend === "up";
  const isDown = resolvedTrend === "down";

  // Prevent -0% display
  const formattedPercent =
    changePercent !== undefined
      ? Math.abs(changePercent) < 0.001
        ? "0.0%"
        : changePercent > 0
          ? `+${changePercent}%`
          : `${changePercent}%`
      : null;

  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border/80 relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 shadow-xs transition-all md:p-6",
        className
      )}
      {...props}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-muted-foreground text-[11px] font-bold tracking-wider uppercase",
            labelClassName
          )}
        >
          {label}
        </span>
        {Icon && (
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg shadow-2xs">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      {/* Main Value & Mini Wave Section */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div
            className={cn(
              "text-2xl font-extrabold tracking-tight text-foreground md:text-3xl",
              valueClassName
            )}
          >
            {value}
          </div>

          {/* Trend Indicator Badge & Comparison */}
          {(formattedPercent !== null || comparisonText) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              {formattedPercent !== null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                    isUp &&
                      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50",
                    isDown &&
                      "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50",
                    !isUp &&
                      !isDown &&
                      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50"
                  )}
                >
                  {isUp && <TrendingUp className="h-3 w-3" />}
                  {isDown && <TrendingDown className="h-3 w-3" />}
                  {!isUp && !isDown && <Activity className="h-3 w-3" />}
                  <span>{formattedPercent}</span>
                </span>
              )}
              {comparisonText && (
                <span className="text-muted-foreground text-[11px] font-medium">
                  {comparisonText}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Wave / Sparkline */}
        {showWave && (
          <div className="shrink-0 pb-1">
            <TrendSparklineWave trend={resolvedTrend} />
          </div>
        )}
      </div>
    </div>
  );
}
