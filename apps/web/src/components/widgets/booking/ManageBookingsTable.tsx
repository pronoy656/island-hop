"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  Ship,
  X
} from "lucide-react";
import { useQueryStates } from "nuqs";

import { BOOKING_STATUS_OPTIONS, manageBookingsParsers } from "@/schemas/manage-bookings-params";

import { useDebounce } from "@/hooks/use-debounce";
import type { PassengerBooking } from "@/data/bookings";
import { MOCK_PASSENGER_BOOKINGS } from "@/data/bookings";

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

  const [bookings, setBookings] = useState<PassengerBooking[]>(MOCK_PASSENGER_BOOKINGS);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<PassengerBooking | null>(
    null
  );
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Filter bookings based on debounced search and status filter
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      if (params.status !== "ALL" && b.status !== params.status) {
        return false;
      }

      // 2. Search Filter (Reference, Route Ports, Operator, Passenger Names)
      if (params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        const matchesRef = b.reference.toLowerCase().includes(query);
        const matchesOperator = b.operator.toLowerCase().includes(query);
        const matchesFrom = b.from.toLowerCase().includes(query);
        const matchesTo = b.to.toLowerCase().includes(query);
        const matchesPassengers = b.passengers.some((p) => p.name.toLowerCase().includes(query));

        if (!matchesRef && !matchesOperator && !matchesFrom && !matchesTo && !matchesPassengers) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, params.status, params.search]);

  // Pagination calculation
  const pageSize = 5;
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const currentPage = Math.min(Math.max(params.page, 1), totalPages);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleConfirmCancel = () => {
    if (!selectedBookingToCancel) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === selectedBookingToCancel.id ? { ...b, status: "CANCELLED" } : b))
    );
    setIsCancelDialogOpen(false);
    setSelectedBookingToCancel(null);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {/* Search & Status Filters Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input with Debounce */}
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search reference, island, operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-border/80 dark:bg-card h-10 rounded-2xl bg-white pr-8 pl-9 text-xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  void setParams({ search: "", page: 1 });
                }}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="border-border/80 dark:bg-card flex flex-wrap items-center gap-1.5 rounded-2xl border bg-white p-1 shadow-xs">
            {BOOKING_STATUS_OPTIONS.map((statusOption) => {
              const isSelected = params.status === statusOption;
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
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-[#003B95] text-white shadow-xs dark:bg-blue-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {statusOption === "ALL" ? "All Bookings" : statusOption}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings Table Card */}
        <Card className="border-border/80 dark:bg-card overflow-hidden rounded-3xl border bg-white shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[180px]">Booking Ref</TableHead>
                  <TableHead>Route &amp; Operator</TableHead>
                  <TableHead>Travel Date &amp; Time</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground h-36 text-center text-xs"
                    >
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Filter className="text-muted-foreground/50 h-6 w-6" />
                        <span className="text-foreground font-semibold">
                          No matching bookings found
                        </span>
                        <span className="text-[11px]">
                          Try adjusting your search keywords or active status filter.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBookings.map((b) => (
                    <TableRow key={b.id}>
                      {/* Booking Reference */}
                      <TableCell className="font-mono text-xs font-bold text-[#003B95] dark:text-blue-400">
                        {b.reference}
                      </TableCell>

                      {/* Route & Operator */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-foreground flex items-center gap-1.5 font-bold">
                            <Ship className="text-primary h-3.5 w-3.5 shrink-0" />
                            <span>
                              {b.from} &rarr; {b.to}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-[11px] font-medium">
                            {b.operator}
                          </div>
                        </div>
                      </TableCell>

                      {/* Travel Date & Time */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-foreground text-xs font-semibold">
                            {b.departureDate}
                          </div>
                          <div className="text-muted-foreground text-[11px]">{b.departureTime}</div>
                        </div>
                      </TableCell>

                      {/* Passengers */}
                      <TableCell className="text-foreground text-xs font-medium">
                        {b.passengers.length}{" "}
                        {b.passengers.length === 1 ? "Passenger" : "Passengers"}
                      </TableCell>

                      {/* Total Paid */}
                      <TableCell className="text-foreground font-mono text-xs font-bold">
                        ${b.totalPaid.toFixed(2)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            b.status === "CONFIRMED"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                              : b.status === "CANCELLED"
                                ? "border-destructive/30 bg-destructive/10 text-destructive text-[10px] font-bold"
                                : "border-muted text-muted-foreground text-[10px] font-bold"
                          }
                        >
                          {b.status}
                        </Badge>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. Download Ticket */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg"
                                asChild
                              >
                                <Link
                                  href={`/tickets/${b.reference}?tripId=${b.tripId}&departureDate=${encodeURIComponent(
                                    b.departureDate
                                  )}`}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download Ticket</span>
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Download Ticket</TooltipContent>
                          </Tooltip>

                          {/* 2. Cancel Ticket */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={b.status === "CANCELLED"}
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
                            <TooltipContent className="text-xs">Cancel Ticket</TooltipContent>
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
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="border-border/60 flex items-center justify-between border-t px-6 py-4 text-xs">
              <div className="text-muted-foreground">
                Showing{" "}
                <span className="text-foreground font-semibold">
                  {filteredBookings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
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
          </CardContent>
        </Card>

        {/* Cancel Booking Confirmation Modal */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel booking{" "}
                <span className="text-foreground font-mono font-bold">
                  {selectedBookingToCancel?.reference}
                </span>
                ? Your seat reservation will be released immediately and eligible refunds will be
                processed.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                  Keep Booking
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmCancel}
                className="rounded-xl text-xs font-bold"
              >
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
