"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Anchor,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  Compass,
  MapPin,
  QrCode,
  ShieldCheck,
  Ship,
  Users
} from "lucide-react";
import { addDays, format, isBefore, parseISO } from "date-fns";

import heroBg from "@/assets/landing-page/hero-bg.png";
import { cn } from "@/lib/utils";

import { useConnectedPortsQuery } from "@/hooks/use-routes";
import { getUniquePorts } from "@/data/ports";

import { PassengerSelector } from "@/components/widgets/booking/PassengerSelector";
import { PortCombobox, PortOption } from "@/components/widgets/booking/PortCombobox";
import { Card, CardContent, DatePicker, Label } from "@/ui";

export function HeroSection() {
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [departurePort, setDeparturePort] = useState("Malé Ferry Terminal");
  const [destinationPort, setDestinationPort] = useState("Maafushi Jetty");
  const [departureDate, setDepartureDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [returnDate, setReturnDate] = useState(() => format(addDays(new Date(), 3), "yyyy-MM-dd"));
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  const { data: connectedPorts = [], isLoading: isLoadingPorts } = useConnectedPortsQuery();

  const departureOptions: PortOption[] = useMemo(() => {
    if (connectedPorts && connectedPorts.length > 0) {
      return connectedPorts.map((cp) => ({
        id: cp.portId,
        name: cp.portName
      }));
    }
    return getUniquePorts().map((name) => ({ name }));
  }, [connectedPorts]);

  const destinationOptions: PortOption[] = useMemo(() => {
    if (connectedPorts && connectedPorts.length > 0) {
      const activeDep = connectedPorts.find(
        (cp) =>
          cp.portName.toLowerCase() === departurePort.toLowerCase() || cp.portId === departurePort
      );
      if (activeDep && activeDep.destinations && activeDep.destinations.length > 0) {
        return activeDep.destinations.map((d) => ({
          id: d.portId,
          name: d.portName
        }));
      }
    }
    return getUniquePorts()
      .filter((name) => name.toLowerCase() !== departurePort.toLowerCase())
      .map((name) => ({ name }));
  }, [connectedPorts, departurePort]);

  const handleDepartureChange = (newDeparture: string) => {
    setDeparturePort(newDeparture);
    if (connectedPorts && connectedPorts.length > 0) {
      const matched = connectedPorts.find(
        (cp) =>
          cp.portName.toLowerCase() === newDeparture.toLowerCase() || cp.portId === newDeparture
      );
      if (matched && matched.destinations && matched.destinations.length > 0) {
        const isCurrentDestValid = matched.destinations.some(
          (d) => d.portName.toLowerCase() === destinationPort.toLowerCase()
        );
        if (!isCurrentDestValid) {
          setDestinationPort(matched.destinations[0].portName);
        }
      }
    }
  };

  const handleSwapPorts = () => {
    const temp = departurePort;
    setDeparturePort(destinationPort);
    setDestinationPort(temp);
  };

  const handleDepartureDateChange = (newDate: string) => {
    setDepartureDate(newDate);
    if (returnDate && newDate) {
      const dep = parseISO(newDate);
      const ret = parseISO(returnDate);
      if (isBefore(ret, dep)) {
        setReturnDate(format(addDays(dep, 1), "yyyy-MM-dd"));
      }
    }
  };

  const totalPassengers = adults + childrenCount;
  const passengersParam = `${totalPassengers} ${totalPassengers === 1 ? "Passenger" : "Passengers"}`;

  const searchUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("tripType", tripType);
    params.set("from", departurePort);
    params.set("to", destinationPort);
    params.set("departureDate", departureDate);
    if (tripType === "round-trip") {
      let finalReturnDate = returnDate;
      if (!finalReturnDate) {
        try {
          const dep = parseISO(departureDate);
          finalReturnDate = format(addDays(dep, 3), "yyyy-MM-dd");
        } catch {
          finalReturnDate = format(addDays(new Date(), 3), "yyyy-MM-dd");
        }
      }
      params.set("returnDate", finalReturnDate);
    }
    params.set("passengers", passengersParam);
    params.set("adults", String(adults));
    params.set("children", String(childrenCount));
    return `/ferries?${params.toString()}`;
  }, [
    tripType,
    departurePort,
    destinationPort,
    departureDate,
    returnDate,
    passengersParam,
    adults,
    childrenCount
  ]);

  return (
    <section className="relative w-full">
      {/* Hero Banner Area */}
      <div
        id="book"
        className="relative flex min-h-[560px] w-full items-center overflow-hidden pt-16 pb-20 sm:min-h-[620px] sm:pt-20 sm:pb-28 lg:min-h-[680px] lg:pt-24 lg:pb-32"
      >
        {/* Full Bleed Ferry Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBg}
            alt="Ferry ship cruise on sunny tropical ocean"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle balanced gradient vignette */}
          <div className="from-background/70 via-background/35 dark:from-background/90 dark:via-background/55 absolute inset-0 bg-gradient-to-r to-transparent/10 dark:to-transparent/20" />
          <div className="from-background/40 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Content Container */}
          <div className="max-w-2xl space-y-6">
            {/* Top Pill Tag */}
            <div className="bg-background/80 dark:bg-card/85 inline-flex items-center gap-2 rounded-full border border-blue-500/30 px-4 py-1.5 text-xs font-bold tracking-wider text-blue-600 shadow-sm backdrop-blur-md dark:border-blue-400/30 dark:text-blue-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              </span>
              <Ship className="h-3.5 w-3.5" />
              <span className="font-extrabold tracking-widest uppercase">
                MALDIVES #1 FERRY NETWORK
              </span>
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
            <p className="text-foreground/80 max-w-xl text-sm leading-relaxed font-medium sm:text-base">
              Book scheduled ferries, high-speed island transfers, and scenic atoll cruises with
              live seat availability and instant digital QR boarding passes.
            </p>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="border-border/70 bg-card/90 text-foreground hover:bg-card inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-2xs backdrop-blur-md transition-all hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Compass className="h-3 w-3" />
                </div>
                <span>Live Seat Availability</span>
              </div>

              <div className="border-border/70 bg-card/90 text-foreground hover:bg-card inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-2xs backdrop-blur-md transition-all hover:shadow-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <span>Instant Guaranteed Boarding</span>
              </div>

              <div className="border-border/70 bg-card/90 text-foreground hover:bg-card inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-2xs backdrop-blur-md transition-all hover:shadow-xs">
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
        <Card className="border-border/80 bg-card/95 rounded-2xl p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition-all sm:p-6 lg:p-7">
          <CardContent className="space-y-4 p-0">
            {/* Trip Type Segmented Pills */}
            <div className="flex items-center gap-3">
              <div className="border-border/60 bg-muted/60 inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setTripType("one-way")}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 sm:px-5",
                    tripType === "one-way"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  One way
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTripType("round-trip");
                    if (!returnDate) {
                      try {
                        const dep = parseISO(departureDate);
                        setReturnDate(format(addDays(dep, 3), "yyyy-MM-dd"));
                      } catch {
                        setReturnDate(format(addDays(new Date(), 3), "yyyy-MM-dd"));
                      }
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 sm:px-5",
                    tripType === "round-trip"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  Round trip
                </button>
              </div>
            </div>

            {/* Form Fields Responsive Grid */}
            <div
              className={cn(
                "grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:items-end",
                tripType === "round-trip"
                  ? "lg:grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr_1.1fr]"
                  : "lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.1fr]"
              )}
            >
              {/* FROM */}
              <div className="min-w-0 space-y-1.5 sm:col-span-1">
                <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
                  <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>FROM</span>
                </Label>
                <div className="relative">
                  <PortCombobox
                    value={departurePort}
                    onChange={handleDepartureChange}
                    options={departureOptions}
                    isLoading={isLoadingPorts}
                    placeholder="Departure port"
                    icon={MapPin}
                    className="sm:pr-9"
                  />

                  {/* Floating Swap Button on tablet/desktop centered exactly on the input box seam */}
                  <button
                    type="button"
                    onClick={handleSwapPorts}
                    title="Swap departure and destination"
                    className="border-border/80 bg-background text-muted-foreground absolute top-1/2 left-[calc(100%+7px)] z-20 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-xs transition-all duration-300 hover:rotate-180 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-90 sm:flex dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* MOBILE SWAP BUTTON */}
              <div className="-my-1 flex justify-center sm:hidden">
                <button
                  type="button"
                  onClick={handleSwapPorts}
                  className="border-border/80 bg-background/95 text-muted-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-2xs transition-all hover:border-blue-500 hover:text-blue-600 active:scale-95"
                >
                  <ArrowUpDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Swap Direction</span>
                </button>
              </div>

              {/* TO */}
              <div className="min-w-0 space-y-1.5 sm:col-span-1">
                <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
                  <Anchor className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>TO</span>
                </Label>
                <PortCombobox
                  value={destinationPort}
                  onChange={setDestinationPort}
                  options={destinationOptions}
                  placeholder="Destination port"
                  icon={Anchor}
                  className="sm:pl-8"
                />
              </div>

              {/* TRAVEL DATE */}
              <div className="min-w-0 space-y-1.5 sm:col-span-1">
                <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>DEPARTURE DATE</span>
                </Label>
                <DatePicker
                  value={departureDate}
                  onChange={handleDepartureDateChange}
                  minDate={new Date()}
                  placeholder="Departure date"
                  className="border-input bg-muted/40 hover:bg-muted/60 text-foreground h-11 w-full rounded-xl border px-3.5 text-xs font-bold shadow-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* RETURN DATE (Round Trip Only) */}
              {tripType === "round-trip" && (
                <div className="min-w-0 space-y-1.5 sm:col-span-1">
                  <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
                    <Calendar className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    <span>RETURN DATE</span>
                  </Label>
                  <DatePicker
                    value={returnDate}
                    onChange={setReturnDate}
                    minDate={departureDate || new Date()}
                    placeholder="Return date"
                    className="border-input bg-muted/40 hover:bg-muted/60 text-foreground h-11 w-full rounded-xl border px-3.5 text-xs font-bold shadow-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}

              {/* PASSENGERS */}
              <div className="min-w-0 space-y-1.5 sm:col-span-1">
                <Label className="text-muted-foreground flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
                  <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>PASSENGERS</span>
                </Label>
                <PassengerSelector
                  adults={adults}
                  childrenCount={childrenCount}
                  onChange={({ adults: nextAdults, children: nextChildren }) => {
                    setAdults(nextAdults);
                    setChildrenCount(nextChildren);
                  }}
                />
              </div>

              {/* SEARCH FERRIES ACTION BUTTON */}
              <div
                className={cn(
                  "min-w-0 space-y-1.5",
                  tripType === "round-trip"
                    ? "sm:col-span-2 lg:col-span-1"
                    : "sm:col-span-2 lg:col-span-1"
                )}
              >
                <Label
                  className="text-muted-foreground invisible hidden items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase select-none lg:flex"
                  aria-hidden="true"
                >
                  <span className="inline-block h-3 w-3" />
                  <span>SEARCH</span>
                </Label>
                <Link
                  href={searchUrl}
                  className="group flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-xs font-bold whitespace-nowrap text-white shadow-md shadow-blue-600/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-600/35 active:scale-[0.98] sm:text-sm"
                >
                  <span>Search Ferries</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
