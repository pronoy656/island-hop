"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ArrowLeft, ArrowRight, Mail, Phone, User } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { AVAILABLE_FERRIES } from "@/data/ferries";

import { BookingStepperNav, BookingSummarySidebar } from "@/widgets";
import { AnimatedSection, Button, Card, CardContent, Input } from "@/ui";

interface Step2PassengersPageProps {
  params: Promise<{ tripId: string }>;
}

interface PassengerInput {
  firstName: string;
  lastName: string;
}

export default function Step2PassengersPage({ params }: Step2PassengersPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [passengerCount] = useQueryState("passengers", parseAsInteger.withDefault(1));
  const [departureDate] = useQueryState("departureDate", parseAsString.withDefault("2026-05-24"));

  const trip = AVAILABLE_FERRIES.find((t) => t.id === tripId) || AVAILABLE_FERRIES[0];

  // Dynamic passengers state based on count
  const [passengers, setPassengers] = useState<PassengerInput[]>(() =>
    Array.from({ length: passengerCount }, (_, i) => ({
      firstName: i === 0 ? "Jane" : "Passenger",
      lastName: i === 0 ? "Doe" : `${i + 1}`
    }))
  );

  const [prevCount, setPrevCount] = useState(passengerCount);
  if (prevCount !== passengerCount) {
    setPrevCount(passengerCount);
    setPassengers((prev) =>
      Array.from({ length: passengerCount }, (_, i) => ({
        firstName: prev[i]?.firstName || (i === 0 ? "Jane" : "Passenger"),
        lastName: prev[i]?.lastName || (i === 0 ? "Doe" : `${i + 1}`)
      }))
    );
  }

  const [email, setEmail] = useState("jane@example.com");
  const [phone, setPhone] = useState("+1 (555) 000-0000");

  const handlePassengerChange = (index: number, field: "firstName" | "lastName", value: string) => {
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
        `booking_${trip.id}_passengers`,
        JSON.stringify({
          passengers,
          email,
          phone
        })
      );
    }

    startTransition(() => {
      router.push(
        `/book/${trip.id}/payment?passengers=${passengerCount}&departureDate=${encodeURIComponent(
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
                Enter the passenger details for everyone included in this booking.
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
                    <div className="text-foreground flex items-center gap-2 border-l-2 border-[#003B95] pl-3 text-sm font-bold">
                      <User className="h-4 w-4 text-[#003B95]" />
                      <span>Passenger {idx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-foreground text-xs font-semibold">First Name</label>
                        <Input
                          value={passenger.firstName}
                          onChange={(e) => handlePassengerChange(idx, "firstName", e.target.value)}
                          placeholder="e.g. Jane"
                          required
                          className="bg-card h-11 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-foreground text-xs font-semibold">Last Name</label>
                        <Input
                          value={passenger.lastName}
                          onChange={(e) => handlePassengerChange(idx, "lastName", e.target.value)}
                          placeholder="e.g. Doe"
                          required
                          className="bg-card h-11 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Booking Contact Card */}
              <Card className="border-border/80 dark:bg-card rounded-2xl border bg-white p-6 shadow-sm">
                <CardContent className="space-y-4 p-0">
                  <div className="space-y-1">
                    <h3 className="text-foreground text-base font-bold">Booking contact</h3>
                    <p className="text-muted-foreground text-xs">
                      We&apos;ll use these details for your booking and important trip updates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-foreground text-xs font-semibold">Email Address</label>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-foreground text-xs font-semibold">Phone Number</label>
                      <div className="relative">
                        <Phone className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
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
                trip={trip}
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
                        `/book/${trip.id}/review?passengers=${passengerCount}&departureDate=${encodeURIComponent(
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
