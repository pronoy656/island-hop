"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Navigation, Ship, Sparkles, Waves, Wind } from "lucide-react";

import type { IslandRoute } from "@/data/routes";
import { Button, Card, CardContent } from "@/ui";
import { cn } from "@/lib/utils";

export const DEFAULT_ROUTE_IMAGES = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80"
];

export interface RouteCardItem {
  id: string;
  from: string;
  to: string;
  description?: string | null;
  duration?: string;
  durationMinutes?: number;
  trips?: string;
  frequency?: string;
  dailyTripsCount?: number;
  image?: string;
  imageUrl?: string | null;
  price?: number;
  startingPrice?: number;
  highlights?: string[];
  tag?: string | null;
  tagColor?: string | null;
  category?: string;
  departurePort?: { name?: string };
  destinationPort?: { name?: string };
}

interface RouteCardProps {
  route: RouteCardItem | IslandRoute;
  index?: number;
}

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function RouteCard({ route, index = 0 }: RouteCardProps) {
  const item = route as RouteCardItem;
  const staticItem = route as IslandRoute;
  const today = React.useMemo(() => getTodayDateString(), []);

  const fromVal = item.departurePort?.name || route.from;
  const toVal = item.destinationPort?.name || route.to;
  const targetUrl = `/ferries?from=${encodeURIComponent(fromVal)}&to=${encodeURIComponent(
    toVal
  )}&departureDate=${today}&passengers=1%20Passenger&adults=1`;


  // Resolve best image URL with scenic Maldivian fallback
  const displayImage = React.useMemo(() => {
    const raw = item.imageUrl || staticItem.image;
    if (raw && typeof raw === "string" && raw.trim().startsWith("http")) return raw.trim();
    if (raw && typeof raw === "object" && "src" in (raw as Record<string, unknown>)) {
      return String((raw as Record<string, unknown>).src);
    }

    const key = `${route.id || ""}-${route.from}-${route.to}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i)) % DEFAULT_ROUTE_IMAGES.length;
    }
    return DEFAULT_ROUTE_IMAGES[hash];
  }, [item.imageUrl, staticItem.image, route.id, route.from, route.to]);

  const price = item.startingPrice ?? item.price ?? 30;
  const duration =
    item.duration || (item.durationMinutes ? `${item.durationMinutes} min` : "40 min");
  const frequency =
    item.frequency ||
    staticItem.trips ||
    (item.dailyTripsCount ? `${item.dailyTripsCount} Daily Trips` : "Multiple daily");
  const highlights = item.highlights || [];
  const tag = item.tag;
  const tagColor = item.tagColor || "bg-[#003B95] text-white";

  return (
    <Card className="group border-border/80 bg-card hover:border-primary/50 overflow-hidden rounded-3xl border p-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
      <CardContent className="p-0 flex flex-col h-full justify-between">
        <div>
          {/* Top Destination Image */}
          <div className="bg-muted relative h-48 w-full overflow-hidden">
            <img
              src={displayImage}
              alt={`${route.from} to ${route.to} island ferry transfer`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_ROUTE_IMAGES[0];
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
              {tag ? (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase",
                    tagColor
                  )}
                >
                  {tag}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                  Daily Ferry
                </span>
              )}

              {/* Price Pill */}
              <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/80 shadow-sm flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">From</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ${price}
                </span>
              </div>
            </div>

            {/* Bottom Port Names on Image */}
            <div className="absolute bottom-3 inset-x-3 text-white pointer-events-none">
              <div className="flex items-center gap-1.5 text-xs font-extrabold drop-shadow-md min-w-0">
                <span className="truncate flex-1">{route.from}</span>
                <ArrowRight className="h-3 w-3 shrink-0 text-white/80" />
                <span className="truncate flex-1">{route.to}</span>
              </div>
            </div>
          </div>

          {/* Middle Body Content */}
          <div className="space-y-3 p-5">
            <p className="text-muted-foreground text-xs line-clamp-2 min-h-[32px]">
              {route.description ||
                `Regular ferry departures connecting ${route.from} and ${route.to} with fast, comfortable marine transfers.`}
            </p>

            {/* Amenities Chips (up to 2 visible) */}
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {highlights.slice(0, 2).map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border/60"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{h}</span>
                  </span>
                ))}
                {highlights.length > 2 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-muted-foreground bg-muted/60">
                    +{highlights.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Specs & Action Footer */}
        <div className="border-border/60 border-t p-4 pt-3 flex items-center justify-between text-xs bg-muted/10">
          <div className="flex items-center gap-3.5">
            {/* Duration */}
            <div className="space-y-0.5">
              <div className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                Duration
              </div>
              <div className="text-foreground flex items-center gap-1 font-bold text-xs">
                <Clock className="text-[#003B95] dark:text-blue-400 h-3 w-3" />
                <span>{duration}</span>
              </div>
            </div>

            {/* Trips Frequency */}
            <div className="space-y-0.5">
              <div className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                Departures
              </div>
              <div className="text-foreground flex items-center gap-1 font-bold text-xs">
                <Ship className="text-[#003B95] dark:text-blue-400 h-3 w-3" />
                <span>{frequency}</span>
              </div>
            </div>
          </div>

          {/* View Trips Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-border/80 text-[#003B95] dark:text-blue-400 hover:border-[#003B95] hover:bg-[#003B95]/10 h-8 rounded-xl px-3 text-[11px] font-bold shadow-2xs cursor-pointer"
            asChild
          >
            <Link href={targetUrl}>
              <span>View Trips</span>
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
