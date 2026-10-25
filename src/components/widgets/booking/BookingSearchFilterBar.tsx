"use client";

import { useEffect, useMemo } from "react";
import { addDays, format, isBefore, parseISO } from "date-fns";
import { Anchor, ArrowLeftRight, ArrowRight, ArrowUpDown, Calendar, MapPin, Users } from "lucide-react";
import { useQueryStates } from "nuqs";

import { bookingSearchParamsParsers } from "@/schemas/booking-params";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, DatePicker, Label } from "@/ui";
import { useConnectedPortsQuery } from "@/hooks/use-routes";
import { getUniquePorts } from "@/data/ports";

import { PassengerSelector } from "./PassengerSelector";
import { PortCombobox, PortOption } from "./PortCombobox";

export function BookingSearchFilterBar() {
  const [params, setParams] = useQueryStates(bookingSearchParamsParsers, {
    shallow: false
  });

  const { data: connectedPorts = [], isLoading: isLoadingPorts } = useConnectedPortsQuery();

  const departureOptions: PortOption[] = useMemo(() => {
    if (connectedPorts && connectedPorts.length > 0) {
      return connectedPorts.map((cp) => ({
        id: cp.portId,
        name: cp.portName
      }));
    }
    return getUniquePorts().map((name) => ({ name }));
  }, [connectedPorts]);

  const destinationOptions: PortOption[] = useMemo(() => {
    if (connectedPorts && connectedPorts.length > 0) {
      const activeDep = connectedPorts.find(
        (cp) =>
          cp.portName.toLowerCase() === (params.from || "").toLowerCase() ||
          cp.portId === params.from
      );
      if (activeDep && activeDep.destinations && activeDep.destinations.length > 0) {
        return activeDep.destinations.map((d) => ({
          id: d.portId,
          name: d.portName
        }));
      }
    }
    return getUniquePorts()
      .filter((name) => name.toLowerCase() !== (params.from || "").toLowerCase())
      .map((name) => ({ name }));
  }, [connectedPorts, params.from]);

  const adults = parseInt(params.adults || "1", 10) || 1;
  const childrenCount = parseInt(params.children || "0", 10) || 0;

  const handleDepartureChange = (newDep: string) => {
    let nextTo = params.to;
    if (connectedPorts && connectedPorts.length > 0) {
      const matched = connectedPorts.find(
        (cp) =>
          cp.portName.toLowerCase() === newDep.toLowerCase() ||
          cp.portId === newDep
      );
      if (matched && matched.destinations && matched.destinations.length > 0) {
        const isCurrentDestValid = matched.destinations.some(
          (d) => d.portName.toLowerCase() === (params.to || "").toLowerCase()
        );
        if (!isCurrentDestValid) {
          nextTo = matched.destinations[0].portName;
        }
      }
    }
    void setParams({
      from: newDep,
      to: nextTo
    });
  };

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

  // Auto-fill returnDate when round-trip is selected if returnDate is currently empty
  useEffect(() => {
    if (params.tripType === "round-trip" && !params.returnDate) {
      try {
        const base = params.departureDate ? parseISO(params.departureDate) : new Date();
        const fallbackReturn = !isNaN(base.getTime())
          ? format(addDays(base, 1), "yyyy-MM-dd")
          : format(addDays(new Date(), 1), "yyyy-MM-dd");
        void setParams({ returnDate: fallbackReturn });
      } catch {
        void setParams({ returnDate: format(addDays(new Date(), 1), "yyyy-MM-dd") });
      }
    }
  }, [params.tripType, params.returnDate, params.departureDate, setParams]);

  const handleDepartureDateChange = (newDate: string) => {
    let nextReturnDate = params.returnDate;
    if (params.tripType === "round-trip" && newDate) {
      try {
        const dep = parseISO(newDate);
        if (nextReturnDate) {
          const ret = parseISO(nextReturnDate);
          if (isBefore(ret, dep)) {
            nextReturnDate = format(addDays(dep, 1), "yyyy-MM-dd");
          }
        } else {
          nextReturnDate = format(addDays(dep, 1), "yyyy-MM-dd");
        }
      } catch {
        // fallback
      }
    }
    void setParams({
      departureDate: newDate,
      ...(params.tripType === "round-trip" && nextReturnDate ? { returnDate: nextReturnDate } : {})
    });
  };

  const handleSearch = () => {
    let nextReturn = params.returnDate;
    if (params.tripType === "round-trip" && !nextReturn) {
      try {
        const dep = params.departureDate ? parseISO(params.departureDate) : new Date();
        nextReturn = format(addDays(dep, 1), "yyyy-MM-dd");
      } catch {
        nextReturn = format(addDays(new Date(), 1), "yyyy-MM-dd");
      }
    }

    void setParams({
      tripType: params.tripType,
      from: params.from,
      to: params.to,
      departureDate: params.departureDate,
      returnDate: params.tripType === "round-trip" ? nextReturn : null,
      adults: String(adults),
      children: String(childrenCount),
      passengers: params.passengers
    });
  };

  const isRoundTrip = params.tripType === "round-trip";

  return (
    <Card className="border-border/80 bg-card/95 rounded-2xl p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-all sm:p-6 lg:p-7">
      <CardContent className="space-y-4 p-0">
        {/* Trip Type Segmented Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="border-border/60 bg-muted/60 inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                void setParams({
                  tripType: "one-way",
                  returnDate: null
                });
              }}
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
              onClick={() => {
                let nextReturn = params.returnDate;
                if (!nextReturn) {
                  try {
                    const dep = params.departureDate ? parseISO(params.departureDate) : new Date();
                    nextReturn = format(addDays(dep, 1), "yyyy-MM-dd");
                  } catch {
                    nextReturn = format(addDays(new Date(), 1), "yyyy-MM-dd");
                  }
                }
                void setParams({
                  tripType: "round-trip",
                  returnDate: nextReturn
                });
              }}
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

        {/* Form Fields Responsive Grid */}
        <div
          className={cn(
            "grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:items-end",
            isRoundTrip
              ? "lg:grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr_1.1fr]"
              : "lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.1fr]"
          )}
        >
          {/* FROM */}
          <div className="min-w-0 space-y-1.5 sm:col-span-1">
            <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
              <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>FROM</span>
            </Label>
            <div className="relative">
              <PortCombobox
                value={params.from}
                onChange={handleDepartureChange}
                options={departureOptions}
                isLoading={isLoadingPorts}
                placeholder="Departure port"
                icon={MapPin}
                className="sm:pr-9"
              />

              {/* Floating Swap Button on tablet/desktop centered exactly on the input box seam */}
              <button
                type="button"
                onClick={handleSwapPorts}
                title="Swap departure and destination"
                className="hidden sm:flex absolute left-[calc(100%+7px)] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-xs transition-all duration-300 hover:rotate-180 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 active:scale-90 cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* MOBILE SWAP BUTTON */}
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

          {/* TO */}
          <div className="min-w-0 space-y-1.5 sm:col-span-1">
            <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
              <Anchor className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>TO</span>
            </Label>
            <PortCombobox
              value={params.to}
              onChange={(val) => void setParams({ to: val })}
              options={destinationOptions}
              placeholder="Destination port"
              icon={Anchor}
              className="sm:pl-8"
            />
          </div>

          {/* TRAVEL DATE */}
          <div className="min-w-0 space-y-1.5 sm:col-span-1">
            <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
              <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>DEPARTURE DATE</span>
            </Label>
            <DatePicker
              value={params.departureDate}
              onChange={handleDepartureDateChange}
              minDate={new Date()}
              placeholder="Departure date"
              className="border border-input bg-muted/40 hover:bg-muted/60 text-foreground h-11 w-full rounded-xl px-3.5 text-xs font-bold shadow-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* RETURN DATE (Round Trip Only) */}
          {isRoundTrip && (
            <div className="min-w-0 space-y-1.5 sm:col-span-1">
              <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
                <Calendar className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                <span>RETURN DATE</span>
              </Label>
              <DatePicker
                value={params.returnDate || ""}
                onChange={(val) => void setParams({ returnDate: val })}
                minDate={params.departureDate ? new Date(params.departureDate) : new Date()}
                placeholder="Return date"
                className="border border-input bg-muted/40 hover:bg-muted/60 text-foreground h-11 w-full rounded-xl px-3.5 text-xs font-bold shadow-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

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
