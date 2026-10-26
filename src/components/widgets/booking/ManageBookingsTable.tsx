"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Filter,
  Loader2,
  Search,
  Ship,
  Sparkles,
  Ticket,
  User,
  X,
  XCircle
} from "lucide-react";
import { useQueryStates } from "nuqs";

import { cn } from "@/lib/utils";
import { BOOKING_STATUS_OPTIONS, manageBookingsParsers } from "@/schemas/manage-bookings-params";
import { useDebounce } from "@/hooks/use-debounce";
import { useMyBookingsQuery, useCancelBookingMutation } from "@/hooks/use-bookings";
import type { IBookingDetail } from "@/types";

import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/ui";

export function ManageBookingsTable() {
  const [params, setParams] = useQueryStates(manageBookingsParsers, {
    shallow: false
  });

  // Fetch real authenticated passenger bookings from GET /api/v1/bookings/my
  const { data: bookings = [], isLoading, isError, error, refetch } = useMyBookingsQuery();
  const cancelBookingMutation = useCancelBookingMutation();

  // Local state for immediate typing input, debounced before updating NUQS query
  const [searchTerm, setSearchTerm] = useState(params.search);
  const [prevParamSearch, setPrevParamSearch] = useState(params.search);
  if (params.search !== prevParamSearch) {
    setPrevParamSearch(params.search);
    setSearchTerm(params.search);
  }

  const debouncedSearch = useDebounce(searchTerm, 350);

  // Sync debounced search to NUQS params
  useEffect(() => {
    if (debouncedSearch !== params.search) {
      void setParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, params.search, setParams]);

  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<IBookingDetail | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);



  // Filter bookings based on debounced search and status filter
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      if (params.status !== "ALL" && b.status !== params.status) {
        return false;
      }

      // 2. Search Filter (Reference, Route Ports, Operator, Ferry, Passenger Names)
      if (params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        const matchesRef = b.reference.toLowerCase().includes(query);
        const depPort = b.schedule?.route?.departurePort?.name?.toLowerCase() || "";
        const destPort = b.schedule?.route?.destinationPort?.name?.toLowerCase() || "";
        const operatorName = b.schedule?.route?.operator?.companyName?.toLowerCase() || "";
        const ferryName = b.schedule?.ferry?.name?.toLowerCase() || "";
        const leadPassenger = b.leadPassengerName?.toLowerCase() || "";
        const matchesTickets = b.tickets?.some((t) => t.passengerName?.toLowerCase().includes(query));

        if (
          !matchesRef &&
          !depPort.includes(query) &&
          !destPort.includes(query) &&
          !operatorName.includes(query) &&
          !ferryName.includes(query) &&
          !leadPassenger.includes(query) &&
          !matchesTickets
        ) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, params.status, params.search]);

  // Pagination calculation
  const pageSize = 10;
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const currentPage = Math.min(Math.max(params.page, 1), totalPages);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    try {
      await cancelBookingMutation.mutateAsync({
        bookingId: selectedBookingToCancel.id,
        reason: "Cancelled by passenger from self-service portal"
      });
      setIsCancelDialogOpen(false);
      setSelectedBookingToCancel(null);
    } catch {
      // Toast notifications are already triggered by the mutation
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {/* Search & Status Filter Chips Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input with Debounce */}
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search reference, island, ferry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-border/80 dark:bg-card h-9 w-full rounded-xl bg-white pr-8 pl-9 text-xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  void setParams({ search: "", page: 1 });
                }}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {BOOKING_STATUS_OPTIONS.map((statusOption) => {
              const isSelected = params.status === statusOption;
              const label =
                statusOption === "ALL"
                  ? "All"
                  : statusOption === "CHECKED_IN"
                  ? "Checked In"
                  : statusOption.charAt(0) + statusOption.slice(1).toLowerCase();

              return (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() =>
                    void setParams({
                      status: statusOption,
                      page: 1
                    })
                  }
                  className={cn(
                    "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl px-3.5 text-xs font-semibold tracking-normal transition-all cursor-pointer select-none border",
                    isSelected
                      ? "bg-[#003B95] text-white border-[#003B95] shadow-xs dark:bg-blue-600 dark:border-blue-600"
                      : "bg-white dark:bg-card text-muted-foreground border-border/80 hover:border-border hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings Table Card */}
        <Card className="border-border/80 dark:bg-card overflow-hidden rounded-3xl border bg-white shadow-sm">
          <CardContent className="p-0">
            {isError ? (
              <div className="p-10 text-center space-y-3">
                <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
                <h3 className="text-sm font-bold text-foreground">Could not load bookings</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {error instanceof Error ? error.message : "An error occurred while fetching your bookings from the server."}
                </p>
                <Button size="sm" onClick={() => void refetch()} className="rounded-xl text-xs font-bold">
                  Try Again
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[170px]">Booking Ref</TableHead>
                    <TableHead>Route &amp; Ferry</TableHead>
                    <TableHead>Travel Schedule</TableHead>
                    <TableHead>Lead Passenger</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Skeleton Loading Rows
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-28 rounded bg-muted animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-44 rounded bg-muted animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-36 rounded bg-muted animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                        <TableCell><div className="h-5 w-20 rounded-full bg-muted animate-pulse" /></TableCell>
                        <TableCell className="text-right"><div className="ml-auto h-7 w-20 rounded bg-muted animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground h-48 text-center text-xs"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          {bookings.length === 0 ? (
                            <>
                              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Ship className="h-6 w-6" />
                              </div>
                              <span className="text-foreground text-sm font-bold">
                                You don't have any bookings yet
                              </span>
                              <span className="text-muted-foreground text-xs max-w-sm">
                                Find ferry schedules across Malé, Maafushi, Hulhumalé and book your seat with digital instant tickets.
                              </span>
                              <div className="pt-2">
                                <Button asChild size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                                  <Link href="/ferries">
                                    <Sparkles className="h-3.5 w-3.5" /> Search Ferries
                                  </Link>
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <Filter className="text-muted-foreground/50 h-8 w-8" />
                              <span className="text-foreground font-semibold">
                                No matching bookings found
                              </span>
                              <span className="text-[11px]">
                                Try adjusting your search query or switching active status tab.
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBookings.map((b) => {
                      const depPort = b.schedule?.route?.departurePort?.name || "Malé";
                      const destPort = b.schedule?.route?.destinationPort?.name || "Destination";
                      const operatorName = b.schedule?.route?.operator?.companyName || "Ferry Operator";
                      const ferryName = b.schedule?.ferry?.name || "Vessel";

                      const departureDateFormatted = b.schedule?.departureTime
                        ? new Date(b.schedule.departureTime).toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })
                        : "Scheduled";

                      const departureTimeFormatted = b.schedule?.departureTime
                        ? new Date(b.schedule.departureTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })
                        : "TBD";

                      const arrivalTimeFormatted = b.schedule?.arrivalTime
                        ? new Date(b.schedule.arrivalTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })
                        : "";

                      const passengerCount =
                        b.tickets && b.tickets.length > 0
                          ? b.tickets.length
                          : (b.adultsCount || 0) + (b.childrenCount || 0) || 1;

                      return (
                        <TableRow key={b.id}>
                          {/* Booking Reference */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <Link
                                href={`/manage-booking/${b.reference}`}
                                className="font-mono text-xs font-bold text-[#003B95] dark:text-blue-400 hover:underline inline-block"
                              >
                                {b.reference}
                              </Link>
                              <div className="text-[10px] text-muted-foreground">
                                Booked {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          </TableCell>

                          {/* Route & Ferry */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="text-foreground flex items-center gap-1.5 font-bold text-xs">
                                <Ship className="text-primary h-3.5 w-3.5 shrink-0" />
                                <span>
                                  {depPort} &rarr; {destPort}
                                </span>
                              </div>
                              <div className="text-muted-foreground text-[11px] font-medium">
                                {ferryName} &bull; {operatorName}
                              </div>
                            </div>
                          </TableCell>

                          {/* Travel Date & Time */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="text-foreground text-xs font-semibold flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>{departureDateFormatted}</span>
                              </div>
                              <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>
                                  {departureTimeFormatted}
                                  {arrivalTimeFormatted ? ` - ${arrivalTimeFormatted}` : ""}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Lead Passenger */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="text-foreground text-xs font-semibold flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate max-w-[120px]">{b.leadPassengerName}</span>
                              </div>
                              <div className="text-muted-foreground text-[10px]">
                                {passengerCount} {passengerCount === 1 ? "Seat" : "Seats"}
                              </div>
                            </div>
                          </TableCell>

                          {/* Total Paid */}
                          <TableCell className="text-foreground font-mono text-xs font-bold">
                            ${(b.totalAmount ?? 0).toFixed(2)}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                b.status === "CONFIRMED"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                                  : b.status === "CHECKED_IN"
                                  ? "border-blue-500/30 bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400"
                                  : b.status === "CANCELLED"
                                  ? "border-destructive/30 bg-destructive/10 text-destructive text-[10px] font-bold"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 text-[10px] font-bold"
                              }
                            >
                              {b.status === "CHECKED_IN" ? "CHECKED IN" : b.status}
                            </Badge>
                          </TableCell>

                          {/* Action Column */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* 1. Digital Ticket Pass */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg"
                                    asChild
                                  >
                                    <Link href={`/tickets/${b.reference}`}>
                                      <Download className="h-4 w-4" />
                                      <span className="sr-only">Digital Pass</span>
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">Digital Pass &amp; QR</TooltipContent>
                              </Tooltip>

                              {/* 2. Cancel Ticket */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={b.status === "CANCELLED" || cancelBookingMutation.isPending}
                                    onClick={() => {
                                      setSelectedBookingToCancel(b);
                                      setIsCancelDialogOpen(true);
                                    }}
                                    className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg disabled:opacity-30"
                                  >
                                    <Ban className="h-4 w-4" />
                                    <span className="sr-only">Cancel Booking</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  {b.status === "CANCELLED" ? "Already Cancelled" : "Cancel Booking"}
                                </TooltipContent>
                              </Tooltip>

                              {/* 3. Details Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-primary h-8 w-8 rounded-lg"
                                    asChild
                                  >
                                    <Link href={`/manage-booking/${b.reference}`}>
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View Details</span>
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">View Details</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination Footer */}
            {!isError && filteredBookings.length > 0 && (
              <div className="border-border/60 flex items-center justify-between border-t px-6 py-4 text-xs">
                <div className="text-muted-foreground">
                  Showing{" "}
                  <span className="text-foreground font-semibold">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-foreground font-semibold">
                    {Math.min(currentPage * pageSize, filteredBookings.length)}
                  </span>{" "}
                  of <span className="text-foreground font-semibold">{filteredBookings.length}</span>{" "}
                  bookings
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void setParams({ page: Math.max(currentPage - 1, 1) })}
                    disabled={currentPage <= 1}
                    className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </Button>
                  <span className="text-foreground px-2 font-semibold">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void setParams({ page: Math.min(currentPage + 1, totalPages) })}
                    disabled={currentPage >= totalPages}
                    className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel Booking Confirmation Modal */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <XCircle className="h-5 w-5" />
                <span>Cancel Booking</span>
              </DialogTitle>
              <DialogDescription className="space-y-2 pt-2 text-xs">
                <p>
                  Are you sure you want to cancel booking{" "}
                  <span className="text-foreground font-mono font-bold">
                    {selectedBookingToCancel?.reference}
                  </span>
                  ?
                </p>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  Your seat reservation will be released back to the ferry schedule immediately, and the status will update to CANCELLED.
                </div>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                  Keep Booking
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                size="sm"
                disabled={cancelBookingMutation.isPending}
                onClick={handleConfirmCancel}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {cancelBookingMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
