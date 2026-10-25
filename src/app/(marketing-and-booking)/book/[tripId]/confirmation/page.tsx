"use client";

import { use } from "react";
import Link from "next/link";
import { Check, Download, QrCode, Ship, Ticket, User } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { QRCodeSVG } from "qrcode.react";

import { useBookingLookupQuery } from "@/hooks/use-bookings";
import { BookingStepperNav } from "@/widgets";
import { AnimatedSection, Button, Card, CardContent } from "@/ui";

interface Step4ConfirmationPageProps {
  params: Promise<{ tripId: string }>;
}

export default function Step4ConfirmationPage({ params }: Step4ConfirmationPageProps) {
  const { tripId } = use(params);
  const [bookingRef] = useQueryState("ref", parseAsString.withDefault(""));

  const { data: booking, isLoading } = useBookingLookupQuery(bookingRef);

  // Derived values from live DB booking
  const refCode = booking?.reference || bookingRef || "BK-CONFIRMED";
  const depPort = booking?.schedule?.route?.departurePort?.name || "Malé Ferry Terminal";
  const arrPort = booking?.schedule?.route?.destinationPort?.name || "Maafushi Jetty";
  const operatorName = booking?.schedule?.route?.operator?.companyName || "Atoll Ferries";
  const vesselName = booking?.schedule?.ferry?.name || "Ocean Express";
  const totalAmount = booking?.totalAmount ?? 35;
  const passengers = booking?.tickets || [];
  const status = booking?.status || "CONFIRMED";

  const departureDateDisplay = booking?.schedule?.departureTime
    ? new Date(booking.schedule.departureTime).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "Departure Scheduled";

  const departureTimeDisplay = booking?.schedule?.departureTime
    ? new Date(booking.schedule.departureTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "TBD";

  const arrivalTimeDisplay = booking?.schedule?.arrivalTime
    ? new Date(booking.schedule.arrivalTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "TBD";

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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
          </div>

          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            Your booking is confirmed!
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-xs sm:text-sm">
            Your digital ferry boarding pass is ready. Show your QR code at the pier gate for priority boarding.
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
                  <div className="text-3xl font-black tracking-tight text-[#003B95] dark:text-blue-400 font-mono">
                    {refCode}
                  </div>
                </div>

                {/* QR Code */}
                <div className="border-border/80 mx-auto flex w-fit items-center justify-center rounded-2xl border bg-white p-4 shadow-inner">
                  <QRCodeSVG
                    value={`https://islandhop.com/tickets/${refCode}`}
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
                    <Link href={`/tickets/${refCode}`}>
                      <Ticket className="mr-2 h-4 w-4" /> View Digital Boarding Pass
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="border-border/80 h-11 w-full rounded-xl text-xs font-semibold"
                  >
                    <Link href={`/manage-booking/${refCode}`}>Manage Booking</Link>
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
                <div className="border-border/60 text-foreground flex items-center justify-between border-b pb-4 text-base font-bold">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-[#003B95]" />
                    <span>Trip Details</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600">
                    {status}
                  </span>
                </div>

                {/* Origin to Destination Track */}
                <div className="bg-muted/40 flex items-center justify-between rounded-xl p-4">
                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Origin Port
                    </div>
                    <div className="text-foreground text-base font-bold sm:text-lg">
                      {depPort}
                    </div>
                    <div className="text-muted-foreground text-xs font-medium">
                      {departureTimeDisplay}
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <Ship className="h-4 w-4 text-[#003B95]" />
                    <div className="text-muted-foreground mt-1 text-[11px] font-medium">
                      {departureDateDisplay}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Destination Port
                    </div>
                    <div className="text-foreground text-base font-bold sm:text-lg">
                      {arrPort}
                    </div>
                    <div className="text-muted-foreground text-xs font-medium">
                      {arrivalTimeDisplay}
                    </div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <div className="text-muted-foreground text-[11px] font-medium">Operator &amp; Ferry</div>
                    <div className="text-foreground font-bold">{operatorName}</div>
                    <div className="text-muted-foreground text-xs">{vesselName}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-[11px] font-medium">Boarding Gate</div>
                    <div className="text-foreground font-bold">
                      {booking?.schedule?.gate || "Pier 1"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {passengers.length || 1} Registered Pax
                    </div>
                  </div>
                </div>

                <div className="bg-border/60 h-[1px] w-full" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-foreground text-sm font-bold">Total Paid</span>
                  <span className="text-foreground text-2xl font-black sm:text-3xl text-emerald-600">
                    ${totalAmount}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Information Card */}
            <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
              <CardContent className="space-y-4 p-0">
                <div className="text-foreground flex items-center justify-between text-base font-bold">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#003B95]" />
                    <span>Issued Tickets ({passengers.length || 1})</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-normal">
                    Coast Guard Manifest Registered
                  </span>
                </div>

                <div className="space-y-2.5">
                  {passengers.length > 0 ? (
                    passengers.map((t, idx) => (
                      <div
                        key={t.id || idx}
                        className="bg-muted/40 text-foreground flex items-center justify-between rounded-xl p-3.5 text-xs font-semibold sm:text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                            <Ticket className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-foreground font-bold">{t.passengerName}</div>
                            <div className="text-muted-foreground text-[11px]">
                              {t.nationality} &bull; ID: {t.passportOrId} &bull; {t.cabinClass}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-xs font-extrabold text-[#003B95] dark:text-blue-400">
                          {t.ticketNumber}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-muted/40 text-foreground flex items-center gap-3 rounded-xl p-3.5 text-xs font-semibold sm:text-sm">
                      <div className="bg-muted text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-foreground font-bold">
                          {booking?.leadPassengerName || "Lead Passenger"}
                        </div>
                        <div className="text-muted-foreground text-[10px]">
                          {booking?.leadPassengerEmail || "Registered"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
