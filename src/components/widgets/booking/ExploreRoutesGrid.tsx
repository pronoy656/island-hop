"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Compass,
  Grid3X3,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  Ship,
  Sparkles,
  Waves,
  X
} from "lucide-react";

import { POPULAR_ROUTES, type IslandRoute } from "@/data/routes";
import { usePopularRoutesQuery } from "@/hooks";
import type { IPopularJourney } from "@/types";
import { AnimatedSection, Button, Card, CardContent, Input } from "@/ui";
import { cn } from "@/lib/utils";
import { RouteCard, type RouteCardItem } from "./RouteCard";

const INITIAL_VISIBLE_COUNT = 6;
const BATCH_SIZE = 6;

export function ExploreRoutesGrid() {
  const { data: popularRoutes, isLoading, isError } = usePopularRoutesQuery({ limit: 100 });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<"all" | "speedboat" | "scenic">("all");
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE_COUNT);

  // Combine live routes with static fallback
  const allRoutes = React.useMemo<RouteCardItem[]>(() => {
    if (popularRoutes && popularRoutes.length > 0) {
      return popularRoutes.map((r: IPopularJourney, idx: number) => ({
        id: r.id || r.routeId || `route-${idx}`,
        from: r.from,
        to: r.to,
        description: r.description || `${r.from} to ${r.to} island sea transfer`,
        duration: r.duration || `${r.durationMinutes || 45} min`,
        durationMinutes: r.durationMinutes,
        frequency: r.frequency || `${r.dailyTripsCount || 4} Daily Trips`,
        dailyTripsCount: r.dailyTripsCount,
        price: r.startingPrice ?? r.price ?? 30,
        startingPrice: r.startingPrice ?? r.price ?? 30,
        highlights: r.highlights || [],
        imageUrl: r.imageUrl,
        tag: r.tag,
        tagColor: r.tagColor,
        category: r.category || "speedboat",
        departurePort: r.departurePort,
        destinationPort: r.destinationPort
      }));
    }

    // Fallback to static routes
    return POPULAR_ROUTES.map((r: IslandRoute) => ({
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
      category: "speedboat"
    }));
  }, [popularRoutes]);

  // Real-time filtering by category and search query
  const filteredRoutes = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allRoutes.filter((r) => {
      // Category check
      if (selectedCategory !== "all") {
        const cat = (r.category || "").toLowerCase();
        if (selectedCategory === "speedboat" && !cat.includes("speed")) return false;
        if (selectedCategory === "scenic" && !cat.includes("scenic")) return false;
      }

      // Search term check
      if (!q) return true;
      const fromMatch = r.from.toLowerCase().includes(q);
      const toMatch = r.to.toLowerCase().includes(q);
      const descMatch = (r.description || "").toLowerCase().includes(q);

      return fromMatch || toMatch || descMatch;
    });
  }, [allRoutes, selectedCategory, searchTerm]);

  // Reset pagination count when search or category filter changes
  React.useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchTerm, selectedCategory]);

  const totalFiltered = filteredRoutes.length;
  const currentVisible = Math.min(visibleCount, totalFiltered);
  const remainingCount = Math.max(0, totalFiltered - currentVisible);
  const nextBatchCount = Math.min(BATCH_SIZE, remainingCount);
  const progressPercent = totalFiltered === 0 ? 0 : Math.round((currentVisible / totalFiltered) * 100);

  const displayedRoutes = React.useMemo(() => {
    return filteredRoutes.slice(0, currentVisible);
  }, [filteredRoutes, currentVisible]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  const handleShowAll = () => {
    setVisibleCount(totalFiltered);
  };

  const handleReset = () => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const speedboat = allRoutes.filter((r) => (r.category || "").toLowerCase().includes("speed")).length;
    const scenic = allRoutes.filter((r) => (r.category || "").toLowerCase().includes("scenic")).length;
    return {
      all: allRoutes.length,
      speedboat,
      scenic
    };
  }, [allRoutes]);

  return (
    <div className="space-y-8">
      {/* 1. Header with Stats, Search Input, and Category Filter Tabs */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Island Hop Route Network</span>
          </div>
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Popular Ferry Routes
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
            Browse our complete network of speedboat transfers, local ferries, and scenic atoll crossings across the Maldives.
          </p>
        </div>

        {/* Quick Search in Grid */}
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search ports or islands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 pr-8 text-xs rounded-xl bg-card border-border/80 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              selectedCategory === "all"
                ? "bg-[#003B95] text-white shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/70"
            )}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>All Routes</span>
            <span
              className={cn(
                "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {categoryCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("speedboat")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              selectedCategory === "speedboat"
                ? "bg-[#003B95] text-white shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/70"
            )}
          >
            <Ship className="h-3.5 w-3.5" />
            <span>Speedboat Transfers</span>
            <span
              className={cn(
                "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                selectedCategory === "speedboat" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {categoryCounts.speedboat}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("scenic")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              selectedCategory === "scenic"
                ? "bg-[#003B95] text-white shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/70"
            )}
          >
            <Waves className="h-3.5 w-3.5" />
            <span>Scenic Island Journeys</span>
            <span
              className={cn(
                "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                selectedCategory === "scenic" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {categoryCounts.scenic}
            </span>
          </button>
        </div>

        {/* Showing Summary Indicator */}
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
          <span>
            Showing <strong className="text-foreground font-bold">{currentVisible}</strong> of{" "}
            <strong className="text-foreground font-bold">{totalFiltered}</strong> available routes
          </span>
        </div>
      </div>

      {/* 3. Loading Skeletons */}
      {isLoading && allRoutes.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-2xs animate-pulse"
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
          ))}
        </div>
      ) : totalFiltered === 0 ? (
        /* 4. Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-card rounded-3xl border border-border/80 shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <Compass className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">No ferry routes found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            No routes matched &ldquo;{searchTerm}&rdquo; in this category. Try adjusting your search term or category.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="text-xs font-semibold rounded-xl h-8"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        /* 5. Main Route Cards Grid */
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedRoutes.map((route, idx) => (
              <AnimatedSection key={route.id} delay={Math.min(idx * 0.04, 0.25)}>
                <RouteCard route={route} index={idx} />
              </AnimatedSection>
            ))}
          </div>

          {/* 6. Progressive Pagination & "Load More" Control Panel */}
          <div className="bg-card/70 border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs backdrop-blur-xs flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto text-center">
            {/* Progress counter & bar */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-1">
                <span>
                  Showing <strong className="text-foreground">{currentVisible}</strong> of{" "}
                  <strong className="text-foreground">{totalFiltered}</strong> routes
                </span>
                <span className="font-bold text-[#003B95] dark:text-blue-400">{progressPercent}% viewed</span>
              </div>
              <div className="w-full bg-muted/70 h-2 rounded-full overflow-hidden border border-border/40">
                <div
                  className="bg-gradient-to-r from-[#003B95] to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {remainingCount > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1 w-full justify-center">
                <Button
                  onClick={handleLoadMore}
                  size="lg"
                  className="bg-[#003B95] hover:bg-[#002f77] text-white font-bold text-xs h-11 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <ChevronDown className="h-4 w-4" />
                  <span>Load More Routes</span>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                    +{nextBatchCount} more
                  </span>
                </Button>

                {remainingCount > BATCH_SIZE && (
                  <Button
                    variant="outline"
                    onClick={handleShowAll}
                    size="lg"
                    className="border-border/80 text-foreground hover:bg-muted font-semibold text-xs h-11 px-5 rounded-2xl cursor-pointer transition-colors w-full sm:w-auto"
                  >
                    <span>Show All ({totalFiltered})</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>All {totalFiltered} available ferry routes loaded</span>
                </div>
                {totalFiltered > INITIAL_VISIBLE_COUNT && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer rounded-xl"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset to {INITIAL_VISIBLE_COUNT}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
