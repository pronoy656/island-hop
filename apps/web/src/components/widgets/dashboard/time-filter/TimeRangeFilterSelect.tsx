"use client";

import * as React from "react";
import { Calendar, Check, ChevronDown } from "lucide-react";
import {
  TIME_RANGE_OPTIONS,
  type TimeRangeFilter
} from "@/data";
import { cn } from "@/lib/utils";
import { Button } from "@/ui";

export interface TimeRangeFilterSelectProps {
  value: TimeRangeFilter;
  onChange: (value: TimeRangeFilter) => void;
  className?: string;
}

export function TimeRangeFilterSelect({
  value,
  onChange,
  className
}: TimeRangeFilterSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption =
    TIME_RANGE_OPTIONS.find((opt) => opt.value === value) || TIME_RANGE_OPTIONS[2];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        className="border-border/80 bg-card hover:bg-accent text-foreground flex items-center gap-2 h-9 px-3 text-xs font-semibold shadow-xs"
      >
        <Calendar className="text-muted-foreground h-3.5 w-3.5" />
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={cn(
            "text-muted-foreground h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="bg-popover text-popover-foreground border-border/80 absolute right-0 z-50 mt-1.5 w-44 origin-top-right rounded-xl border p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
          {TIME_RANGE_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-muted/70 text-foreground"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
