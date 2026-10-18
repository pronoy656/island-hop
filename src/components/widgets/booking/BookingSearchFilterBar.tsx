"use client";

import { Anchor, ArrowRight, ArrowUpDown, Calendar, MapPin, Users } from "lucide-react";
import { useQueryStates } from "nuqs";

import { bookingSearchParamsParsers } from "@/schemas/booking-params";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, DatePicker, Label } from "@/ui";

import { PassengerSelector } from "./PassengerSelector";
import { PortCombobox } from "./PortCombobox";

export function BookingSearchFilterBar() {
  const [params, setParams] = useQueryStates(bookingSearchParamsParsers, {
    shallow: false
  });

  const adults = parseInt(params.adults || "1", 10) || 1;
  const childrenCount = parseInt(params.children || "0", 10) || 0;

  const handleSwapPorts = () => {
    void setParams({
      from: params.to,
      to: params.from
    });
  };

  const handlePassengersChange = ({
    adults: nextAdults,
    children: nextChildren
  }: {
    adults: number;
    children: number;
  }) => {
    const total = nextAdults + nextChildren;
    const text = `${total} ${total === 1 ? "Passenger" : "Passengers"}`;
    void setParams({
      adults: String(nextAdults),
      children: String(nextChildren),
      passengers: text
    });
  };

  const handleSearch = () => {
    void setParams({
      tripType: params.tripType,
      from: params.from,
      to: params.to,
      departureDate: params.departureDate,
      adults: String(adults),
      children: String(childrenCount),
      passengers: params.passengers
    });
  };

  return (
    <Card className="border-border/80 bg-card/95 rounded-2xl p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-all sm:p-6 lg:p-7">
      <CardContent className="space-y-4 p-0">
        {/* Trip Type Segmented Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="border-border/60 bg-muted/60 inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => void setParams({ tripType: "one-way" })}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 sm:px-5",
                params.tripType === "one-way"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              One way
            </button>
            <button
              type="button"
              onClick={() => void setParams({ tripType: "round-trip" })}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 sm:px-5",
                params.tripType === "round-trip"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              Round trip
            </button>
          </div>
        </div>

        {/* Form Fields Responsive 5-Column Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.3fr_1fr_1fr_1.1fr] lg:items-end">
          {/* FROM (DEPARTURE) */}
          <div className="relative min-w-0 space-y-1.5 sm:col-span-1">
            <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
              <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>FROM (DEPARTURE)</span>
            </Label>
            <PortCombobox
              value={params.from}
              onChange={(val) => void setParams({ from: val })}
              placeholder="Departure port"
              icon={MapPin}
            />

            {/* Floating Swap Button on tablet/desktop centered between From & To */}
            <div className="hidden sm:flex absolute -right-4.5 bottom-1.5 z-20">
              <button
                type="button"
                onClick={handleSwapPorts}
                title="Swap departure and destination"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-xs transition-all duration-300 hover:rotate-180 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 active:scale-90 cursor-pointer"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* MOBILE SWAP BUTTON (Centered pill between stacked From & To fields on mobile only) */}
          <div className="flex justify-center -my-1 sm:hidden">
            <button
              type="button"
              onClick={handleSwapPorts}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 px-3 py-1 text-[11px] font-bold text-muted-foreground hover:border-blue-500 hover:text-blue-600 active:scale-95 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowUpDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>Swap Direction</span>
            </button>
          </div>

          {/* TO (DESTINATION) */}
          <div className="min-w-0 space-y-1.5 sm:col-span-1">
            <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
              <Anchor className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>TO (DESTINATION)</span>
            </Label>
            <PortCombobox
              value={params.to}
              onChange={(val) => void setParams({ to: val })}
              placeholder="Destination"
              icon={Anchor}
            />
          </div>

          {/* TRAVEL DATE */}
          <div className="min-w-0 space-y-1.5 sm:col-span-1">
            <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
              <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>TRAVEL DATE</span>
            </Label>
            <DatePicker
              value={params.departureDate}
              onChange={(val) => void setParams({ departureDate: val })}
              placeholder="Departure date"
              className="border-input bg-muted/40 hover:bg-muted/60 text-foreground h-11 w-full rounded-xl px-3.5 text-xs font-bold shadow-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* PASSENGERS */}
          <div className="min-w-0 space-y-1.5 sm:col-span-1">
            <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
              <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>PASSENGERS</span>
            </Label>
            <PassengerSelector
              adults={adults}
              childrenCount={childrenCount}
              onChange={handlePassengersChange}
            />
          </div>

          {/* SEARCH FERRIES ACTION BUTTON */}
          <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1">
            {/* Desktop alignment spacer matching label height */}
            <div className="hidden lg:flex items-center text-[10px] font-extrabold uppercase invisible select-none">
              <span>SEARCH</span>
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-600/35 active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <span>Search Ferries</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
