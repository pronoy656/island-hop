"use client";

import * as React from "react";
import type { BookingsDataPoint, TimeRangeFilter } from "@/data";
import { cn } from "@/lib/utils";
import { TimeRangeFilterSelect } from "../time-filter/TimeRangeFilterSelect";

export interface BookingsVolumeChartProps {
  data: BookingsDataPoint[];
  timeRange?: TimeRangeFilter;
  onTimeRangeChange?: (range: TimeRangeFilter) => void;
  className?: string;
}

export function BookingsVolumeChart({
  data,
  timeRange,
  onTimeRangeChange,
  className
}: BookingsVolumeChartProps) {
  const [internalTimeRange, setInternalTimeRange] = React.useState<TimeRangeFilter>("30d");
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  const activeRange = timeRange ?? internalTimeRange;
  const handleRangeChange = onTimeRangeChange ?? setInternalTimeRange;

  if (!data || data.length === 0) return null;

  const maxPassengers = Math.max(...data.map((d) => d.passengers), 50);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const barGroupWidth = usableWidth / data.length;
  const barWidth = Math.min(barGroupWidth * 0.35, 24);

  const totalBookings = data.reduce((acc, d) => acc + d.bookings, 0);
  const totalPax = data.reduce((acc, d) => acc + d.passengers, 0);

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
              Bookings Volume
            </h3>
            <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 rounded-md px-2 py-0.5 text-[10px] font-bold">
              Passenger Flow
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            Ticket reservation distribution over time
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <TimeRangeFilterSelect value={activeRange} onChange={handleRangeChange} />
        </div>
      </div>

      {/* SVG Bar Chart Area */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
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

          {/* Bar Groups */}
          {data.map((d, idx) => {
            const isHovered = hoverIndex === idx;
            const groupCenterX = paddingX + idx * barGroupWidth + barGroupWidth / 2;

            const bookingsH = (d.bookings / maxPassengers) * usableHeight;
            const passengersH = (d.passengers / maxPassengers) * usableHeight;

            const bX = groupCenterX - barWidth - 2;
            const pX = groupCenterX + 2;

            const bY = chartHeight - paddingY - bookingsH;
            const pY = chartHeight - paddingY - passengersH;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* Bookings Bar (Blue) */}
                <rect
                  x={bX}
                  y={bY}
                  width={barWidth}
                  height={Math.max(bookingsH, 4)}
                  rx={3}
                  className={cn(
                    "fill-blue-600 transition-all duration-200",
                    isHovered ? "opacity-100 fill-blue-500" : "opacity-90"
                  )}
                />

                {/* Passengers Bar (Indigo / Light Blue) */}
                <rect
                  x={pX}
                  y={pY}
                  width={barWidth}
                  height={Math.max(passengersH, 4)}
                  rx={3}
                  className={cn(
                    "fill-indigo-400 dark:fill-indigo-500 transition-all duration-200",
                    isHovered ? "opacity-100 fill-indigo-300" : "opacity-85"
                  )}
                />

                {/* X-Axis Label */}
                <text
                  x={groupCenterX}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isHovered ? "fill-foreground font-bold" : "fill-muted-foreground"
                  )}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="pointer-events-none absolute -top-2 z-20 -translate-x-1/2 rounded-lg border border-border/80 bg-popover px-3 py-2 text-popover-foreground shadow-lg backdrop-blur-md animate-in fade-in-0 zoom-in-95"
            style={{
              left: `${
                ((paddingX +
                  hoverIndex * barGroupWidth +
                  barGroupWidth / 2) /
                  chartWidth) *
                100
              }%`
            }}
          >
            <p className="font-bold text-xs border-b border-border/60 pb-1 mb-1 text-foreground">
              {data[hoverIndex].label}
            </p>
            <div className="space-y-0.5 text-[11px]">
              <div className="flex items-center justify-between gap-3 text-blue-600 dark:text-blue-400 font-semibold">
                <span>Bookings:</span>
                <span>{data[hoverIndex].bookings}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-indigo-500 font-medium">
                <span>Passengers:</span>
                <span>{data[hoverIndex].passengers} pax</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
