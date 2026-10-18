"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Mail,
  QrCode,
  Search,
  Smartphone,
  Sparkles,
  Ticket,
  User
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@/ui";

export function ManageBookingSection() {
  const [bookingRef, setBookingRef] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const targetUrl = bookingRef.trim()
    ? `/manage-booking/${encodeURIComponent(bookingRef.trim().toUpperCase())}`
    : "/manage-booking";

  const handleQuickDemoRef = () => {
    setBookingRef("FRY-8842");
    setContactInfo("passenger@islandhop.mv");
  };

  return (
    <section id="manage-booking" className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-muted/30 via-card/50 to-muted/20 p-6 sm:p-10 lg:p-14 shadow-xs">
          {/* Subtle Ambient Background Decorative Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-6">
              {/* Top Pill Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase shadow-xs dark:text-blue-400">
                <Ticket className="h-3.5 w-3.5" />
                <span>SELF-SERVICE PASSENGER PORTAL</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                Your whole journey, <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
                  managed in seconds
                </span>
                .
              </h2>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal max-w-lg">
                Need to retrieve your digital boarding pass, change your departure time, upgrade to open sun deck, or add luggage? It takes under 30 seconds.
              </p>

              {/* Feature Points Cards */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Re-download QR e-ticket</span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Change departure time</span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Modify passenger names</span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Live weather status updates</span>
                </div>
              </div>
            </div>

            {/* Right Card: Manage Your Booking */}
            <div className="lg:col-span-6">
              <Card className="border-border/80 bg-card rounded-3xl border p-6 shadow-xl sm:p-8 transition-all">
                <CardHeader className="p-0 pb-6 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                        <Ticket className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">
                        Manage your booking
                      </CardTitle>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickDemoRef}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Try demo ID
                    </button>
                  </div>
                  <CardDescription className="text-xs font-medium text-muted-foreground">
                    Retrieve your e-ticket or change passenger seats with your booking reference.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 p-0">
                  {/* Booking Reference Field */}
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <Ticket className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>BOOKING REFERENCE (e.g. FRY-8842)</span>
                    </Label>
                    <Input
                      placeholder="e.g. FRY-8842"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      className="border-input bg-muted/40 hover:bg-muted/60 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-11 rounded-xl text-xs font-bold text-foreground transition-all uppercase tracking-wider"
                    />
                  </div>

                  {/* Email / Phone Field */}
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>EMAIL OR PHONE NUMBER</span>
                    </Label>
                    <Input
                      placeholder="Enter booking contact email or phone"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="border-input bg-muted/40 hover:bg-muted/60 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-11 rounded-xl text-xs font-bold text-foreground transition-all"
                    />
                  </div>

                  {/* Find Booking Action Button */}
                  <div className="pt-2">
                    <Button
                      size="lg"
                      className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
                      asChild
                    >
                      <Link href={targetUrl} className="flex items-center justify-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>Find My Trip</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Footer Account Link */}
                  <div className="text-muted-foreground pt-3 text-center text-xs font-medium border-t border-border/60">
                    Frequent traveler?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors"
                    >
                      Sign in to view all trip passes →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
