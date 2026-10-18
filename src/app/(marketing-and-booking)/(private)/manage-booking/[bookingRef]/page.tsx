"use client";

import { use, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Edit,
  HelpCircle,
  Info,
  LifeBuoy,
  Phone,
  QrCode,
  Shield,
  Ship,
  User,
  XCircle
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { MOCK_PASSENGER_BOOKINGS } from "@/data/bookings";

import {
  AnimatedSection,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/ui";

interface BookingDetailsPageProps {
  params: Promise<{ bookingRef: string }>;
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { bookingRef } = use(params);
  const [booking, setBooking] = useState(
    () =>
      MOCK_PASSENGER_BOOKINGS.find((b) => b.reference.toLowerCase() === bookingRef.toLowerCase()) ||
      MOCK_PASSENGER_BOOKINGS[0]
  );

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleConfirmCancel = () => {
    setBooking((prev) => ({ ...prev, status: "CANCELLED" }));
    setIsCancelDialogOpen(false);
  };

  return (
    <div className="dark:bg-background min-h-screen bg-[#F8FAFC] pb-24">
      <main className="container mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
            <Link href="/manage-booking">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to My Bookings
            </Link>
          </Button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Main Column (8 cols) */}
          <AnimatedSection
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6 lg:col-span-8"
          >
            {/* 1. Trip Information Card */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-6 p-0">
                {/* Header */}
                <div className="border-border/60 flex items-center justify-between border-b pb-4">
                  <div className="text-foreground flex items-center gap-2 text-sm font-bold">
                    <Ship className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                    <span>Trip Information</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-[10px] font-bold text-[#003B95] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    {booking.tripType}
                  </Badge>
                </div>

                {/* Operator Logo & Name */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#003B95] text-white shadow-sm">
                    <Ship className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg font-bold">{booking.operator}</h3>
                    <p className="text-muted-foreground text-xs">{booking.vesselType}</p>
                  </div>
                </div>

                {/* Departure / Arrival Timeline */}
                <div className="bg-muted/30 rounded-2xl p-5">
                  <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
                    {/* Departure */}
                    <div className="sm:col-span-5">
                      <div className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
                        DEPARTURE
                      </div>
                      <div className="text-muted-foreground text-xs font-semibold">
                        {booking.departureDate}
                      </div>
                      <div className="mt-1 text-2xl font-black tracking-tight text-[#003B95] dark:text-blue-400">
                        {booking.departureTime}
                      </div>
                      <div className="text-foreground text-sm font-bold">{booking.from}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {booking.from} Terminal
                      </div>
                    </div>

                    {/* Duration / Arrow Track */}
                    <div className="flex flex-col items-center justify-center sm:col-span-2">
                      <div className="text-muted-foreground text-[10px] font-bold">
                        {booking.duration}
                      </div>
                      <div className="relative my-2 flex w-full max-w-[80px] items-center">
                        <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                        <div className="border-border h-[1.5px] flex-1 border-t-2 border-dotted" />
                        <Ship className="text-primary h-3.5 w-3.5" />
                        <div className="border-border h-[1.5px] flex-1 border-t-2 border-dotted" />
                        <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="sm:col-span-5 sm:text-right">
                      <div className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
                        ARRIVAL
                      </div>
                      <div className="text-muted-foreground text-xs font-semibold">
                        {booking.arrivalDate}
                      </div>
                      <div className="mt-1 text-2xl font-black tracking-tight text-[#003B95] dark:text-blue-400">
                        {booking.arrivalTime}
                      </div>
                      <div className="text-foreground text-sm font-bold">{booking.to}</div>
                      <div className="text-muted-foreground text-[11px]">{booking.to} Jetty</div>
                    </div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="border-border/60 grid grid-cols-2 gap-4 border-t pt-4 text-xs sm:grid-cols-4">
                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Ferry Type
                    </div>
                    <div className="text-foreground flex items-center gap-1.5 font-bold">
                      <Ship className="text-primary h-3.5 w-3.5" />
                      <span>{booking.vesselType}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Operator
                    </div>
                    <div className="text-foreground flex items-center gap-1.5 font-bold">
                      <User className="text-primary h-3.5 w-3.5" />
                      <span>{booking.operator}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Duration
                    </div>
                    <div className="text-foreground flex items-center gap-1.5 font-bold">
                      <Clock className="text-primary h-3.5 w-3.5" />
                      <span>{booking.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-muted-foreground text-[10px] font-bold uppercase">
                      Service Days
                    </div>
                    <div className="text-foreground flex items-center gap-1.5 font-bold">
                      <Calendar className="text-primary h-3.5 w-3.5" />
                      <span>{booking.serviceDays}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Passenger & Seat Card */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-4 p-0">
                <div className="border-border/60 text-foreground flex items-center gap-2 border-b pb-3 text-sm font-bold">
                  <User className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                  <span>Passenger &amp; Seat</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  {booking.passengers.map((p, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-6 text-xs sm:gap-10">
                      <div className="space-y-0.5">
                        <div className="text-muted-foreground text-[10px] font-bold uppercase">
                          PASSENGER
                        </div>
                        <div className="text-foreground text-sm font-bold">
                          {idx + 1}. {p.name}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-muted-foreground text-[10px] font-bold uppercase">
                          SEAT
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge className="rounded-md bg-[#003B95] px-2 py-0.5 text-xs font-bold text-white">
                            {p.seat}
                          </Badge>
                          <span className="text-muted-foreground text-xs font-medium">
                            Window seat
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-muted-foreground text-[10px] font-bold uppercase">
                          FARE TYPE
                        </div>
                        <div className="text-foreground text-xs font-bold">{p.type}</div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/80 h-9 rounded-xl px-3.5 text-xs font-semibold"
                    onClick={() => {
                      alert("Trip details added to your calendar!");
                    }}
                  >
                    <CalendarPlus className="text-primary mr-1.5 h-4 w-4" />
                    <span>Add to Calendar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 3. E-Ticket Card */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-5 p-0">
                <div className="space-y-1">
                  <div className="text-foreground flex items-center gap-2 text-sm font-bold">
                    <QrCode className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                    <span>E-Ticket</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Show this QR code at the boarding gate.
                  </p>
                </div>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  {/* QR Box */}
                  <div className="border-border/80 flex w-fit items-center justify-center rounded-2xl border bg-white p-3 shadow-inner">
                    <QRCodeSVG
                      value={`https://islandhop.com/tickets/${booking.reference}`}
                      size={150}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Reference & Info Box */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
                        BOOKING REFERENCE
                      </div>
                      <div className="text-foreground font-mono text-2xl font-black tracking-tight">
                        {booking.reference}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-2xl border border-blue-100 bg-[#F0F7FF] p-3 text-xs text-[#003B95] dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>You can also find this booking in Manage Booking.</span>
                    </div>

                    <Button
                      variant="outline"
                      asChild
                      className="dark:hover:bg-card h-10 rounded-xl border-[#003B95]/40 text-xs font-bold text-[#003B95] hover:bg-blue-50 dark:text-blue-300"
                    >
                      <Link
                        href={`/tickets/${booking.reference}?tripId=${booking.tripId}&departureDate=${encodeURIComponent(
                          booking.departureDate
                        )}`}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download E-Ticket
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Trip Updates Timeline */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-4 p-0">
                <div className="border-border/60 text-foreground flex items-center gap-2 border-b pb-3 text-sm font-bold">
                  <Clock className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                  <span>Trip Updates</span>
                </div>

                <div className="relative space-y-6 pt-2 pl-6">
                  {/* Connecting Line */}
                  <div className="bg-border absolute top-3 bottom-2 left-2.5 w-[2px]" />

                  {booking.updates.map((update, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Circle indicator */}
                      <div className="dark:bg-card absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                        {update.status === "done" ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        ) : update.status === "active" ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#003B95] text-[10px] font-bold text-white shadow-xs">
                            A
                          </div>
                        ) : (
                          <div className="border-border bg-muted text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full border">
                            <Clock className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between gap-1 sm:flex-row sm:items-start">
                        <div className="space-y-0.5">
                          <h4 className="text-foreground text-xs font-bold">{update.title}</h4>
                          <p className="text-muted-foreground text-[11px]">{update.description}</p>
                        </div>
                        <div className="text-muted-foreground text-right text-[11px] sm:shrink-0">
                          <div className="font-semibold">{update.date}</div>
                          <div>{update.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Right Sidebar Column (4 cols) */}
          <AnimatedSection delay={0.08} className="space-y-6 lg:col-span-4">
            {/* 1. Payment Summary Card */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-4 p-0">
                <div className="border-border/60 text-foreground flex items-center gap-2 border-b pb-3 text-sm font-bold">
                  <CreditCard className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                  <span>Payment Summary</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Fare ({booking.passengers.length} Adult)</span>
                    <span className="text-foreground font-semibold">
                      ${booking.fare.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Service Fee</span>
                    <span className="text-foreground font-semibold">
                      ${booking.serviceFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-border/60 flex items-baseline justify-between border-t pt-3">
                    <span className="text-foreground text-sm font-bold">Total Paid</span>
                    <span className="text-2xl font-black text-[#003B95] dark:text-blue-400">
                      ${booking.totalPaid.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Paid Badge Box */}
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-extrabold tracking-wide uppercase">PAID</div>
                    <div className="text-muted-foreground text-[11px]">
                      Paid successfully on {booking.paidOn}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Cancellation Policy */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-3 p-0">
                <div className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <Shield className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                  <span>Cancellation Policy</span>
                </div>

                <p className="text-muted-foreground text-xs leading-relaxed">
                  You can cancel your booking up to 2 hours before departure.
                </p>

                <Link
                  href="/help"
                  className="inline-block text-xs font-bold text-[#003B95] hover:underline dark:text-blue-400"
                >
                  View full policy &rarr;
                </Link>
              </CardContent>
            </Card>

            {/* 3. Need Help? */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-3 p-0">
                <div className="space-y-1">
                  <div className="text-foreground flex items-center gap-2 text-sm font-bold">
                    <LifeBuoy className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                    <span>Need Help?</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Our support team is here for you.</p>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    href="/help"
                    className="border-border/80 text-foreground hover:bg-muted/40 flex items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="text-primary h-4 w-4" />
                      <span>Visit Help Center</span>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </Link>

                  <a
                    href="tel:+9603331234"
                    className="border-border/80 text-foreground hover:bg-muted/40 flex items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="text-primary h-4 w-4" />
                      <span>Contact Support</span>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* 4. Actions (Change / Cancel Booking) */}
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-3 p-0">
                <h4 className="text-foreground text-sm font-bold">Actions</h4>

                <div className="space-y-2">
                  <Link
                    href={`/book`}
                    className="border-border/80 text-foreground hover:bg-muted/40 flex items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Edit className="text-muted-foreground h-3.5 w-3.5" />
                        <span>Change Booking</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] font-normal">
                        Changes allowed up to 2 hours before departure.
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    disabled={booking.status === "CANCELLED"}
                    onClick={() => setIsCancelDialogOpen(true)}
                    className="border-border/80 text-destructive hover:bg-destructive/5 flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cancel Booking</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] font-normal">
                        Cancel your trip and request a refund.
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </button>
                </div>

                <div className="text-muted-foreground pt-1 text-[10px]">
                  Cancellation conditions may apply.
                </div>
              </CardContent>
            </Card>

            {/* 5. Terminal Arrival Reminder */}
            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#EBF5FF] p-4 text-xs text-[#003B95] dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-0.5">
                <div className="font-bold">Arrive early at the terminal</div>
                <div className="text-[11px] text-blue-900/80 dark:text-blue-200/80">
                  We recommend arriving at least 30 minutes before departure time.
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking{" "}
              <span className="text-foreground font-mono font-bold">{booking.reference}</span>? Your
              seat reservation will be released immediately and eligible refunds will be processed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                Keep Booking
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              className="rounded-xl text-xs font-bold"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
