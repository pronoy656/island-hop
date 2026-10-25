"use client";

import { use } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Info,
  MapPin,
  Printer,
  Sailboat,
  ShieldCheck,
  Ship,
  Ticket,
  User
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useDigitalPassQuery } from "@/hooks/use-tickets";
import { AnimatedSection, Badge, Button, Card } from "@/ui";

interface ETicketPageProps {
  params: Promise<{ bookingRef: string }>;
}

export default function ETicketPage({ params }: ETicketPageProps) {
  const { bookingRef } = use(params);

  const { data: pass, isLoading, isError, error } = useDigitalPassQuery(bookingRef);

  if (isLoading) {
    return (
      <div className="dark:bg-background flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-20">
        <div className="w-full max-w-md space-y-4">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-[520px] w-full rounded-3xl bg-card border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !pass) {
    return (
      <div className="dark:bg-background flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-20">
        <Card className="w-full max-w-md p-8 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Boarding Pass Not Found</h2>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : `No active ticket found for reference ${bookingRef}.`}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="rounded-xl">
              <Link href="/manage-booking">Search by Reference</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Format date display
  const depTimeDate = pass.trip?.departureTime ? new Date(pass.trip.departureTime) : null;
  const formattedDate = depTimeDate && !isNaN(depTimeDate.getTime())
    ? depTimeDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "Scheduled Departure";

  const departureTimeDisplay = depTimeDate && !isNaN(depTimeDate.getTime())
    ? depTimeDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "TBD";

  const arrTimeDate = pass.trip?.arrivalTime ? new Date(pass.trip.arrivalTime) : null;
  const arrivalTimeDisplay = arrTimeDate && !isNaN(arrTimeDate.getTime())
    ? arrTimeDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "TBD";

  const qrPayload = pass.qrCodePayload || `https://islandhop.com/tickets/${pass.ticketNumber || bookingRef}`;

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
            <Link href={`/manage-booking/${pass.bookingReference}`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Manage Booking
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg gap-1.5 text-xs font-semibold"
              onClick={() => window.print()}
              title="Print Boarding Pass"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </Button>
          </div>
        </div>

        <h1 className="text-foreground mb-4 text-2xl font-black tracking-tight sm:text-3xl text-center">
          Digital Boarding Pass
        </h1>
        <p className="text-muted-foreground mb-6 text-xs text-center max-w-xs">
          Maldives Transport &amp; Coast Guard approved digital travel document.
        </p>

        {/* Boarding Pass Ticket Container */}
        <div className="border-border/80 dark:bg-card w-full overflow-hidden rounded-3xl border bg-white shadow-xl">
          {/* Top Navy Blue Header Section */}
          <div className="bg-[#002244] p-6 text-white dark:bg-[#00172e]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                {pass.boardingStatus || "CONFIRMED"}
              </span>
              <span className="font-mono text-xs font-semibold text-white/80">
                Ref: {pass.bookingReference}
              </span>
            </div>

            {/* Route Header */}
            <div className="mt-6 flex items-center justify-between">
              <div className="space-y-0.5 text-left max-w-[130px]">
                <div className="text-[10px] uppercase font-bold text-white/70">Origin</div>
                <div className="text-xl font-black tracking-tight truncate">{pass.trip.departurePort}</div>
              </div>

              <div className="flex flex-1 items-center justify-center px-3">
                <div className="relative flex w-full items-center">
                  <div className="h-[2px] w-full border-t border-dashed border-white/40" />
                  <Sailboat className="absolute left-1/2 h-5 w-5 -translate-x-1/2 text-white" />
                  <div className="absolute right-0 h-2 w-2 rounded-full bg-white" />
                </div>
              </div>

              <div className="space-y-0.5 text-right max-w-[130px]">
                <div className="text-[10px] uppercase font-bold text-white/70">Destination</div>
                <div className="text-xl font-black tracking-tight truncate">{pass.trip.destinationPort}</div>
              </div>
            </div>

            {/* Departure Date & Time */}
            <div className="mt-6 flex items-center justify-between text-xs text-white/90 border-t border-white/10 pt-3">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="h-3.5 w-3.5" />
                <span>{departureTimeDisplay} &rarr; {arrivalTimeDisplay}</span>
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
            {/* Passenger & Ticket Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-muted-foreground text-[10px] font-bold uppercase">Passenger</div>
                <div className="text-foreground font-bold text-sm truncate">{pass.passengerName}</div>
                <div className="text-muted-foreground text-[11px]">
                  {pass.nationality} &bull; {pass.passportOrId}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-muted-foreground text-[10px] font-bold uppercase">Ticket Number</div>
                <div className="text-[#003B95] dark:text-blue-400 font-mono font-bold text-xs">
                  {pass.ticketNumber}
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {pass.cabinClass} &bull; {pass.luggageCount} Bag
                </div>
              </div>
            </div>

            {/* Operator & Vessel */}
            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3">
              <div className="space-y-0.5">
                <div className="text-muted-foreground text-[10px] font-bold uppercase">Ferry Operator</div>
                <div className="text-foreground flex items-center gap-1.5 font-bold text-xs">
                  <Ship className="h-3.5 w-3.5 text-[#003B95]" />
                  <span>{pass.trip.operatorName}</span>
                </div>
              </div>

              <div className="space-y-0.5 text-right">
                <div className="text-muted-foreground text-[10px] font-bold uppercase">Ferry &amp; Gate</div>
                <div className="text-foreground font-bold text-xs">{pass.trip.vesselName}</div>
                <div className="text-muted-foreground text-[11px]">Gate: {pass.trip.gate || "Pier 1"}</div>
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
          <div className="px-6 pt-2 pb-8 text-center space-y-3">
            <div className="text-muted-foreground text-[11px] font-semibold">
              Scan barcode at turnstile or hand to crew
            </div>

            <div className="border-border/60 mx-auto flex w-fit items-center justify-center rounded-2xl border bg-white p-3 shadow-xs">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-foreground font-mono text-xs font-black tracking-widest uppercase">
              {pass.ticketNumber}
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-emerald-600 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Valid for departure on {formattedDate}</span>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
