import type { Metadata } from "next";
import Image from "next/image";

import type { SearchParams } from "nuqs/server";

import { bookingSearchParamsCache } from "@/schemas/booking-params";

import heroBg from "@/assets/landing-page/hero-bg.png";

import { AVAILABLE_FERRIES } from "@/data";

import { BookingSearchFilterBar, BookingValueProps, FerryCard } from "@/widgets";
import { AnimatedSection, Badge } from "@/ui";

export const metadata: Metadata = {
  title: "Available Ferries | IslandHop",
  description: "Browse and select from available ferry trips matching your journey."
};

interface BookPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const { from, to, departureDate, passengers } =
    await bookingSearchParamsCache.parse(searchParams);

  // Format date for readable display (e.g. "Sat, 24 May 2026")
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
    <div className="flex min-h-screen flex-col py-16">
      {/* 1. Top Hero Section with Ferry Banner */}
      <AnimatedSection initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} delay={0}>
        <section className="bg-background relative w-full overflow-hidden pt-12 pb-24 md:pt-16 md:pb-28">
          {/* Background Ferry Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
              alt="Available Ferries on blue ocean"
              fill
              priority
              className="object-cover object-right"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="from-background via-background/10 to-background/20 md:via-background/80 absolute inset-0 bg-gradient-to-r md:hidden" />
          </div>

          <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl space-y-3">
              <Badge
                variant="outline"
                className="border-primary/30 bg-card/60 text-primary w-fit text-xs font-semibold backdrop-blur-sm"
              >
                SEARCH RESULTS
              </Badge>

              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-5xl">
                Available Ferries
              </h1>

              <p className="text-muted-foreground text-sm sm:text-base">
                Choose from the available trips below for your journey.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* 2. Floating Search Filter Bar */}
      <AnimatedSection
        delay={0.05}
        className="relative z-20 mx-auto -mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <BookingSearchFilterBar />
      </AnimatedSection>

      {/* 3. Search Results & Ferry Trip Cards List */}
      <main className="container mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Summary Header */}
        <AnimatedSection delay={0.05} className="mb-6 space-y-1">
          <div className="text-primary text-xs font-extrabold tracking-wider uppercase">
            AVAILABLE FERRIES
          </div>
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Choose your ferry
          </h2>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="text-foreground font-semibold">
              {from} &rarr; {to}
            </span>
            <span>&bull;</span>
            <span>{formattedDate}</span>
            <span>&bull;</span>
            <span>{passengers}</span>
          </div>
          <div className="text-muted-foreground pt-1 text-[11px] font-bold uppercase">
            {AVAILABLE_FERRIES.length} TRIPS AVAILABLE
          </div>
        </AnimatedSection>

        {/* List of Ferry Cards */}
        <AnimatedSection delay={0.1} className="space-y-4">
          {AVAILABLE_FERRIES.map((trip) => (
            <FerryCard key={trip.id} trip={trip} />
          ))}
        </AnimatedSection>

        {/* 4. Bottom Value Proposition Grid */}
        <AnimatedSection delay={0.1} className="mt-14">
          <BookingValueProps />
        </AnimatedSection>
      </main>
    </div>
  );
}
