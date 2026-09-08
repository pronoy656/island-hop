"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Anchor, MapPin, Search } from "lucide-react";

import { Button, Card, CardContent, Label } from "@/ui";

import { PortCombobox } from "./PortCombobox";

export function RouteSearchFilterBar() {
  const router = useRouter();
  const [departurePort, setDeparturePort] = useState("Malé");
  const [destination, setDestination] = useState("Maafushi");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/book?from=${encodeURIComponent(departurePort)}&to=${encodeURIComponent(
        destination
      )}&departureDate=2026-05-24&passengers=1%20Passenger`
    );
  };

  return (
    <Card className="border-border/80 bg-card/95 rounded-3xl border p-4 shadow-xl backdrop-blur-md sm:p-5">
      <CardContent className="p-0">
        <form onSubmit={handleSearch} className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
          {/* Search by Departure Port */}
          <div className="space-y-1.5 sm:col-span-5">
            <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
              SEARCH BY DEPARTURE PORT
            </Label>
            <PortCombobox
              value={departurePort}
              onChange={setDeparturePort}
              placeholder="Select departure port"
              icon={MapPin}
              className="h-12 rounded-2xl"
            />
          </div>

          {/* Search by Destination */}
          <div className="space-y-1.5 sm:col-span-5">
            <Label className="text-muted-foreground text-[10px] font-extrabold tracking-wider uppercase">
              SEARCH BY DESTINATION
            </Label>
            <PortCombobox
              value={destination}
              onChange={setDestination}
              placeholder="Select destination"
              icon={Anchor}
              className="h-12 rounded-2xl"
            />
          </div>

          {/* Search Routes Action Button */}
          <div className="sm:col-span-2">
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-2xl bg-[#003B95] text-xs font-bold text-white shadow-md transition-all hover:bg-[#002f77] hover:shadow-lg"
            >
              <Search className="mr-1.5 h-4 w-4" />
              <span>Search Routes</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
