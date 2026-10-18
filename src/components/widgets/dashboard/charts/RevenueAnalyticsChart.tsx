"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import type { RevenueDataPoint, TimeRangeFilter } from "@/data";
import { cn } from "@/lib/utils";
import { TimeRangeFilterSelect } from "../time-filter/TimeRangeFilterSelect";

export interface RevenueAnalyticsChartProps {
  data: RevenueDataPoint[];
  timeRange?: TimeRangeFilter;
  onTimeRangeChange?: (range: TimeRangeFilter) => void;
  className?: string;
}

export function RevenueAnalyticsChart({
  data,
  timeRange,
  onTimeRangeChange,
  className
}: RevenueAnalyticsChartProps) {
  const [internalTimeRange, setInternalTimeRange] = React.useState<TimeRangeFilter>("30d");
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  const activeRange = timeRange ?? internalTimeRange;
  const handleRangeChange = onTimeRangeChange ?? setInternalTimeRange;

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.revenue), 100);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, idx) => {
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * usableWidth;
    const y = chartHeight - paddingY - (d.revenue / maxVal) * usableHeight;
    return { x, y, data: d };
  });

  // Construct smooth bezier curve path
  const linePath = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const totalRev = data.reduce((acc, d) => acc + d.revenue, 0);
  const totalComm = data.reduce((acc, d) => acc + d.commission, 0);

  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border/80 flex flex-col justify-between rounded-xl border p-5 shadow-xs md:p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold tracking-tight text-foreground">
              Revenue Analytics
            </h3>
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 rounded-md px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15.3%
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            Gross ticket revenue trends over time
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <TimeRangeFilterSelect value={activeRange} onChange={handleRangeChange} />
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = paddingY + ratio * usableHeight;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-border/40"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#revenueAreaGradient)" />

          {/* Smooth Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points & Hover Targets */}
          {points.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={chartHeight - paddingY}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-70"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3.5}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* X-Axis Label */}
                <text
                  x={p.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] font-medium"
                >
                  {p.data.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="pointer-events-none absolute -top-2 z-20 -translate-x-1/2 rounded-lg border border-border/80 bg-popover px-3 py-2 text-popover-foreground shadow-lg backdrop-blur-md animate-in fade-in-0 zoom-in-95"
            style={{
              left: `${(points[hoverIndex].x / chartWidth) * 100}%`
            }}
          >
            <p className="font-bold text-xs border-b border-border/60 pb-1 mb-1 text-foreground">
              {points[hoverIndex].data.label}
            </p>
            <div className="flex items-center justify-between gap-3 text-blue-600 dark:text-blue-400 font-semibold text-xs">
              <span>Revenue:</span>
              <span>${points[hoverIndex].data.revenue.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
