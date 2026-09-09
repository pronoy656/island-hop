"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Luggage,
  Sparkles,
  Star,
  Waves,
  Wifi,
  Wind
} from "lucide-react";

import maldivesImg from "@/assets/landing-page/maldives.png";
import seaplaneImg from "@/assets/landing-page/seaplane.png";
import tropicalImg from "@/assets/landing-page/tropical.png";
import whiteSandImg from "@/assets/landing-page/whiteSand.png";

import { Button } from "@/ui";
import { cn } from "@/lib/utils";

export const POPULAR_JOURNEYS = [
  {
    id: "journey-1",
    from: "Malé",
    to: "Maafushi",
    duration: "Approx. 35 min",
    price: 30,
    frequency: "6 Daily Trips",
    tag: "Most Popular",
    tagColor: "bg-blue-600 text-white",
    rating: 4.9,
    reviews: 620,
    highlights: ["Air Conditioned", "Fast Speedboat", "Free 20kg Bag"],
    category: "speedboat",
    image: maldivesImg,
    imageAlt: "Aerial view of Malé to Maafushi turquoise atoll"
  },
  {
    id: "journey-2",
    from: "Malé",
    to: "Thulusdhoo",
    duration: "Approx. 45 min",
    price: 30,
    frequency: "4 Daily Trips",
    tag: "Surfing Hotspot",
    tagColor: "bg-emerald-600 text-white",
    rating: 4.8,
    reviews: 410,
    highlights: ["Surfboard Allowed", "Scenic Deck", "Fast WiFi"],
    category: "speedboat",
    image: tropicalImg,
    imageAlt: "Tropical island palm trees and white sand beach"
  },
  {
    id: "journey-3",
    from: "Malé",
    to: "Dhiffushi",
    duration: "Approx. 40 min",
    price: 30,
    frequency: "4 Daily Trips",
    tag: "Lagoon Escape",
    tagColor: "bg-indigo-600 text-white",
    rating: 4.9,
    reviews: 350,
    highlights: ["Shaded Seating", "Sunset Cruise", "Snack Bar"],
    category: "scenic",
    image: seaplaneImg,
    imageAlt: "Seaplane over azure ocean water in the Maldives"
  },
  {
    id: "journey-4",
    from: "Malé",
    to: "Gulhi",
    duration: "Approx. 30 min",
    price: 30,
    frequency: "5 Daily Trips",
    tag: "Bikini Beach",
    tagColor: "bg-amber-600 text-white",
    rating: 4.9,
    reviews: 512,
    highlights: ["Quick 30m Transfer", "USB Charging", "Pristine Sands"],
    category: "speedboat",
    image: whiteSandImg,
    imageAlt: "Speedboat anchored near tropical island limestone cliffs"
  }
];

const CATEGORIES = [
  { id: "all", label: "All Routes" },
  { id: "speedboat", label: "Speedboat Express" },
  { id: "scenic", label: "Scenic Atoll Tours" }
];

export function PopularJourneysSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredJourneys = POPULAR_JOURNEYS.filter((journey) => {
    if (selectedCategory === "all") return true;
    return journey.category === selectedCategory;
  });

  return (
    <section id="schedules" className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase shadow-xs dark:text-blue-400">
              <Compass className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>POPULAR JOURNEYS</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Where are you heading?
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm md:text-base leading-relaxed">
              Discover frequently travelled routes, guaranteed daily departures, and transparent fixed fares with no hidden booking fees.
            </p>
          </div>

          {/* Category Filter Pills & View All Link */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl border border-border/70 bg-muted/40 p-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    selectedCategory === cat.id
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              asChild
              className="h-9 rounded-xl border-blue-500/30 text-xs font-bold text-blue-600 shadow-2xs hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              <Link href="/routes" className="group inline-flex items-center gap-1.5">
                <span>View all routes</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredJourneys.map((journey) => (
            <div
              key={journey.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div>
                {/* Image Container with Floating Badges */}
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={journey.image}
                    alt={journey.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  {/* Top Floating Tag */}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-md backdrop-blur-md">
                    <span className={cn("rounded-full px-2.5 py-0.5 shadow-xs", journey.tagColor)}>
                      {journey.tag}
                    </span>
                  </div>

                  {/* Top Right Rating Pill */}
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/55 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{journey.rating}</span>
                  </div>

                  {/* Bottom Duration & Frequency */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-bold text-white">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 backdrop-blur-md shadow-xs">
                      <Clock className="h-3 w-3 text-blue-300" />
                      <span>{journey.duration}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] backdrop-blur-md shadow-xs">
                      <Waves className="h-3 w-3 text-sky-300" />
                      <span>{journey.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Route Title */}
                <div className="mt-4 flex items-center gap-2 text-lg font-black text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <span>{journey.from}</span>
                  <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 transition-transform group-hover:translate-x-1" />
                  <span>{journey.to}</span>
                </div>

                {/* Micro Highlights Badges */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {journey.highlights.map((hl) => (
                    <span
                      key={hl}
                      className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                    >
                      {hl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    FARES FROM
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground leading-none">
                      ${journey.price}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">/ person</span>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  className="h-9 gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95"
                  asChild
                >
                  <Link
                    href={`/routes?from=${encodeURIComponent(journey.from)}&to=${encodeURIComponent(journey.to)}`}
                    className="flex items-center"
                  >
                    <span>View Trips</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
