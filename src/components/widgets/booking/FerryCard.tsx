"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Ship } from "lucide-react";
import { useQueryStates } from "nuqs";

import { bookingSearchParamsParsers, extractPassengerCount } from "@/schemas/booking-params";
import type { ISearchedTrip } from "@/types";
import type { FerryTrip } from "@/data/ferries";
import { getDynamicVesselImage } from "@/data/media-catalog";
import { Badge, Button, Card, CardContent } from "@/ui";

const FERRY_IMAGES = [
  "https://images.unsplash.com/photo-1545647274-96644da34363?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1694428733861-620550edd3c5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1787945832826-f299aebdef7e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1760465789372-965a150847db?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1780553562886-528452a6b697?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1778576402928-9a573311f30e?auto=format&fit=crop&w=800&q=80"
];

interface FerryCardProps {
  trip: ISearchedTrip | FerryTrip;
  fromPortName?: string;
  toPortName?: string;
}

export function FerryCard({ trip, fromPortName, toPortName }: FerryCardProps) {
  const [params] = useQueryStates(bookingSearchParamsParsers);
  const numericCount = extractPassengerCount(params.passengers);

  const adults = parseInt(params.adults || "1", 10) || 1;
  const children = parseInt(params.children || "0", 10) || 0;
  const totalCount = adults + children;

  const tripId = "tripId" in trip ? trip.tripId : trip.id;
  const operatorName = trip.operator;
  const vesselName = "vessel" in trip ? trip.vessel : trip.vesselName;
  const price = "pricePerAdult" in trip ? trip.pricePerAdult : trip.price;
  const departurePort = ("departurePort" in trip && trip.departurePort) || fromPortName || params.from;
  const arrivalPort = ("destinationPort" in trip && trip.destinationPort) || ("arrivalPort" in trip && trip.arrivalPort) || toPortName || params.to;
  const availableSeats = trip.availableSeats;

  // Stable image selection based on tripId string hash
  const imageIndex = Math.abs(
    tripId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % FERRY_IMAGES.length;
  const vesselType = "vesselType" in trip ? trip.vesselType : "SPEEDBOAT";
  const imageSrc = ("image" in trip && trip.image) ? trip.image : getDynamicVesselImage(vesselType, tripId);

  const reviewUrl = `/book/${tripId}/review?passengers=${totalCount}&adults=${adults}&children=${children}&departureDate=${encodeURIComponent(
    params.departureDate
  )}&from=${encodeURIComponent(departurePort)}&to=${encodeURIComponent(arrivalPort)}&tripType=${
    params.tripType
  }${params.tripType === "round-trip" && params.returnDate ? `&returnDate=${encodeURIComponent(params.returnDate)}` : ""}`;

  return (
    <Card className="group border-border bg-card hover:border-primary/40 overflow-hidden rounded-2xl p-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Ferry Image */}
          <div className="bg-muted relative h-48 w-full overflow-hidden rounded-md lg:h-auto lg:w-72 lg:shrink-0">
            <Image
              src={imageSrc}
              alt={`${operatorName} - ${vesselName}`}
              fill
              sizes="(max-width: 1024px) 100vw, 288px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Right: Ferry Info & Booking Action */}
          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              {/* Header: Operator & Seats */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg">
                    <Ship className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-base font-bold">{operatorName}</h3>
                    <p className="text-muted-foreground text-xs">{vesselName}</p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {availableSeats} seats available
                </Badge>
              </div>

              {/* Timing & Timeline Route Track */}
              <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
                {/* Departure */}
                <div className="sm:col-span-3">
                  <div className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
                    DEPARTURE
                  </div>
                  <div className="text-foreground mt-0.5 text-2xl font-black tracking-tight">
                    {trip.departureTime}
                  </div>
                  <div className="text-muted-foreground text-xs font-medium">
                    {departurePort}
                  </div>
                </div>

                {/* Progress duration indicator */}
                <div className="flex flex-col items-center justify-center sm:col-span-4">
                  <span className="text-muted-foreground text-[11px] font-medium">
                    {trip.duration}
                  </span>
                  <div className="relative mt-2 flex w-full max-w-[160px] items-center">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                    <div className="bg-border h-[2px] flex-1" />
                    <div className="text-primary">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <div className="bg-border h-[2px] flex-1" />
                    <div className="border-primary bg-background h-2 w-2 rounded-full border-2" />
                  </div>
                </div>

                {/* Arrival */}
                <div className="sm:col-span-3">
                  <div className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
                    ARRIVAL
                  </div>
                  <div className="text-foreground mt-0.5 text-2xl font-black tracking-tight">
                    {trip.arrivalTime}
                  </div>
                  <div className="text-muted-foreground text-xs font-medium">
                    {arrivalPort}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="border-border flex flex-row items-center justify-between border-t pt-4 sm:col-span-2 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
                      FROM
                    </span>
                    <div className="text-foreground text-2xl font-black sm:text-3xl">
                      ${price}
                    </div>
                    <div className="text-muted-foreground text-[10px]">/ per passenger</div>
                  </div>

                  <Button
                    size="sm"
                    className="mt-3 rounded-xl px-5 font-bold shadow-md transition-all hover:shadow-lg"
                    asChild
                  >
                    <Link href={reviewUrl}>
                      <span>Select Trip</span>
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
