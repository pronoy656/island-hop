"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  Compass,
  MapPin,
  QrCode,
  ShieldCheck,
  Ship,
  Sparkles,
  Users
} from "lucide-react";

import heroBg from "@/assets/landing-page/hero-bg.png";
import { PortCombobox } from "@/components/widgets/booking/PortCombobox";
import {
  Button,
  Card,
  CardContent,
  DatePicker,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/ui";
import { cn } from "@/lib/utils";

const QUICK_ROUTES = [
  { from: "Malé (Villingili Terminal)", to: "Maafushi Island Port", label: "Malé ⇄ Maafushi" },
  { from: "Malé (Villingili Terminal)", to: "Thulusdhoo Island Port", label: "Malé ⇄ Thulusdhoo" },
  { from: "Malé (Villingili Terminal)", to: "Dhiffushi Port", label: "Malé ⇄ Dhiffushi" },
  { from: "Malé (Villingili Terminal)", to: "Gulhi Harbor", label: "Malé ⇄ Gulhi" }
];

export function HeroSection() {
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [departurePort, setDeparturePort] = useState("Malé (Villingili Terminal)");
  const [destinationPort, setDestinationPort] = useState("Maafushi Island Port");
  const [departureDate, setDepartureDate] = useState("2026-08-25");
  const [passengers, setPassengers] = useState("1 Passenger");

  const handleSwapPorts = () => {
    const temp = departurePort;
    setDeparturePort(destinationPort);
    setDestinationPort(temp);
  };

  const handleQuickRouteSelect = (from: string, to: string) => {
    setDeparturePort(from);
    setDestinationPort(to);
  };

  return (
    <section className="relative w-full">
      {/* Hero Banner Area */}
      <div
        id="book"
        className="relative flex min-h-[580px] w-full items-center overflow-hidden pt-28 pb-24 sm:min-h-[640px] sm:pt-36 sm:pb-32 lg:min-h-[720px] lg:pt-40 lg:pb-36"
      >
        {/* Full Bleed Ferry Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBg}
            alt="Ferry ship cruise on sunny tropical ocean"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle balanced gradient vignette so the ocean and ferry photo shine through vividly */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/35 to-transparent/10 dark:from-background/90 dark:via-background/55 dark:to-transparent/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Content Container */}
          <div className="max-w-2xl space-y-6">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-background/80 px-4 py-1.5 text-xs font-bold tracking-wider text-blue-600 shadow-sm backdrop-blur-md dark:border-blue-400/30 dark:bg-card/85 dark:text-blue-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              </span>
              <Ship className="h-3.5 w-3.5" />
              <span className="uppercase tracking-widest font-extrabold">MALDIVES #1 FERRY NETWORK</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl lg:text-[60px] lg:leading-[1.08]">
              Across the water, <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-sky-400">
                without the hassle
              </span>
              .
            </h1>

            {/* Description Subtitle */}
            <p className="text-foreground/80 max-w-xl text-sm font-medium leading-relaxed sm:text-base">
              Book scheduled ferries, high-speed island transfers, and scenic atoll cruises with live seat availability and instant digital QR boarding passes.
            </p>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs backdrop-blur-md transition-all hover:bg-card hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Compass className="h-3 w-3" />
                </div>
                <span>Live Seat Availability</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs backdrop-blur-md transition-all hover:bg-card hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <span>Instant Guaranteed Boarding</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs backdrop-blur-md transition-all hover:bg-card hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <QrCode className="h-3 w-3" />
                </div>
                <span>Direct Mobile QR Pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Bar Card */}
      <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:-mt-12 sm:px-6 lg:-mt-14 lg:px-8">
        <Card className="border-border/80 bg-card/95 rounded-2xl p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-all sm:p-7">
          <CardContent className="space-y-4 p-0">
            {/* Trip Type Segmented Pills & Live Trip Helper */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 p-1 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setTripType("one-way")}
                  className={cn(
                    "cursor-pointer rounded-full px-5 py-1.5 text-xs font-bold transition-all duration-200",
                    tripType === "one-way"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  One way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("round-trip")}
                  className={cn(
                    "cursor-pointer rounded-full px-5 py-1.5 text-xs font-bold transition-all duration-200",
                    tripType === "round-trip"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  Round trip
                </button>
              </div>

              {/* Verified Trust Strip */}
              <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Over <strong>120+ Daily Trips</strong> Available</span>
              </div>
            </div>

            {/* Form Fields Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
              {/* FROM */}
              <div className="space-y-1.5 lg:col-span-3">
                <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                  <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>FROM (DEPARTURE)</span>
                </Label>
                <PortCombobox
                  value={departurePort}
                  onChange={setDeparturePort}
                  placeholder="Departure port"
                  icon={MapPin}
                />
              </div>

              {/* SWAP BUTTON */}
              <div className="hidden lg:col-span-1 lg:flex lg:items-center lg:justify-center lg:pb-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSwapPorts}
                  title="Swap ports"
                  className="border-border/80 bg-background text-muted-foreground hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 h-9 w-9 rounded-full shadow-xs transition-all duration-300 hover:rotate-180"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* TO */}
              <div className="space-y-1.5 lg:col-span-3">
                <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                  <Anchor className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>TO (DESTINATION)</span>
                </Label>
                <PortCombobox
                  value={destinationPort}
                  onChange={setDestinationPort}
                  placeholder="Destination"
                  icon={Anchor}
                />
              </div>

              {/* DEPARTURE */}
              <div className="space-y-1.5 lg:col-span-2">
                <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>TRAVEL DATE</span>
                </Label>
                <DatePicker
                  value={departureDate}
                  onChange={setDepartureDate}
                  placeholder="Departure date"
                  className="border-input bg-muted/40 hover:bg-muted/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-11 w-full rounded-xl px-3.5 text-xs font-bold text-foreground transition-all shadow-none"
                />
              </div>

              {/* PASSENGERS & SEARCH CTA */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                      <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>PASSENGERS</span>
                    </Label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="border-input bg-muted/40 hover:bg-muted/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-11 w-full rounded-xl px-3.5 text-xs font-bold text-foreground transition-all shadow-none">
                        <div className="flex items-center gap-2 truncate">
                          <Users className="text-muted-foreground h-4 w-4 shrink-0" />
                          <SelectValue placeholder="Select passengers" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 Passenger">1 Passenger</SelectItem>
                        <SelectItem value="2 Passengers">2 Passengers</SelectItem>
                        <SelectItem value="3 Passengers">3 Passengers</SelectItem>
                        <SelectItem value="4+ Group">4+ Group Passengers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Ferries Action Button */}
                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/35 active:scale-[0.98]"
                      asChild
                    >
                      <Link
                        href={`/book?tripType=${encodeURIComponent(tripType)}&from=${encodeURIComponent(departurePort)}&to=${encodeURIComponent(destinationPort)}&departureDate=${encodeURIComponent(departureDate)}&passengers=${encodeURIComponent(passengers)}`}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <span>Search Ferries</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Route Shortcut Chips */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-muted-foreground">
                Popular Quick Routes:
              </span>
              {QUICK_ROUTES.map((route) => (
                <button
                  key={route.label}
                  type="button"
                  onClick={() => handleQuickRouteSelect(route.from, route.to)}
                  className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
