"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { POPULAR_ROUTES } from "@/data/routes";
import { usePopularRoutesQuery } from "@/hooks";
import type { IPopularJourney } from "@/types";
import { Button } from "@/ui";
import { RouteCard, type RouteCardItem } from "@/components/widgets/booking/RouteCard";

// Static fallback items structured for RouteCard
export const POPULAR_JOURNEYS: RouteCardItem[] = POPULAR_ROUTES.slice(0, 4).map((r, idx) => ({
  id: r.id,
  from: r.from,
  to: r.to,
  description: r.description,
  duration: r.duration,
  trips: r.trips,
  frequency: r.trips,
  image: r.image,
  startingPrice: 30,
  price: 30,
  highlights: ["Air Conditioned", "Fast Speedboat", "Free 20kg Bag"],
  tag: idx === 0 ? "Most Popular" : "Popular Route",
  tagColor: idx === 0 ? "bg-[#003B95] text-white" : "bg-emerald-600 text-white",
  category: "speedboat"
}));

export function PopularJourneysSection() {
  const { data: popularRoutes, isLoading } = usePopularRoutesQuery({ limit: 4 });

  // Map live API data to RouteCardItem, falling back to static routes if empty
  const journeys = React.useMemo<RouteCardItem[]>(() => {
    if (popularRoutes && popularRoutes.length > 0) {
      return popularRoutes.slice(0, 4).map((route: IPopularJourney, index: number) => ({
        id: route.id || route.routeId || `popular-${index}`,
        from: route.from,
        to: route.to,
        description:
          route.description ||
          `Regular departures connecting ${route.from} and ${route.to} with fast, comfortable marine transfers.`,
        duration: route.duration || `${route.durationMinutes || 45} min`,
        durationMinutes: route.durationMinutes,
        price: route.startingPrice ?? route.price ?? 30,
        startingPrice: route.startingPrice ?? route.price ?? 30,
        frequency: route.frequency || `${route.dailyTripsCount || 4} Daily Trips`,
        dailyTripsCount: route.dailyTripsCount,
        tag: route.tag || (index === 0 ? "Most Popular" : "Popular Route"),
        tagColor: route.tagColor || (index === 0 ? "bg-[#003B95] text-white" : "bg-emerald-600 text-white"),
        highlights:
          route.highlights && route.highlights.length > 0
            ? route.highlights
            : ["Fast Speedboat", "Air Conditioned", "Instant QR Pass"],
        imageUrl: route.imageUrl,
        category: route.category || "speedboat",
        departurePort: route.departurePort,
        destinationPort: route.destinationPort
      }));
    }
    return POPULAR_JOURNEYS;
  }, [popularRoutes]);

  return (
    <section id="schedules" className="pt-16 pb-6 md:pt-20 md:pb-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase shadow-xs dark:text-blue-400">
              <Compass className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>POPULAR JOURNEYS</span>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Where are you heading?
            </h2>
            <p className="mt-4 text-xs text-muted-foreground sm:text-sm md:text-base leading-relaxed">
              Discover frequently travelled routes, guaranteed daily departures, and transparent fixed fares with no hidden booking fees.
            </p>
          </div>

          {/* View All Routes Button */}
          <div>
            <Button
              variant="outline"
              asChild
              className="h-10 rounded-xl border-blue-500/30 text-xs sm:text-sm font-bold text-blue-600 shadow-2xs hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              <Link href="/routes" className="group inline-flex items-center gap-2">
                <span>View all routes</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards Grid using RouteCard from /routes */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && journeys.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-2xs animate-pulse flex flex-col justify-between"
                >
                  <div className="h-48 bg-muted/60" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted/80 rounded w-3/4" />
                    <div className="h-3 bg-muted/60 rounded w-1/2" />
                    <div className="pt-3 border-t border-border/60 flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-8 bg-muted rounded-xl w-24" />
                    </div>
                  </div>
                </div>
              ))
            : journeys.map((route, idx) => (
                <RouteCard key={route.id} route={route} index={idx} />
              ))}
        </div>
      </div>
    </section>
  );
}
