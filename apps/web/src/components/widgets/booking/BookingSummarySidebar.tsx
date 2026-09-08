"use client";

import type { ReactNode } from "react";

import { Ship } from "lucide-react";

import type { FerryTrip } from "@/data/ferries";

import { Card, CardContent } from "@/ui";

interface BookingSummarySidebarProps {
  trip: FerryTrip;
  passengerCount: number;
  departureDate?: string;
  actionButton?: ReactNode;
  secondaryButton?: ReactNode;
  title?: string;
}

export function BookingSummarySidebar({
  trip,
  passengerCount,
  departureDate = "Sat, 24 May 2026",
  actionButton,
  secondaryButton,
  title = "Your booking"
}: BookingSummarySidebarProps) {
  const totalPrice = trip.price * passengerCount;

  // Format departure date nicely if valid ISO
  let displayDate = departureDate;
  try {
    const d = new Date(departureDate);
    if (!isNaN(d.getTime())) {
      displayDate = d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
  } catch {
    displayDate = departureDate;
  }

  return (
    <Card className="border-border/80 bg-card rounded-2xl border p-6 shadow-sm">
      <CardContent className="space-y-6 p-0">
        <h3 className="text-foreground text-lg font-bold tracking-tight">{title}</h3>

        {/* Route Details */}
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground font-medium">Route</span>
            <div className="text-foreground flex items-center gap-1.5 font-bold">
              <Ship className="h-3.5 w-3.5 shrink-0 text-[#003B95]" />
              <span>
                {trip.departurePort} &rarr; {trip.arrivalPort}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground font-medium">Date</span>
            <span className="text-foreground font-semibold">{displayDate}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground font-medium">Departure</span>
            <span className="text-foreground font-semibold">{trip.departureTime}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground font-medium">Passengers</span>
            <span className="text-foreground font-semibold">
              {passengerCount} {passengerCount === 1 ? "Passenger" : "Passengers"}
            </span>
          </div>
        </div>

        <div className="bg-border/60 h-[1px] w-full" />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              Fare (${trip.price} &times; {passengerCount})
            </span>
            <span className="text-foreground font-medium">${totalPrice}</span>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <span className="text-foreground text-sm font-bold">Total</span>
            <span className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
              ${totalPrice}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {(actionButton || secondaryButton) && (
          <div className="space-y-2.5 pt-2">
            {actionButton}
            {secondaryButton}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
