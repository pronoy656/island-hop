"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Clock, Ship } from "lucide-react";

import type { IslandRoute } from "@/data/routes";

import { Button, Card, CardContent } from "@/ui";

interface RouteCardProps {
  route: IslandRoute;
}

export function RouteCard({ route }: RouteCardProps) {
  const targetUrl = `/book?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(
    route.to
  )}&departureDate=2026-05-24&passengers=1%20Passenger`;

  return (
    <Card className="group border-border/80 bg-card hover:border-primary/40 overflow-hidden rounded-3xl border p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <CardContent className="p-0">
        {/* Top Destination Image */}
        <div className="bg-muted relative h-48 w-full overflow-hidden">
          <Image
            src={route.image}
            alt={`${route.from} to ${route.to}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Bottom Content */}
        <div className="space-y-4 p-5">
          <div className="space-y-1">
            <h3 className="text-foreground group-hover:text-primary text-base font-bold transition-colors">
              {route.from} &rarr; {route.to}
            </h3>
            <p className="text-muted-foreground text-xs">{route.description}</p>
          </div>

          <div className="border-border/60 flex items-center justify-between border-t pt-3 text-xs">
            <div className="flex items-center gap-4">
              {/* Duration */}
              <div className="space-y-0.5">
                <div className="text-muted-foreground text-[10px] font-bold uppercase">
                  Duration
                </div>
                <div className="text-foreground flex items-center gap-1 font-bold">
                  <Clock className="text-primary h-3 w-3" />
                  <span>{route.duration}</span>
                </div>
              </div>

              {/* Trips Frequency */}
              <div className="space-y-0.5">
                <div className="text-muted-foreground text-[10px] font-bold uppercase">Trips</div>
                <div className="text-foreground flex items-center gap-1 font-bold">
                  <Ship className="text-primary h-3 w-3" />
                  <span>{route.trips}</span>
                </div>
              </div>
            </div>

            {/* View Trips Button */}
            <Button
              variant="outline"
              size="sm"
              className="border-border/80 text-primary hover:border-primary hover:bg-primary/5 h-8 rounded-xl px-3 text-[11px] font-bold"
              asChild
            >
              <Link href={targetUrl}>
                <span>View Trips</span>
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
