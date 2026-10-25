"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Luggage, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useTripDetailsQuery } from "@/hooks/use-trips";
import { BookingStepperNav, BookingSummarySidebar } from "@/widgets";
import { AnimatedSection, Button, Card, CardContent, Input, Label } from "@/ui";

interface Step2PassengersPageProps {
  params: Promise<{ tripId: string }>;
}

export interface DetailedPassengerInput {
  fullName: string;
  nationality: string;
  passportOrId: string;
  cabinClass: "STANDARD" | "BUSINESS" | "VIP";
  luggageCount: number;
}

export default function Step2PassengersPage({ params }: Step2PassengersPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [passengerCount] = useQueryState("passengers", parseAsInteger.withDefault(1));
  const [departureDate] = useQueryState("departureDate", parseAsString.withDefault(""));
  const [fromPort] = useQueryState("from", parseAsString.withDefault(""));
  const [toPort] = useQueryState("to", parseAsString.withDefault(""));

  const { data: trip } = useTripDetailsQuery(tripId);

  // Dynamic passengers state based on count
  const [passengers, setPassengers] = useState<DetailedPassengerInput[]>(() =>
    Array.from({ length: passengerCount }, (_, i) => ({
      fullName: i === 0 ? "Mohamed Solih" : `Traveler ${i + 1}`,
      nationality: "Maldivian",
      passportOrId: `A${Math.floor(100000 + Math.random() * 900000)}`,
      cabinClass: "STANDARD",
      luggageCount: 1
    }))
  );

  const [prevCount, setPrevCount] = useState(passengerCount);
  if (prevCount !== passengerCount) {
    setPrevCount(passengerCount);
    setPassengers((prev) =>
      Array.from({ length: passengerCount }, (_, i) => ({
        fullName: prev[i]?.fullName || (i === 0 ? "Mohamed Solih" : `Traveler ${i + 1}`),
        nationality: prev[i]?.nationality || "Maldivian",
        passportOrId: prev[i]?.passportOrId || `A${Math.floor(100000 + Math.random() * 900000)}`,
        cabinClass: prev[i]?.cabinClass || "STANDARD",
        luggageCount: prev[i]?.luggageCount ?? 1
      }))
    );
  }

  const [leadEmail, setLeadEmail] = useState("traveler@islandhop.mv");
  const [leadPhone, setLeadPhone] = useState("+960 7712345");

  const handlePassengerChange = <K extends keyof DetailedPassengerInput>(
    index: number,
    field: K,
    value: DetailedPassengerInput[K]
  ) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `booking_${tripId}_passengers`,
        JSON.stringify({
          leadName: passengers[0]?.fullName || "Lead Traveler",
          leadEmail,
          leadPhone,
          passengers
        })
      );
    }

    startTransition(() => {
      router.push(
        `/book/${tripId}/payment?passengers=${passengerCount}&departureDate=${encodeURIComponent(
          departureDate
        )}&from=${encodeURIComponent(fromPort)}&to=${encodeURIComponent(toPort)}`
      );
    });
  };

  // Format date display
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

  const sidebarTripData = {
    adultFare: trip?.adultFare ?? 25,
    departurePort: trip?.departurePort || fromPort || "Departure Port",
    arrivalPort: trip?.destinationPort || toPort || "Destination Port",
    departureTime: depTimeDisplay,
    duration: trip?.duration,
    operator: trip?.operator
  };

  return (
    <div className="dark:bg-background min-h-screen bg-[#F8FAFC] py-20">
      {/* 1. Top Stepper Header */}
      <div className="border-border/60 dark:bg-card border-b bg-white">
        <BookingStepperNav currentStep={2} />
      </div>

      {/* 2. Main Content Grid */}
      <main className="container mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Passenger Info Form */}
          <AnimatedSection
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6 lg:col-span-8"
          >
            {/* Header Titles */}
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold tracking-wider text-[#003B95] uppercase dark:text-blue-400">
                PASSENGER INFORMATION
              </div>
              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                Who&apos;s travelling?
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Required for Coast Guard manifest and digital boarding pass generation.
              </p>
            </div>

            <form id="passenger-form" onSubmit={handleContinue} className="space-y-6">
              {/* Dynamic Passenger Cards */}
              {passengers.map((passenger, idx) => (
                <Card
                  key={idx}
                  className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <CardContent className="space-y-4 p-0">
                    <div className="text-foreground flex items-center justify-between border-l-2 border-[#003B95] pl-3 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#003B95]" />
                        <span>Passenger {idx + 1} {idx === 0 && "(Lead Traveler)"}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                        Seat Guaranteed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-foreground text-xs font-semibold">Full Legal Name</Label>
                        <Input
                          value={passenger.fullName}
                          onChange={(e) => handlePassengerChange(idx, "fullName", e.target.value)}
                          placeholder="e.g. Mohamed Solih"
                          required
                          className="bg-card h-11 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs font-semibold">Nationality</Label>
                        <Input
                          value={passenger.nationality}
                          onChange={(e) => handlePassengerChange(idx, "nationality", e.target.value)}
                          placeholder="e.g. Maldivian"
                          required
                          className="bg-card h-11 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs font-semibold">National ID / Passport Number</Label>
                        <Input
                          value={passenger.passportOrId}
                          onChange={(e) => handlePassengerChange(idx, "passportOrId", e.target.value)}
                          placeholder="e.g. A1234567"
                          required
                          className="bg-card h-11 rounded-xl text-xs font-medium uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs font-semibold">Cabin Class</Label>
                        <select
                          value={passenger.cabinClass}
                          onChange={(e) =>
                            handlePassengerChange(
                              idx,
                              "cabinClass",
                              e.target.value as "STANDARD" | "BUSINESS" | "VIP"
                            )
                          }
                          className="w-full bg-card border border-input h-11 rounded-xl text-xs font-semibold px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="STANDARD">Standard Class (Air-conditioned)</option>
                          <option value="BUSINESS">Business Upper Deck</option>
                          <option value="VIP">VIP Lounge Cabin</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs font-semibold">Luggage Allowance</Label>
                        <select
                          value={passenger.luggageCount}
                          onChange={(e) =>
                            handlePassengerChange(idx, "luggageCount", parseInt(e.target.value, 10))
                          }
                          className="w-full bg-card border border-input h-11 rounded-xl text-xs font-semibold px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value={1}>1 Check-in Bag (up to 20kg)</option>
                          <option value={2}>2 Check-in Bags (up to 40kg)</option>
                          <option value={3}>3+ Heavy Cargo / Dive Equipment</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Booking Contact Card */}
              <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
                <CardContent className="space-y-4 p-0">
                  <div className="space-y-1">
                    <h3 className="text-foreground text-base font-bold">Booking Contact &amp; Boarding Pass Delivery</h3>
                    <p className="text-muted-foreground text-xs">
                      We will send your digital boarding passes, gate alerts, and payment receipts here.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-foreground text-xs font-semibold">Email Address</Label>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
                        <Input
                          type="email"
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          placeholder="traveler@islandhop.mv"
                          required
                          className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-foreground text-xs font-semibold">Phone Number (with country code)</Label>
                      <div className="relative">
                        <Phone className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
                        <Input
                          type="tel"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          placeholder="+960 7712345"
                          required
                          className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </AnimatedSection>

          {/* Right Column: Sticky Summary Sidebar */}
          <AnimatedSection delay={0.08} className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingSummarySidebar
                trip={sidebarTripData}
                passengerCount={passengerCount}
                departureDate={formattedDate}
                actionButton={
                  <Button
                    type="submit"
                    form="passenger-form"
                    className="h-12 w-full rounded-xl bg-[#003B95] text-xs font-bold text-white shadow-md transition-all hover:bg-[#002f77] sm:text-sm"
                  >
                    Continue to Payment <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                }
                secondaryButton={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/book/${tripId}/review?passengers=${passengerCount}&departureDate=${encodeURIComponent(
                          departureDate
                        )}`
                      )
                    }
                    className="border-border/80 text-muted-foreground hover:text-foreground h-11 w-full rounded-xl text-xs font-semibold"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Review
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
