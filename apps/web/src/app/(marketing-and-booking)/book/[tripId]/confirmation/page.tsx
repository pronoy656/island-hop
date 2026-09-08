"use client";

import { use, useState } from "react";
import Link from "next/link";

import { Check, Ship, Ticket, User } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { QRCodeSVG } from "qrcode.react";

import { AVAILABLE_FERRIES } from "@/data/ferries";

import { BookingStepperNav } from "@/widgets";
import { AnimatedSection, Button, Card, CardContent } from "@/ui";

interface Step4ConfirmationPageProps {
  params: Promise<{ tripId: string }>;
}

interface StoredPassenger {
  firstName: string;
  lastName: string;
}

export default function Step4ConfirmationPage({ params }: Step4ConfirmationPageProps) {
  const { tripId } = use(params);

  const [bookingRef] = useQueryState("ref", parseAsString.withDefault("FRY24821"));
  const [passengerCount] = useQueryState("passengers", parseAsInteger.withDefault(1));
  const [departureDate] = useQueryState("departureDate", parseAsString.withDefault("2026-05-24"));

  const trip = AVAILABLE_FERRIES.find((t) => t.id === tripId) || AVAILABLE_FERRIES[0];

  const [storedPassengers] = useState<StoredPassenger[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const data = sessionStorage.getItem(`booking_${trip.id}_passengers`);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed?.passengers?.length) {
            return parsed.passengers;
          }
        }
      } catch {
        // ignore
      }
    }
    return [{ firstName: "Jane", lastName: "Doe" }];
  });

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

  const totalPrice = trip.price * passengerCount;

  return (
    <div className="dark:bg-background min-h-screen bg-[#F8FAFC] py-20">
      {/* 1. Top Stepper Header */}
      <div className="border-border/60 dark:bg-card border-b bg-white">
        <BookingStepperNav currentStep={4} />
      </div>

      {/* 2. Main Content */}
      <main className="container mx-auto mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Success Header Icon & Title */}
        <AnimatedSection
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="space-y-3 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A3E635]/30 text-[#15803D] dark:bg-emerald-950/40 dark:text-emerald-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#38BDF8]/40 text-[#0284C7] dark:bg-sky-900/50 dark:text-sky-300">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
          </div>

          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            Your booking is confirmed!
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-xs sm:text-sm">
            Your ferry ticket is ready. Keep your booking reference and QR ticket with you for
            boarding.
          </p>
        </AnimatedSection>

        {/* 3. Confirmation Cards Layout */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Left Column: QR Code & Reference Card */}
          <AnimatedSection delay={0.05} className="md:col-span-4">
            <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 text-center shadow-sm">
              <CardContent className="space-y-5 p-0">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-[10px] font-extrabold tracking-widest uppercase">
                    BOOKING REFERENCE
                  </div>
                  <div className="text-3xl font-black tracking-tight text-[#003B95] dark:text-blue-400">
                    {bookingRef}
                  </div>
                </div>

                {/* QR Code */}
                <div className="border-border/80 mx-auto flex w-fit items-center justify-center rounded-2xl border bg-white p-4 shadow-inner">
                  <QRCodeSVG
                    value={`https://islandhop.com/tickets/${bookingRef}`}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2">
                  <Button
                    asChild
                    className="h-11 w-full rounded-xl bg-[#003B95] text-xs font-bold text-white shadow-md transition-all hover:bg-[#002f77]"
                  >
                    <Link
                      href={`/tickets/${bookingRef}?tripId=${trip.id}&departureDate=${encodeURIComponent(
                        departureDate
                      )}`}
                    >
                      <Ticket className="mr-2 h-4 w-4" /> View E-Ticket
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="border-border/80 h-11 w-full rounded-xl text-xs font-semibold"
                  >
                    <Link href="/manage-booking">Manage Booking</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Right Column: Trip Details & Passenger Info */}
          <AnimatedSection delay={0.08} className="space-y-6 md:col-span-8">
            {/* Trip Details Card */}
            <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
              <CardContent className="space-y-6 p-0">
                <div className="border-border/60 text-foreground flex items-center gap-2 border-b pb-4 text-base font-bold">
                  <Ship className="h-4 w-4 text-[#003B95]" />
                  <span>Trip Details</span>
                </div>

                {/* Origin to Destination Track */}
                <div className="bg-muted/40 flex items-center justify-between rounded-xl p-4">
                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Origin
                    </div>
                    <div className="text-foreground text-base font-bold sm:text-lg">
                      {trip.departurePort}
                    </div>
                    <div className="text-muted-foreground text-xs font-medium">
                      {trip.departureTime}
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <Ship className="h-4 w-4 text-[#003B95]" />
                    <div className="text-muted-foreground mt-1 text-[11px] font-medium">
                      {formattedDate}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Destination
                    </div>
                    <div className="text-foreground text-base font-bold sm:text-lg">
                      {trip.arrivalPort}
                    </div>
                    <div className="text-muted-foreground text-xs font-medium">
                      {trip.arrivalTime}
                    </div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <div className="text-muted-foreground text-[11px] font-medium">Operator</div>
                    <div className="text-foreground font-bold">{trip.operator}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-[11px] font-medium">Passengers</div>
                    <div className="text-foreground font-bold">
                      {passengerCount} {passengerCount === 1 ? "Passenger" : "Passengers"}
                    </div>
                  </div>
                </div>

                <div className="bg-border/60 h-[1px] w-full" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-foreground text-sm font-bold">Total Paid</span>
                  <span className="text-foreground text-2xl font-black sm:text-3xl">
                    ${totalPrice}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Information Card */}
            <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
              <CardContent className="space-y-4 p-0">
                <div className="text-foreground flex items-center gap-2 text-base font-bold">
                  <User className="h-4 w-4 text-[#003B95]" />
                  <span>Passenger Information</span>
                </div>

                <div className="space-y-2.5">
                  {storedPassengers.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-muted/40 text-foreground flex items-center gap-3 rounded-xl p-3.5 text-xs font-semibold sm:text-sm"
                    >
                      <div className="bg-muted text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-muted-foreground text-[10px] font-medium">
                          Passenger {idx + 1}
                        </div>
                        <div>
                          {p.firstName} {p.lastName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
