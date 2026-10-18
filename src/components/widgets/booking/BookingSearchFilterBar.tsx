"use client";

import { Anchor, ArrowRight, ArrowUpDown, Calendar, MapPin, Users } from "lucide-react";
import { useQueryStates } from "nuqs";

import { bookingSearchParamsParsers } from "@/schemas/booking-params";

import { Button, Card, CardContent, Input, Label } from "@/ui";

import { PortCombobox } from "./PortCombobox";

export function BookingSearchFilterBar() {
  const [params, setParams] = useQueryStates(bookingSearchParamsParsers, {
    shallow: false
  });

  const handleSwapPorts = () => {
    void setParams({
      from: params.to,
      to: params.from
    });
  };

  return (
    <Card className="border-border bg-card/95 rounded-2xl p-6 shadow-2xl backdrop-blur-md sm:p-7">
      <CardContent className="p-0">
        {/* Trip Type Pills */}
        <div className="mb-5 flex items-center gap-2">
          <Button
            type="button"
            variant={params.tripType === "one-way" ? "default" : "secondary"}
            size="sm"
            onClick={() => void setParams({ tripType: "one-way" })}
            className="h-8 rounded-full px-5 text-xs font-bold"
          >
            One way
          </Button>
          <Button
            type="button"
            variant={params.tripType === "round-trip" ? "default" : "secondary"}
            size="sm"
            onClick={() => void setParams({ tripType: "round-trip" })}
            className="h-8 rounded-full px-5 text-xs font-bold"
          >
            Round trip
          </Button>
        </div>

        {/* Form Fields Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          {/* FROM */}
          <div className="space-y-1.5 lg:col-span-3">
            <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
              FROM
            </Label>
            <PortCombobox
              value={params.from}
              onChange={(val) => void setParams({ from: val })}
              placeholder="Departure port"
              icon={MapPin}
            />
          </div>

          {/* SWAP BUTTON */}
          <div className="hidden lg:col-span-1 lg:flex lg:items-center lg:justify-center lg:pb-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwapPorts}
              title="Swap ports"
              className="border-border bg-background text-muted-foreground hover:text-primary h-8 w-8 rounded-full shadow-xs transition-transform hover:scale-110"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* TO */}
          <div className="space-y-1.5 lg:col-span-3">
            <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
              TO
            </Label>
            <PortCombobox
              value={params.to}
              onChange={(val) => void setParams({ to: val })}
              placeholder="Destination"
              icon={Anchor}
            />
          </div>

          {/* DEPARTURE */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
              DEPARTURE
            </Label>
            <div className="border-input bg-muted/40 focus-within:border-ring flex h-11 items-center gap-2 rounded-xl border px-3.5 transition-colors">
              <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <Input
                type="date"
                value={params.departureDate}
                onChange={(e) => void setParams({ departureDate: e.target.value })}
                className="text-foreground h-auto border-0 bg-transparent p-0 text-xs font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* PASSENGERS & SEARCH ACTION */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
                  PASSENGERS
                </Label>
                <div className="border-input bg-muted/40 focus-within:border-ring flex h-11 items-center gap-2 rounded-xl border px-3.5 transition-colors">
                  <Users className="text-muted-foreground h-4 w-4 shrink-0" />
                  <select
                    value={params.passengers}
                    onChange={(e) => void setParams({ passengers: e.target.value })}
                    className="text-foreground w-full bg-transparent text-xs font-bold focus:outline-none"
                  >
                    <option value="1 Passenger">1 Passenger</option>
                    <option value="2 Passengers">2 Passengers</option>
                    <option value="3 Passengers">3 Passengers</option>
                    <option value="4+ Group">4+ Group</option>
                  </select>
                </div>
              </div>

              {/* Search Ferries Action Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  className="h-11 rounded-xl px-5 text-xs font-bold shadow-md transition-all hover:shadow-lg"
                  onClick={() => {
                    void setParams({ ...params });
                  }}
                >
                  <span className="whitespace-nowrap">Search Ferries</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
