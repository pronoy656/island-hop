"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Search,
  Smartphone,
  Ticket
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
    ? `/manage-booking/${encodeURIComponent(bookingRef.trim())}`
    : "/manage-booking";

  return (
    <section id="manage-booking" className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-muted/30 via-card/40 to-muted/20 p-6 sm:p-10 lg:p-14 shadow-xs">
          {/* Subtle Ambient Background Decorative Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-6">
              {/* Top Pill Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase shadow-xs">
                <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Everything in One Place</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
                Your whole journey, <br />
                <span className="text-blue-600 dark:text-blue-400">
                  right in your pocket
                </span>
                .
              </h2>

              {/* Subtitle Description */}
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg font-normal">
                From finding your ferry to showing your ticket at boarding, everything you need travels with you.
              </p>

              {/* Feature Points Cards */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Search routes and schedules</span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Select available seats</span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Keep tickets in one place</span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 shadow-2xs transition-all hover:bg-card hover:border-blue-500/30">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Receive important trip updates</span>
                </div>
              </div>
            </div>

            {/* Right Card: Manage Your Booking */}
            <div className="lg:col-span-6">
              <Card className="border-border/80 bg-card rounded-2xl border p-6 shadow-xl sm:p-8 transition-all">
                <CardHeader className="p-0 pb-6 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">
                      Manage your booking
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs font-medium text-muted-foreground">
                    Retrieve your e-ticket or change passenger seats
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 p-0">
                  {/* Booking Reference Field */}
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                      <Ticket className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>BOOKING REFERENCE</span>
                    </Label>
                    <Input
                      placeholder="e.g. FRY24821"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      className="border-input bg-muted/40 hover:bg-muted/60 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-11 rounded-xl text-xs font-bold text-foreground transition-all uppercase tracking-wider"
                    />
                  </div>

                  {/* Email / Phone Field */}
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>EMAIL / PHONE</span>
                    </Label>
                    <Input
                      placeholder="Enter booking contact"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="border-input bg-muted/40 hover:bg-muted/60 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-11 rounded-xl text-xs font-bold text-foreground transition-all"
                    />
                  </div>

                  {/* Find Booking Action Button */}
                  <div className="pt-2">
                    <Button
                      size="lg"
                      className="group relative h-11 w-full overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
                      asChild
                    >
                      <Link href={targetUrl} className="flex items-center justify-center gap-2">
                        <Search className="h-4 w-4" />
                        <span>Find Booking</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Footer Account Link */}
                  <div className="text-muted-foreground pt-3 text-center text-xs font-medium">
                    Have an account?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors"
                    >
                      Log in to see all trips →
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

