"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ArrowLeft, CreditCard, Info, Lock } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { AVAILABLE_FERRIES } from "@/data/ferries";

import { BookingStepperNav, BookingSummarySidebar } from "@/widgets";
import { AnimatedSection, Button, Card, CardContent, Input } from "@/ui";

interface Step3PaymentPageProps {
  params: Promise<{ tripId: string }>;
}

export default function Step3PaymentPage({ params }: Step3PaymentPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [passengerCount] = useQueryState("passengers", parseAsInteger.withDefault(1));
  const [departureDate] = useQueryState("departureDate", parseAsString.withDefault("2026-05-24"));

  const trip = AVAILABLE_FERRIES.find((t) => t.id === tripId) || AVAILABLE_FERRIES[0];

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handlePayAndConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Mock generation of booking reference
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingRef = `FRY${randomSuffix}`;

    setTimeout(() => {
      startTransition(() => {
        router.push(
          `/book/${trip.id}/confirmation?ref=${bookingRef}&passengers=${passengerCount}&departureDate=${encodeURIComponent(
            departureDate
          )}`
        );
      });
    }, 800);
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

  const totalPrice = trip.price * passengerCount;

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
                Review your trip and complete your payment securely.
              </p>
            </div>

            <form id="payment-form" onSubmit={handlePayAndConfirm} className="space-y-6">
              {/* Payment Details Card */}
              <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
                <CardContent className="space-y-5 p-0">
                  <div className="text-foreground flex items-center gap-2 text-base font-bold">
                    <CreditCard className="h-4 w-4 text-[#003B95]" />
                    <span>Payment Details</span>
                  </div>

                  <div className="space-y-4">
                    {/* Card Number */}
                    <div className="space-y-1.5">
                      <label className="text-foreground text-xs font-semibold">Card Number</label>
                      <div className="relative">
                        <Input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          required
                          className="bg-card h-11 rounded-xl pr-10 text-xs font-medium"
                        />
                        <CreditCard className="text-muted-foreground absolute top-3.5 right-3.5 h-4 w-4" />
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div className="space-y-1.5">
                      <label className="text-foreground text-xs font-semibold">
                        Cardholder Name
                      </label>
                      <Input
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="Name on card"
                        required
                        className="bg-card h-11 rounded-xl text-xs font-medium"
                      />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-foreground text-xs font-semibold">Expiry Date</label>
                        <Input
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="bg-card h-11 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-foreground text-xs font-semibold">CVV</label>
                        <div className="relative">
                          <Input
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                            placeholder="123"
                            maxLength={4}
                            required
                            type="password"
                            className="bg-card h-11 rounded-xl pr-10 text-xs font-medium"
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
                  <span className="font-bold">Secure Payment</span>
                  <div className="text-muted-foreground text-xs">
                    Your payment information is encrypted and protected.
                  </div>
                </div>
              </div>
            </form>
          </AnimatedSection>

          {/* Right Column: Sticky Summary Sidebar */}
          <AnimatedSection delay={0.08} className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingSummarySidebar
                trip={trip}
                passengerCount={passengerCount}
                departureDate={formattedDate}
                title="Booking Summary"
                actionButton={
                  <Button
                    type="submit"
                    form="payment-form"
                    disabled={isProcessing}
                    className="h-12 w-full rounded-xl bg-[#003B95] text-xs font-bold text-white shadow-md transition-all hover:bg-[#002f77] sm:text-sm"
                  >
                    {isProcessing ? "Processing..." : `Pay $${totalPrice} & Confirm Booking`}
                  </Button>
                }
                secondaryButton={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/book/${trip.id}/passengers?passengers=${passengerCount}&departureDate=${encodeURIComponent(
                          departureDate
                        )}`
                      )
                    }
                    className="border-border/80 text-muted-foreground hover:text-foreground h-11 w-full rounded-xl text-xs font-semibold"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
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
