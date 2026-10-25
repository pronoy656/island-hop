import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import heroBg from "@/assets/landing-page/hero-bg.png";
import { BookingResultsList, BookingSearchFilterBar } from "@/widgets";
import { AnimatedSection, Badge } from "@/ui";

export const metadata: Metadata = {
  title: "Available Ferries | IslandHop",
  description: "Browse and select from available ferry trips matching your journey."
};

export default function FerriesPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
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
              sizes="100vw"
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
        <Suspense fallback={<div className="h-28 rounded-2xl bg-card animate-pulse" />}>
          <BookingSearchFilterBar />
        </Suspense>
      </AnimatedSection>

      {/* 3. Search Results & Ferry Trip Cards List */}
      <main className="container mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 w-48 rounded bg-muted animate-pulse" />
              <div className="h-44 w-full rounded-2xl bg-card border border-border animate-pulse" />
            </div>
          }
        >
          <BookingResultsList />
        </Suspense>
      </main>
    </div>
  );
}
