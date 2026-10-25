"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { AlertCircle, Calendar, RefreshCw, Ship } from "lucide-react";

import { bookingSearchParamsParsers } from "@/schemas/booking-params";
import { useTripsSearchQuery } from "@/hooks/use-trips";
import { FerryCard } from "./FerryCard";
import { Button, Card, CardContent } from "@/ui";

export function BookingResultsList() {
  const [params] = useQueryStates(bookingSearchParamsParsers);
  const adults = parseInt(params.adults || "1", 10) || 1;
  const children = parseInt(params.children || "0", 10) || 0;

  const searchParams = useMemo(() => ({
    from: params.from,
    to: params.to,
    departureDate: params.departureDate,
    returnDate: params.returnDate || undefined,
    tripType: params.tripType,
    adults,
    children,
    limit: 20
  }), [params.from, params.to, params.departureDate, params.returnDate, params.tripType, adults, children]);

  const isMissingReturnDate = params.tripType === "round-trip" && !params.returnDate;
  const { data, isLoading, isError, error, refetch } = useTripsSearchQuery(searchParams);

  // Format date for readable display
  const formattedDate = useMemo(() => {
    try {
      const d = new Date(params.departureDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      }
    } catch {
      // fallback
    }
    return params.departureDate;
  }, [params.departureDate]);

  const outboundTrips = data?.outboundTrips ?? [];
  const returnTrips = data?.returnTrips ?? [];

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="space-y-1">
        <div className="text-primary text-xs font-extrabold tracking-wider uppercase">
          AVAILABLE FERRIES
        </div>
        <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
          Choose your ferry
        </h2>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="text-foreground font-semibold">
            {params.from} &rarr; {params.to}
          </span>
          <span>&bull;</span>
          <span>{formattedDate}</span>
          <span>&bull;</span>
          <span>{params.passengers}</span>
        </div>
        {!isLoading && (
          <div className="text-muted-foreground pt-1 text-[11px] font-bold uppercase">
            {outboundTrips.length} {outboundTrips.length === 1 ? "TRIP" : "TRIPS"} AVAILABLE
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border/80 bg-card p-6">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="h-44 w-full rounded-xl bg-muted/60 lg:w-72" />
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 w-44 rounded-md bg-muted/60" />
                    <div className="h-6 w-28 rounded-md bg-muted/60" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="h-14 rounded-md bg-muted/50" />
                    <div className="h-14 rounded-md bg-muted/50" />
                    <div className="h-14 rounded-md bg-muted/50" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-8 text-center">
          <CardContent className="space-y-4 p-0">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-bold">Failed to load ferry trips</h3>
              <p className="text-muted-foreground text-xs mt-1">
                {error instanceof Error ? error.message : "Could not connect to the ferry schedule service."}
              </p>
            </div>
            <Button onClick={() => void refetch()} variant="outline" size="sm" className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Return Date Required State for Round Trip */}
      {isMissingReturnDate && (
        <Card className="rounded-2xl border-border/80 bg-card p-10 text-center shadow-xs">
          <CardContent className="mx-auto max-w-md space-y-4 p-0">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Calendar className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-xl font-bold">Please select a return date</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Round-trip searches require a return date. Please select a return date in the search bar above to see available outbound and return ferry schedules.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && !isMissingReturnDate && outboundTrips.length === 0 && (
        <Card className="rounded-2xl border-border/80 bg-card p-10 text-center shadow-xs">
          <CardContent className="mx-auto max-w-md space-y-4 p-0">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Ship className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-xl font-bold">No ferry trips found</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                No active sailings scheduled from <span className="font-semibold text-foreground">{params.from}</span> to{" "}
                <span className="font-semibold text-foreground">{params.to}</span> on {formattedDate}.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-left text-xs space-y-1.5 text-muted-foreground">
              <div className="font-bold text-foreground">Suggestions:</div>
              <div>• Try another departure date (daily scheduled sailings operate between Malé and Maafushi).</div>
              <div>• Check connected ports in the search filter bar above.</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outbound Trips List */}
      {!isLoading && !isError && outboundTrips.length > 0 && (
        <div className="space-y-4">
          {outboundTrips.map((trip) => (
            <FerryCard
              key={trip.tripId}
              trip={trip}
              fromPortName={trip.departurePort || params.from}
              toPortName={trip.destinationPort || params.to}
            />
          ))}
        </div>
      )}

      {/* Return Trips List (if Round Trip) */}
      {!isLoading && !isError && params.tripType === "round-trip" && returnTrips.length > 0 && (
        <div className="space-y-4 pt-10 border-t border-border/80">
          <div className="space-y-1">
            <div className="text-primary text-xs font-extrabold tracking-wider uppercase">
              RETURN JOURNEY
            </div>
            <h3 className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
              Choose your return ferry
            </h3>
            <p className="text-muted-foreground text-xs">
              {params.to} &rarr; {params.from}
            </p>
          </div>
          <div className="space-y-4">
            {returnTrips.map((trip) => (
              <FerryCard
                key={trip.tripId}
                trip={trip}
                fromPortName={trip.departurePort || params.to}
                toPortName={trip.destinationPort || params.from}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
