"use client";

import { use, useState } from "react";
import Link from "next/link";

import { ArrowLeft, Clock, Printer, Sailboat, Ship } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { QRCodeSVG } from "qrcode.react";

import { AVAILABLE_FERRIES } from "@/data/ferries";

import { AnimatedSection, Button } from "@/ui";

interface ETicketPageProps {
  params: Promise<{ bookingRef: string }>;
}

export default function ETicketPage({ params }: ETicketPageProps) {
  const { bookingRef } = use(params);

  const [tripId] = useQueryState("tripId", parseAsString.withDefault("trip-1"));
  const [departureDate] = useQueryState("departureDate", parseAsString.withDefault("2026-05-24"));

  const trip = AVAILABLE_FERRIES.find((t) => t.id === tripId) || AVAILABLE_FERRIES[0];

  const [passengers] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const data = sessionStorage.getItem(`booking_${trip.id}_passengers`);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed?.passengers?.length) {
            return parsed.passengers.map(
              (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`
            );
          }
        }
      } catch {
        // ignore
      }
    }
    return ["Jane Doe"];
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

  return (
    <div className="dark:bg-background flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-20">
      <AnimatedSection
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-md flex-col items-center"
      >
        {/* Top Back and Print Actions */}
        <div className="mb-6 flex w-full items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
            <Link
              href={`/book/${trip.id}/confirmation?ref=${bookingRef}&departureDate=${encodeURIComponent(
                departureDate
              )}`}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Confirmation
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => window.print()}
              title="Print E-Ticket"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h1 className="text-foreground mb-6 text-2xl font-black tracking-tight sm:text-3xl">
          Your E-Ticket
        </h1>

        {/* Ticket Container */}
        <div className="border-border/80 dark:bg-card w-full overflow-hidden rounded-3xl border bg-white shadow-xl">
          {/* Navy Header Section */}
          <div className="bg-[#002244] p-6 text-white dark:bg-[#00172e]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm">
                CONFIRMED
              </span>
              <span className="font-mono text-xs font-semibold text-white/80">
                Ref: {bookingRef}
              </span>
            </div>

            {/* Route Header */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-2xl font-black tracking-tight">{trip.departurePort}</div>
              <div className="flex flex-1 items-center justify-center px-4">
                <div className="relative flex w-full items-center">
                  <div className="h-[2px] w-full border-t border-dashed border-white/40" />
                  <Sailboat className="absolute left-1/2 h-5 w-5 -translate-x-1/2 text-white" />
                  <div className="absolute right-0 h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight">{trip.arrivalPort}</div>
            </div>

            {/* Departure Date & Time */}
            <div className="mt-6 flex items-center justify-between text-xs text-white/90">
              <div className="flex items-center gap-1.5 font-medium">
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="h-3.5 w-3.5" />
                <span>{trip.departureTime}</span>
              </div>
            </div>
          </div>

          {/* Dashed Tear-Off Separator */}
          <div className="dark:bg-card relative flex items-center justify-between bg-white px-2 py-3">
            <div className="dark:bg-background h-6 w-3 -translate-x-3 rounded-r-full bg-[#F8FAFC]" />
            <div className="border-border h-[1.5px] w-full border-t-2 border-dashed" />
            <div className="dark:bg-background h-6 w-3 translate-x-3 rounded-l-full bg-[#F8FAFC]" />
          </div>

          {/* Ticket Body: Details */}
          <div className="space-y-4 px-6 py-2">
            {/* Operator */}
            <div className="space-y-1">
              <div className="text-muted-foreground text-[10px] font-bold uppercase">Operator</div>
              <div className="text-foreground flex items-center gap-2 font-bold">
                <Ship className="h-4 w-4 text-[#003B95]" />
                <span>{trip.operator}</span>
              </div>
            </div>

            {/* Passengers */}
            <div className="space-y-1.5 pt-2">
              <div className="text-muted-foreground text-[10px] font-bold uppercase">
                Passengers ({passengers.length})
              </div>
              <div className="space-y-1">
                {passengers.map((p, idx) => (
                  <div
                    key={idx}
                    className="text-foreground flex items-center gap-2 text-xs font-semibold"
                  >
                    <span className="text-muted-foreground">•</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dashed Separator 2 */}
          <div className="dark:bg-card relative flex items-center justify-between bg-white px-2 py-3">
            <div className="dark:bg-background h-6 w-3 -translate-x-3 rounded-r-full bg-[#F8FAFC]" />
            <div className="border-border h-[1.5px] w-full border-t-2 border-dashed" />
            <div className="dark:bg-background h-6 w-3 translate-x-3 rounded-l-full bg-[#F8FAFC]" />
          </div>

          {/* QR Code Section */}
          <div className="px-6 pt-2 pb-8 text-center">
            <div className="text-muted-foreground text-[11px] font-semibold">
              Scan at boarding gate
            </div>

            <div className="border-border/60 mx-auto my-4 flex w-fit items-center justify-center rounded-2xl border bg-white p-3 shadow-xs">
              <QRCodeSVG
                value={`https://islandhop.com/tickets/${bookingRef}`}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-foreground font-mono text-base font-black tracking-widest">
              {bookingRef}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
