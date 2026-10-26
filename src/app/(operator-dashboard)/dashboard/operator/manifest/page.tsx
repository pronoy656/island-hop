"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Lock,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Ship,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { toast } from "sonner";

import type { IManifestPassengerRecord, OperatorScheduleStatus } from "@/types";
import {
  useBoardPassengerMutation,
  useOperatorSchedulesQuery,
  useTripManifestQuery,
  useUnboardPassengerMutation
} from "@/hooks";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ReusableSelect,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

function ManifestLoadingFallback() {
  return (
    <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border-border/80 bg-card p-12 text-center shadow-xs">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-muted-foreground">
            Loading official passenger manifest & boarding roll call...
          </p>
        </div>
      </Card>
    </div>
  );
}

function ManifestContent() {
  const searchParams = useSearchParams();
  const urlTripId = searchParams.get("tripId");

  const [selectedTripId, setSelectedTripId] = React.useState<string>(urlTripId || "");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("ALL");
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [scanInput, setScanInput] = React.useState("");
  const [operatingTicketId, setOperatingTicketId] = React.useState<string | null>(null);

  // 1. Fetch available schedules for operator to switch between trips
  const { data: schedulesData, isLoading: isSchedulesLoading } = useOperatorSchedulesQuery({
    limit: 50
  });

  const schedules = schedulesData?.schedules ?? [];

  // If selectedTripId is empty or invalid, auto-pick the first schedule from the list
  React.useEffect(() => {
    if (!selectedTripId && schedules.length > 0) {
      setSelectedTripId(schedules[0].id);
    }
  }, [selectedTripId, schedules]);

  // Keep state synced if URL parameter changes
  React.useEffect(() => {
    if (urlTripId && urlTripId !== selectedTripId) {
      setSelectedTripId(urlTripId);
    }
  }, [urlTripId]);

  // 2. Query: Live trip manifest from backend
  const {
    data: manifestData,
    isLoading: isManifestLoading,
    isFetching: isManifestFetching,
    isError: isManifestError,
    error: manifestError,
    refetch: refetchManifest
  } = useTripManifestQuery({
    tripId: selectedTripId,
    search: searchTerm,
    boardingStatus: activeTab === "ALL" ? undefined : activeTab
  });

  // 3. Mutations: Board & Unboard
  const boardMutation = useBoardPassengerMutation();
  const unboardMutation = useUnboardPassengerMutation();

  const tripInfo = manifestData?.tripInfo;
  const rawPassengers = manifestData?.passengers ?? [];

  // Lock manifest if vessel has already departed or arrived
  const isTripLocked =
    tripInfo?.tripStatus === "DEPARTED" ||
    tripInfo?.tripStatus === "ARRIVED" ||
    tripInfo?.tripStatus === "CANCELLED";

  // Filter passengers locally by search term for instant responsiveness
  const passengers = React.useMemo(() => {
    if (!searchTerm.trim()) return rawPassengers;
    const q = searchTerm.toLowerCase();
    return rawPassengers.filter(
      (p) =>
        p.passengerName.toLowerCase().includes(q) ||
        p.ticketNumber.toLowerCase().includes(q) ||
        p.bookingReference.toLowerCase().includes(q) ||
        p.passportOrId.toLowerCase().includes(q) ||
        p.nationality.toLowerCase().includes(q)
    );
  }, [rawPassengers, searchTerm]);

  // Passenger boarding toggle
  const handleToggleBoarding = async (item: IManifestPassengerRecord) => {
    if (isTripLocked) {
      toast.error(
        `This trip is marked as ${tripInfo?.tripStatus ?? "DEPARTED"}. Manifest is locked for Coast Guard compliance.`
      );
      return;
    }

    setOperatingTicketId(item.ticketId);
    try {
      if (item.boardingStatus === "BOARDED") {
        await unboardMutation.mutateAsync(item.ticketId);
      } else {
        await boardMutation.mutateAsync({ ticketId: item.ticketId });
      }
    } finally {
      setOperatingTicketId(null);
    }
  };

  // Quick QR / Manual Ticket Boarding Handler
  const handleScannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const query = scanInput.trim().toUpperCase();
    const match = rawPassengers.find(
      (p) =>
        p.ticketNumber.toUpperCase() === query ||
        p.bookingReference.toUpperCase() === query ||
        p.passportOrId.toUpperCase() === query
    );

    if (!match) {
      toast.error(`No passenger ticket found with number or ID: ${scanInput}`);
      return;
    }

    if (match.boardingStatus === "BOARDED") {
      toast.info(`Passenger ${match.passengerName} is ALREADY marked as Boarded.`);
      setScanInput("");
      return;
    }

    try {
      await boardMutation.mutateAsync({ ticketId: match.ticketId });
      toast.success(`Passenger ${match.passengerName} confirmed boarded!`);
      setScanInput("");
      setIsScannerOpen(false);
    } catch {
      // toast handled in mutation
    }
  };

  // Trip selection options for dropdown
  const tripOptions = React.useMemo(() => {
    return schedules.map((s) => {
      const dep = parseISO(s.departureTime);
      const timeStr = isValid(dep) ? format(dep, "dd MMM, hh:mm a") : s.departureTime;
      const origin = s.route?.departurePort?.name ?? "Origin";
      const dest = s.route?.destinationPort?.name ?? "Dest";
      const ferry = s.ferry?.name ?? "Ferry";
      return {
        value: s.id,
        label: `${origin} ➔ ${dest} • ${ferry} (${timeStr})`
      };
    });
  }, [schedules]);

  // Passenger Table Columns
  const passengerColumns: TableColumn<IManifestPassengerRecord>[] = [
    {
      header: "TICKET #",
      className: "font-mono font-bold text-foreground text-xs",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-foreground">{item.ticketNumber}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            Ref: {item.bookingReference}
          </span>
        </div>
      )
    },
    {
      header: "PASSENGER NAME",
      className: "text-xs",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{item.passengerName}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {item.passportOrId ? `ID: ${item.passportOrId}` : "Passport / ID: On file"}
          </span>
        </div>
      )
    },
    {
      header: "NATIONALITY",
      accessorKey: "nationality",
      className: "text-xs text-muted-foreground font-medium"
    },
    {
      header: "CABIN / SEAT",
      className: "text-xs font-semibold text-foreground",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            {item.cabinClass || "Standard"}
          </Badge>
          {item.luggageCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              🧳 {item.luggageCount} {item.luggageCount === 1 ? "bag" : "bags"}
            </span>
          )}
        </div>
      )
    },
    {
      header: "BOARDING STATUS",
      cell: (item) => {
        const isBoarded = item.boardingStatus === "BOARDED";
        return (
          <div className="flex flex-col gap-0.5">
            <StatusBadge
              status={isBoarded ? "Boarded" : item.boardingStatus === "CHECKED_IN" ? "Checked In" : "Pending"}
            />
            {item.boardedAt && (
              <span className="text-[9px] text-muted-foreground font-mono">
                {isValid(new Date(item.boardedAt))
                  ? format(new Date(item.boardedAt), "hh:mm a")
                  : ""}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => {
        const isBoarded = item.boardingStatus === "BOARDED";
        const isOperating = operatingTicketId === item.ticketId;

        return (
          <Button
            variant={isBoarded ? "outline" : "default"}
            size="sm"
            disabled={isTripLocked || isOperating}
            onClick={() => void handleToggleBoarding(item)}
            className={
              isBoarded
                ? "text-xs h-7 px-2.5 text-muted-foreground border-border hover:bg-muted/50 cursor-pointer"
                : "text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs cursor-pointer"
            }
          >
            {isOperating ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : isBoarded ? (
              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
            ) : (
              <UserCheck className="h-3 w-3 mr-1" />
            )}
            {isBoarded ? "Undo Boarding" : "Confirm Boarded"}
          </Button>
        );
      }
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard/operator/schedules">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Schedules
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Passenger Manifest & Boarding Roll Call
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Official maritime compliance manifest, passenger head-count, and live boarding gate verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-9 font-semibold flex items-center gap-1.5"
            title="Print official passenger manifest for port authorities"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Manifest
          </Button>

          <Button
            size="sm"
            disabled={isTripLocked}
            onClick={() => setIsScannerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan / Fast Board
          </Button>
        </div>
      </div>

      {/* Select Trip Schedule Bar */}
      <Card className="border-border/80 bg-card shadow-xs print:hidden">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-foreground">Select Ferry Departure:</span>
          </div>

          <div className="w-full md:w-96">
            {isSchedulesLoading ? (
              <div className="h-9 flex items-center text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Loading schedules...
              </div>
            ) : tripOptions.length === 0 ? (
              <div className="text-xs text-muted-foreground py-1">
                No scheduled ferry departures available.
              </div>
            ) : (
              <ReusableSelect
                value={selectedTripId}
                onValueChange={(val) => setSelectedTripId(val)}
                options={tripOptions}
                placeholder="Choose a sailing trip..."
              />
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetchManifest()}
            disabled={isManifestFetching || !selectedTripId}
            className="h-9 px-3 text-xs shrink-0"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${isManifestFetching ? "animate-spin" : ""}`}
            />
            Refresh Roll Call
          </Button>
        </CardContent>
      </Card>

      {/* Coast Guard Lockout Banner (When Departed or Arrived) */}
      {isTripLocked && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 shadow-2xs">
          <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <span className="font-bold">Maritime Safety Notice: </span>
            This voyage is currently marked as{" "}
            <span className="font-extrabold uppercase">{tripInfo?.tripStatus}</span>. Passenger
            manifest is permanently locked for Coast Guard inspection and passenger safety auditing.
          </div>
        </div>
      )}

      {/* Current Voyage Overview Card */}
      {tripInfo && (
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-extrabold text-foreground sm:text-lg">
                    {tripInfo.departurePort} ➔ {tripInfo.destinationPort}
                  </span>
                  <StatusBadge status={tripInfo.tripStatus.replace(/_/g, " ")} />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Ship className="h-3.5 w-3.5 text-emerald-600" />
                    Vessel: {tripInfo.vesselName}
                  </span>
                  {tripInfo.captain && (
                    <span>Duty Captain: {tripInfo.captain}</span>
                  )}
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    Departure:{" "}
                    {isValid(new Date(tripInfo.departureTime))
                      ? format(new Date(tripInfo.departureTime), "dd MMM yyyy, hh:mm a")
                      : String(tripInfo.departureTime)}
                  </span>
                </div>
              </div>

              {/* Boarding Counter Progress */}
              <div className="flex items-center gap-6 self-start lg:self-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-border/60">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] font-semibold text-muted-foreground block uppercase">
                    Boarding Progress
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {tripInfo.boardedPassengers}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      / {tripInfo.totalPassengers} Boarded
                    </span>
                  </div>
                </div>

                {/* Circular / Visual ratio */}
                <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  {tripInfo.totalPassengers > 0
                    ? `${Math.round((tripInfo.boardedPassengers / tripInfo.totalPassengers) * 100)}%`
                    : "0%"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Passenger Roll Call */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/60 p-1">
              <TabsTrigger value="ALL" className="text-xs">
                All ({tripInfo?.totalPassengers ?? 0})
              </TabsTrigger>
              <TabsTrigger value="BOARDED" className="text-xs">
                Boarded ({tripInfo?.boardedPassengers ?? 0})
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="text-xs">
                Awaiting Boarding (
                {Math.max(
                  0,
                  (tripInfo?.totalPassengers ?? 0) - (tripInfo?.boardedPassengers ?? 0)
                )}
                )
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by passenger, ticket, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-9 bg-card"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Table / Loading / Empty */}
        {isManifestLoading ? (
          <Card className="border-border/80 bg-card p-12 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold text-muted-foreground">
                Connecting to Coast Guard manifest database...
              </p>
            </div>
          </Card>
        ) : isManifestError ? (
          <Card className="border-destructive/20 bg-destructive/5 p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Failed to load manifest</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {manifestError instanceof Error
                ? manifestError.message
                : "Unable to retrieve trip passenger manifest from the server."}
            </p>
            <div className="mt-4">
              <Button
                size="sm"
                onClick={() => void refetchManifest()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Retry
              </Button>
            </div>
          </Card>
        ) : !selectedTripId ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 text-center px-4">
            <Ship className="h-10 w-10 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-bold text-foreground">No sailing trip selected</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
              Please choose a scheduled ferry departure from the dropdown above to view its passenger roll call.
            </p>
          </div>
        ) : passengers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 text-center px-4">
            <Users className="h-10 w-10 text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-bold text-foreground">
              {searchTerm ? "No matching passengers found" : "No booked passengers on this trip"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
              {searchTerm
                ? `No passenger found matching "${searchTerm}". Try another search term.`
                : "No customer bookings have been confirmed yet for this scheduled sailing."}
            </p>
          </div>
        ) : (
          <DashboardTableCard
            title={`Passenger Roll Call (${passengers.length} Registered)`}
            columns={passengerColumns}
            data={passengers}
            keyExtractor={(item) => item.ticketId}
          />
        )}
      </div>

      {/* Fast Board / QR Pass Modal */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Fast Board / QR Pass Entry
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Scan barcode, QR payload, or enter Ticket Number / Booking Reference.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleScannerSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="scanInput" className="text-xs font-semibold text-foreground">
                Ticket Number / Reference *
              </Label>
              <Input
                id="scanInput"
                placeholder="e.g. TKT-98321 or BK-3498"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                autoFocus
                required
                className="text-xs h-9 font-mono uppercase"
              />
              <p className="text-[10px] text-muted-foreground">
                Point handheld scanner here or type ticket number and press Enter.
              </p>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsScannerOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={boardMutation.isPending || !scanInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                {boardMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                )}
                Confirm Boarding
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OperatorManifestPage() {
  return (
    <React.Suspense fallback={<ManifestLoadingFallback />}>
      <ManifestContent />
    </React.Suspense>
  );
}
