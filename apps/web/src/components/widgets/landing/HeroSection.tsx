"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Anchor,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  MapPin,
  QrCode,
  ShieldCheck,
  Ship,
  Users
} from "lucide-react";

import heroBg from "@/assets/landing-page/hero-bg.png";

import { PortCombobox } from "@/components/widgets/booking/PortCombobox";
import {
  Button,
  Card,
  CardContent,
  DatePicker,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/ui";
import { cn } from "@/lib/utils";

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

  return (
    <section className="relative w-full">
      {/* Hero Banner Area */}
      <div
        id="book"
        className="relative w-full overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center pt-28 pb-24 sm:pt-36 sm:pb-32 lg:pt-40 lg:pb-36"
      >
        {/* Full Bleed Ferry Background Image - 100% Clear */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBg}
            alt="Ferry ship cruise on sunny ocean"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Typography Container */}
          <div className="max-w-2xl space-y-6">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-600/30 bg-card/90 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 shadow-xs backdrop-blur-md uppercase">
              <Ship className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>FERRY TRAVEL, MADE SIMPLE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.1]">
              Across the water, <br />
              <span className="text-blue-600 dark:text-blue-400">
                without the hassle
              </span>
              .
            </h1>

            {/* Description Subtitle */}
            <p className="text-foreground/80 max-w-lg text-sm font-medium leading-relaxed sm:text-base">
              Find your route, compare ferry schedules and reserve your seat in one simple booking experience.
            </p>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs backdrop-blur-md transition-all hover:bg-card hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Ship className="h-3 w-3" />
                </div>
                <span>Live seat availability</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs backdrop-blur-md transition-all hover:bg-card hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <span>Secure payments</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs backdrop-blur-md transition-all hover:bg-card hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <QrCode className="h-3 w-3" />
                </div>
                <span>Instant e-tickets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Bar Card */}
      <div className="relative z-20 mx-auto -mt-10 sm:-mt-12 lg:-mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="border-border/70 bg-card/95 rounded-2xl p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-7 transition-all">
          <CardContent className="p-0">
            {/* Trip Type Segmented Pills */}
            <div className="mb-5 flex items-center">
              <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 p-1 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setTripType("one-way")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                    tripType === "one-way"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  One way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("round-trip")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                    tripType === "round-trip"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  Round trip
                </button>
              </div>
            </div>

            {/* Form Fields Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
              {/* FROM */}
              <div className="space-y-1.5 lg:col-span-3">
                <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>FROM</span>
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
                <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                  <Anchor className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>TO</span>
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
                <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>DEPARTURE</span>
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
                    <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
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
                        <SelectItem value="4+ Group">4+ Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Ferries Action Button */}
                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="group relative h-11 overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-700 px-5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/35 active:scale-[0.98]"
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

