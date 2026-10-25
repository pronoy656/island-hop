"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Info, Lock, ShieldCheck } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { useTripDetailsQuery } from "@/hooks/use-trips";
import { useCreateBookingMutation } from "@/hooks/use-bookings";
import type { ICreateBookingPayload } from "@/types";
import { BookingStepperNav, BookingSummarySidebar } from "@/widgets";
import { AnimatedSection, Button, Card, CardContent, Input, Label } from "@/ui";

interface Step3PaymentPageProps {
  params: Promise<{ tripId: string }>;
}

export default function Step3PaymentPage({ params }: Step3PaymentPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [passengerCount] = useQueryState("passengers", parseAsInteger.withDefault(1));
  const [departureDate] = useQueryState("departureDate", parseAsString.withDefault(""));
  const [fromPort] = useQueryState("from", parseAsString.withDefault(""));
  const [toPort] = useQueryState("to", parseAsString.withDefault(""));

  const { data: trip } = useTripDetailsQuery(tripId);
  const createBookingMutation = useCreateBookingMutation();

  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821");
  const [cardholderName, setCardholderName] = useState("MOHAMED SOLIH");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("789");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Read saved passenger details
    let storedLeadName = "Mohamed Solih";
    let storedEmail = "traveler@islandhop.mv";
    let storedPhone = "+960 7712345";
    let storedPassengers = [
      {
        passengerName: "Mohamed Solih",
        nationality: "Maldivian",
        passportOrId: "A1234567",
        cabinClass: "STANDARD" as const,
        luggageCount: 1
      }
    ];

    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(`booking_${tripId}_passengers`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.leadName) storedLeadName = parsed.leadName;
          if (parsed.leadEmail) storedEmail = parsed.leadEmail;
          if (parsed.leadPhone) storedPhone = parsed.leadPhone;
          if (Array.isArray(parsed.passengers) && parsed.passengers.length > 0) {
            storedPassengers = parsed.passengers.map((p: any) => ({
              passengerName: p.fullName || p.passengerName || "Traveler",
              nationality: p.nationality || "Maldivian",
              passportOrId: p.passportOrId || "A998877",
              cabinClass: p.cabinClass || "STANDARD",
              luggageCount: p.luggageCount ?? 1
            }));
          }
        }
      } catch {
        // fallback
      }
    }

    const payload: ICreateBookingPayload = {
      scheduleId: tripId,
      leadPassengerName: storedLeadName,
      leadPassengerEmail: storedEmail,
      leadPassengerPhone: storedPhone,
      adultsCount: passengerCount,
      childrenCount: 0,
      passengers: storedPassengers
    };

    try {
      const response = await createBookingMutation.mutateAsync(payload);
      const bookingData = response.data;
      const ref = bookingData?.reference || "FRY-CONFIRMED";

      toast.success("Booking confirmed successfully!", {
        description: `Reference ${ref} generated with ${bookingData?.tickets?.length || passengerCount} boarding passes.`
      });

      startTransition(() => {
        router.push(
          `/book/${tripId}/confirmation?ref=${ref}&passengers=${passengerCount}&departureDate=${encodeURIComponent(
            departureDate
          )}`
        );
      });
    } catch (err: any) {
      toast.error("Payment failed", {
        description: err?.message || "Could not process booking. Please check available seats or try again."
      });
    }
  };

  const effectiveDate = departureDate || (trip?.departureTime ? trip.departureTime.split("T")[0] : "");
  let formattedDate = effectiveDate;
  try {
    const d = new Date(effectiveDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
  } catch {
    formattedDate = effectiveDate;
  }

  const depTimeDisplay = trip?.departureTime
    ? new Date(trip.departureTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "";

  const fare = trip?.adultFare ?? 25;
  const totalPrice = fare * passengerCount;

  const sidebarTripData = {
    adultFare: fare,
    departurePort: trip?.departurePort || fromPort || "Departure Port",
    arrivalPort: trip?.destinationPort || toPort || "Destination Port",
    departureTime: depTimeDisplay,
    duration: trip?.duration,
    operator: trip?.operator
  };

  const isProcessing = createBookingMutation.isPending;

  return (
    <div className="dark:bg-background min-h-screen bg-[#F8FAFC] py-20">
      {/* 1. Top Stepper Header */}
      <div className="border-border/60 dark:bg-card border-b bg-white">
        <BookingStepperNav currentStep={3} />
      </div>

      {/* 2. Main Content Grid */}
      <main className="container mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Payment Form */}
          <AnimatedSection
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6 lg:col-span-8"
          >
            {/* Header Titles */}
            <div className="space-y-1">
              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                Complete your booking
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Review your trip and complete your payment securely. Instant digital boarding passes will be issued.
              </p>
            </div>

            <form id="payment-form" onSubmit={handlePayAndConfirm} className="space-y-6">
              {/* Payment Details Card */}
              <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
                <CardContent className="space-y-5 p-0">
                  <div className="text-foreground flex items-center justify-between text-base font-bold">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#003B95]" />
                      <span>Credit or Debit Card</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Bank-Grade 256-bit SSL</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Card Number */}
                    <div className="space-y-1.5">
                      <Label className="text-foreground text-xs font-semibold">Card Number</Label>
                      <div className="relative">
                        <Input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          required
                          className="bg-card h-11 rounded-xl pr-10 text-xs font-medium font-mono"
                        />
                        <CreditCard className="text-muted-foreground absolute top-3.5 right-3.5 h-4 w-4" />
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div className="space-y-1.5">
                      <Label className="text-foreground text-xs font-semibold">
                        Cardholder Name
                      </Label>
                      <Input
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        placeholder="Name on card"
                        required
                        className="bg-card h-11 rounded-xl text-xs font-medium uppercase"
                      />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs font-semibold">Expiry Date</Label>
                        <Input
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="bg-card h-11 rounded-xl text-xs font-medium font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs font-semibold">CVV / CVC</Label>
                        <div className="relative">
                          <Input
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                            placeholder="123"
                            maxLength={4}
                            required
                            type="password"
                            className="bg-card h-11 rounded-xl pr-10 text-xs font-medium font-mono"
                          />
                          <Info className="text-muted-foreground absolute top-3.5 right-3.5 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secure Payment Guarantee */}
              <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#F0F7FF] p-4 text-[#003B95] dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                <Lock className="h-5 w-5 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold">Sandbox / Instant Payment Active</span>
                  <div className="text-muted-foreground text-xs">
                    Upon clicking &quot;Pay &amp; Confirm Booking&quot;, your reservation is recorded directly into the Maldives Port Authority database.
                  </div>
                </div>
              </div>
            </form>
          </AnimatedSection>

          {/* Right Column: Sticky Summary Sidebar */}
          <AnimatedSection delay={0.08} className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingSummarySidebar
                trip={sidebarTripData}
                passengerCount={passengerCount}
                departureDate={formattedDate}
                title="Booking Summary"
                actionButton={
                  <Button
                    type="submit"
                    form="payment-form"
                    disabled={isProcessing}
                    className="h-12 w-full rounded-xl bg-[#003B95] text-xs font-bold text-white shadow-md transition-all hover:bg-[#002f77] sm:text-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Authorizing Payment & Reserving Seats..." : `Pay $${totalPrice} & Confirm Booking`}
                  </Button>
                }
                secondaryButton={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/book/${tripId}/passengers?passengers=${passengerCount}&departureDate=${encodeURIComponent(
                          departureDate
                        )}`
                      )
                    }
                    className="border-border/80 text-muted-foreground hover:text-foreground h-11 w-full rounded-xl text-xs font-semibold"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Passengers
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
