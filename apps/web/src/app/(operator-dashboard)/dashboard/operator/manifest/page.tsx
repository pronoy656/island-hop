"use client";

import * as React from "react";
import {
  QrCode,
  Search
} from "lucide-react";
import { toast } from "sonner";
import {
  PROVIDER_MOCK_DATA,
  type ManifestPassengerItem,
  type ManifestTripItem
} from "@/data";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input
} from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

export default function OperatorManifestPage() {
  const [selectedManifestIndex, setSelectedManifestIndex] = React.useState(0);
  const [manifests, setManifests] = React.useState<ManifestTripItem[]>(
    PROVIDER_MOCK_DATA.manifests
  );
  const [searchTerm, setSearchTerm] = React.useState("");

  const currentTrip = manifests[selectedManifestIndex] || manifests[0];

  const handleToggleBoarding = (passengerId: string) => {
    setManifests((prev) =>
      prev.map((m, mIdx) => {
        if (mIdx !== selectedManifestIndex) return m;

        const updatedPassengers = m.passengers.map((p) => {
          if (p.id !== passengerId) return p;
          const nextStatus: ManifestPassengerItem["checkInStatus"] =
            p.checkInStatus === "Boarded" ? "Checked In" : "Boarded";
          return { ...p, checkInStatus: nextStatus };
        });

        const newBoardedCount = updatedPassengers.filter(
          (p) => p.checkInStatus === "Boarded"
        ).length;

        return {
          ...m,
          passengers: updatedPassengers,
          totalBoarded: newBoardedCount
        };
      })
    );
    toast.success("Passenger boarding status updated!");
  };

  const filteredPassengers = React.useMemo(() => {
    return currentTrip.passengers.filter(
      (p) =>
        p.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.passportId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentTrip, searchTerm]);

  const passengerColumns: TableColumn<ManifestPassengerItem>[] = [
    {
      header: "TICKET #",
      accessorKey: "ticketNumber",
      className: "font-mono font-bold text-slate-700 dark:text-slate-300 text-xs"
    },
    {
      header: "PASSENGER NAME",
      accessorKey: "passengerName",
      className: "font-bold text-foreground"
    },
    {
      header: "NATIONALITY",
      accessorKey: "nationality",
      className: "text-muted-foreground text-xs"
    },
    {
      header: "PASSPORT / ID",
      accessorKey: "passportId",
      className: "font-mono text-muted-foreground text-xs"
    },
    {
      header: "CABIN CLASS",
      accessorKey: "cabinClass",
      className: "text-foreground font-medium text-xs"
    },
    {
      header: "LUGGAGE",
      className: "text-center text-xs font-mono font-semibold",
      align: "center",
      cell: (item) => `${item.luggageCount} bags`
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.checkInStatus} />
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <Button
          variant={item.checkInStatus === "Boarded" ? "outline" : "default"}
          size="sm"
          onClick={() => handleToggleBoarding(item.id)}
          className={
            item.checkInStatus === "Boarded"
              ? "text-xs h-7 px-2.5 text-muted-foreground"
              : "text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          }
        >
          {item.checkInStatus === "Boarded" ? "Undo Boarding" : "Confirm Boarded"}
        </Button>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Passenger Manifest & Boarding
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Official Coast Guard compliance passenger manifest, deck luggage, and boarding audit.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            onClick={() => toast.info("Ready for QR Boarding Pass Scanner...")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan Boarding Pass
          </Button>
        </div>
      </div>

      {/* Select Trip Manifest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {manifests.map((trip, idx) => (
          <button
            key={trip.manifestId}
            type="button"
            onClick={() => setSelectedManifestIndex(idx)}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              selectedManifestIndex === idx
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-500 shadow-xs"
                : "border-border/80 hover:border-border hover:bg-muted/30 bg-card"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-muted-foreground">
                {trip.manifestId}
              </span>
              <Badge
                variant="outline"
                className={
                  trip.status === "Boarding"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800 text-[10px] font-bold"
                    : "text-muted-foreground text-[10px]"
                }
              >
                {trip.status}
              </Badge>
            </div>
            <p className="text-sm font-extrabold text-foreground">{trip.routeName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vessel: {trip.vesselName} • Dep: {trip.departureTime}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-mono font-semibold pt-2 border-t border-border/60">
              <span className="text-emerald-600 dark:text-emerald-400">
                Boarded: {trip.totalBoarded} PAX
              </span>
              <span className="text-muted-foreground">
                Cap: {trip.totalCapacity}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Current Manifest Details Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                {currentTrip.vesselName} — {currentTrip.routeName}
              </h2>
              <p className="text-xs text-muted-foreground">
                Duty Master: {currentTrip.captain} • Travel Date: {currentTrip.travelDate}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block">Boarding Progress</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {currentTrip.totalBoarded} / {currentTrip.totalCheckedIn} Boarded
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Table */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search manifest by name, ticket, passport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9 bg-card"
          />
        </div>
      </div>

      <DashboardTableCard
        title={`Passenger Roll Call (${filteredPassengers.length} Registered)`}
        columns={passengerColumns}
        data={filteredPassengers}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
