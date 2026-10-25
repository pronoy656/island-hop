"use client";

import { useState } from "react";
import { Check, ChevronDown, Info, Minus, Plus, Users } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger, Separator } from "@/ui";
import { cn } from "@/lib/utils";

export interface PassengerCount {
  adults: number;
  children: number;
}

interface PassengerSelectorProps {
  adults: number;
  childrenCount: number;
  onChange: (counts: PassengerCount) => void;
  className?: string;
}

export function PassengerSelector({
  adults,
  childrenCount,
  onChange,
  className
}: PassengerSelectorProps) {
  const [open, setOpen] = useState(false);

  const total = adults + childrenCount;

  const handleUpdate = (type: "adults" | "children", delta: number) => {
    if (type === "adults") {
      const next = Math.max(1, Math.min(20, adults + delta));
      onChange({ adults: next, children: childrenCount });
    } else {
      const next = Math.max(0, Math.min(20, childrenCount + delta));
      onChange({ adults, children: next });
    }
  };

  // Formatted trigger label without industry jargon
  const getDisplayText = () => {
    if (childrenCount === 0) {
      return adults === 1 ? "1 Adult" : `${adults} Adults`;
    }
    const adultLabel = `${adults} ${adults === 1 ? "Adult" : "Adults"}`;
    const childLabel = `${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}`;
    const passengerWord = total === 1 ? "Passenger" : "Passengers";
    return `${total} ${passengerWord} (${adultLabel}, ${childLabel})`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "border border-input bg-muted/40 hover:bg-muted/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 flex h-11 w-full items-center justify-between rounded-xl px-3.5 text-xs font-bold text-foreground transition-all shadow-none outline-none cursor-pointer",
            open && "border-blue-500 ring-2 ring-blue-500/20 bg-muted/70",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{getDisplayText()}</span>
          </div>
          <ChevronDown
            className={cn(
              "text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        sideOffset={8}
        className="border-border/80 bg-card/95 text-foreground w-[calc(100vw-2rem)] max-w-[340px] sm:w-80 rounded-2xl p-4 shadow-xl backdrop-blur-xl sm:align-end"
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div>
              <h4 className="text-xs font-extrabold tracking-wide uppercase text-foreground">
                Passengers
              </h4>
              <p className="text-[11px] text-muted-foreground">Select traveling passengers</p>
            </div>
            <div className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-black text-blue-600 dark:text-blue-400">
              Total: {total}
            </div>
          </div>

          {/* Adults Option */}
          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-foreground">Adults</div>
              <div className="text-[11px] text-muted-foreground font-medium">Above 12 years</div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={adults <= 1}
                onClick={() => handleUpdate("adults", -1)}
                className="h-8 w-8 rounded-lg border-border/80 bg-background hover:bg-muted disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-5 text-center text-xs font-black text-foreground">{adults}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={total >= 30 || adults >= 20}
                onClick={() => handleUpdate("adults", 1)}
                className="h-8 w-8 rounded-lg border-border/80 bg-background hover:bg-muted disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Children Option */}
          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-foreground">Children</div>
              <div className="text-[11px] text-muted-foreground font-medium">Age 2 to 11 years</div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={childrenCount <= 0}
                onClick={() => handleUpdate("children", -1)}
                className="h-8 w-8 rounded-lg border-border/80 bg-background hover:bg-muted disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-5 text-center text-xs font-black text-foreground">
                {childrenCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={total >= 30 || childrenCount >= 20}
                onClick={() => handleUpdate("children", 1)}
                className="h-8 w-8 rounded-lg border-border/80 bg-background hover:bg-muted disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Infant Real-World Policy Helper Note */}
          <div className="flex items-start gap-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
            <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground font-semibold">Infants (under 2 years):</strong> Travel free on lap and do not occupy an individual seat.
            </span>
          </div>

          <Separator className="bg-border/60" />

          {/* Done CTA Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(false)}
            className="w-full h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white shadow-sm"
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            <span>Done ({total} {total === 1 ? "Passenger" : "Passengers"})</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
