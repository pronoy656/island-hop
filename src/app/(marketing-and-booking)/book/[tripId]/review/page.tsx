"use client";

import { use, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowRight, Calendar, Clock, Info, Minus, Plus, Ship, Tag } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { AVAILABLE_FERRIES } from "@/data/ferries";

import { BookingStepperNav, BookingSummarySidebar } from "@/widgets";
import { AnimatedSection, Button, Card, CardContent } from "@/ui";

interface Step1ReviewPageProps {
  params: Promise<{ tripId: string }>;
}

export default function Step1ReviewPage({ params }: Step1ReviewPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [passengerCount, setPassengerCount] = useQueryState(
    "passengers",
    parseAsInteger.withDefault(1)
  );
  const [departureDate] = useQueryState("departureDate", parseAsString.withDefault("2026-05-24"));

  const trip = AVAILABLE_FERRIES.find((t) => t.id === tripId) || AVAILABLE_FERRIES[0];

  const handleIncrement = () => {
    if (passengerCount < trip.availableSeats) {
      void setPassengerCount(passengerCount + 1);
    }
  };

  const handleDecrement = () => {
    if (passengerCount > 1) {
      void setPassengerCount(passengerCount - 1);
    }
  };

  const handleContinue = () => {
    startTransition(() => {
      router.push(
        `/book/${trip.id}/passengers?passengers=${passengerCount}&departureDate=${encodeURIComponent(
          departureDate
        )}`
      );
    });
  };

  // Format date display
  let formattedDate = departureDate;
  try {
    const d = new Date(departureDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
  } catch {
    formattedDate = departureDate;
  }

  return (
    <div className="dark:bg-background min-h-screen bg-[#F8FAFC] py-20">
      {/* 1. Top Stepper Header */}
      <div className="border-border/60 dark:bg-card border-b bg-white">
        <BookingStepperNav currentStep={1} />
      </div>

      {/* 2. Main Content Grid */}
      <main className="container mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Trip Details & Passenger Selector */}
          <AnimatedSection
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6 lg:col-span-8"
          >
            {/* Trip Recap Card */}
            <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
              <CardContent className="space-y-6 p-0">
                <div className="border-border/60 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Your ferry trip
                    </span>
                    <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                      {trip.departurePort} &rarr; {trip.arrivalPort}
                    </h2>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border h-9 rounded-xl px-4 text-xs font-semibold"
                    asChild
                  >
                    <Link
                      href={`/book?passengers=${passengerCount}&departureDate=${departureDate}`}
                    >
                      Change Trip
                    </Link>
                  </Button>
                </div>

                {/* Trip Metadata Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex items-start gap-3.5">
                    <div className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-muted-foreground text-[11px] font-medium">Date</div>
                      <div className="text-foreground text-sm font-bold">{formattedDate}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-muted-foreground text-[11px] font-medium">Time</div>
                      <div className="text-foreground text-sm font-bold">
                        {trip.departureTime} &rarr; {trip.arrivalTime}
                      </div>
                      <div className="text-muted-foreground text-xs">{trip.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <Ship className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-muted-foreground text-[11px] font-medium">Operator</div>
                      <div className="text-foreground text-sm font-bold">{trip.operator}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-muted-foreground text-[11px] font-medium">Fare</div>
                      <div className="text-foreground text-sm font-bold">
                        ${trip.price}{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          / passenger
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seats Remaining Blue Banner */}
            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#EBF5FF] p-4 text-[#003B95] dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-0.5 text-xs sm:text-sm">
                <div className="font-bold">{trip.availableSeats} seats remaining</div>
                <div className="text-xs text-blue-900/80 dark:text-blue-200/80">
                  Tickets are subject to the remaining passenger capacity of this ferry.
                </div>
              </div>
            </div>

            {/* Tickets / Passenger Counter Card */}
            <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
              <CardContent className="space-y-4 p-0">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-[11px] font-extrabold tracking-wider uppercase">
                    TICKETS
                  </div>
                  <h3 className="text-foreground text-base font-bold">How many passengers?</h3>
                  <p className="text-muted-foreground text-xs">
                    Select the number of passengers travelling on this booking.
                  </p>
                </div>

                {/* Counter Input Box */}
                <div className="border-border/80 bg-card flex max-w-sm items-center justify-between rounded-2xl border p-2 sm:p-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={passengerCount <= 1}
                    className="border-border/80 bg-muted/50 hover:bg-muted h-10 w-10 rounded-xl"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="text-foreground text-sm font-bold">
                    {passengerCount} {passengerCount === 1 ? "Passenger" : "Passengers"}
                  </span>

                  <Button
                    type="button"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={passengerCount >= trip.availableSeats}
                    className="h-10 w-10 rounded-xl bg-[#003B95] text-white hover:bg-[#002f77]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Right Column: Sticky Summary Sidebar */}
          <AnimatedSection delay={0.08} className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingSummarySidebar
                trip={trip}
                passengerCount={passengerCount}
                departureDate={formattedDate}
                actionButton={
                  <Button
                    onClick={handleContinue}
                    className="h-12 w-full rounded-xl bg-[#003B95] text-xs font-bold text-white shadow-md transition-all hover:bg-[#002f77] sm:text-sm"
                  >
                    Continue to Passenger Details <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
