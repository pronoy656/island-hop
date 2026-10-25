"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  Filter,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Ship,
  Ticket,
  Users,
  X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { useAdminBookingsQuery, useDebounce } from "@/hooks";
import type { IAdminBookingItem } from "@/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import {
  BookingDetailsModal,
  DashboardTableCard,
  StatusBadge,
  type TableColumn
} from "@/widgets";

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

type BookingStatusTab = "ALL" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" | "PENDING";

export default function AdminBookingsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [activeTab, setActiveTab] = React.useState<BookingStatusTab>("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [selectedBooking, setSelectedBooking] = React.useState<IAdminBookingItem | null>(null);

  // Reset to first page when search query or filter tab changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminBookingsQuery({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: activeTab === "ALL" ? undefined : activeTab
  });

  const bookings = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  };

  const totalCount = meta.total ?? bookings.length;
  const totalPages = Math.max(1, meta.totalPages ?? Math.ceil(totalCount / limit));

  // Quick stat counts from the current page/dataset
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const checkedInCount = bookings.filter((b) => b.status === "CHECKED_IN").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const bookingColumns: TableColumn<IAdminBookingItem>[] = [
    {
      header: "BOOKING REFERENCE",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-foreground">
                {item.reference}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(item.reference, "Reference")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy Reference"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {item.createdAt ? format(new Date(item.createdAt), "MMM dd, yyyy") : "—"}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "PASSENGER",
      cell: (item) => (
        <div className="space-y-0.5 max-w-[180px]">
          <div className="font-bold text-foreground text-xs truncate">
            {item.leadPassengerName}
          </div>
          <div className="text-[11px] text-muted-foreground truncate font-mono flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{item.leadPassengerEmail}</span>
          </div>
          {item.leadPassengerPhone && (
            <div className="text-[10px] text-muted-foreground/80 truncate font-mono flex items-center gap-1">
              <Phone className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
              <span>{item.leadPassengerPhone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: "ROUTE & PORTS",
      cell: (item) => {
        const schedule = item.schedule;
        const dep = schedule?.route?.departurePort?.name || "Malé Terminal";
        const arr = schedule?.route?.destinationPort?.name || "Island Jetty";
        return (
          <div className="space-y-0.5 max-w-[190px]">
            <div className="font-medium text-xs text-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="truncate">{dep}</span>
            </div>
            <div className="text-muted-foreground text-[11px] flex items-center gap-1 pl-3.5">
              <span>➔</span>
              <span className="truncate">{arr}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: "OPERATOR & FERRY",
      cell: (item) => {
        const schedule = item.schedule;
        const opName = schedule?.route?.operator?.companyName || "Commercial Carrier";
        const ferryName = schedule?.ferry?.name || "Express Ferry";
        return (
          <div className="space-y-0.5 max-w-[150px]">
            <div className="font-semibold text-xs text-foreground truncate">
              {opName}
            </div>
            <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              <Ship className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{ferryName}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: "TRAVEL TIME",
      cell: (item) => {
        const time = item.schedule?.departureTime;
        if (!time) return <span className="text-muted-foreground text-xs">—</span>;
        const dateObj = new Date(time);
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-foreground">
              {format(dateObj, "MMM dd, yyyy")}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {format(dateObj, "hh:mm a")}
            </div>
          </div>
        );
      }
    },
    {
      header: "PAX",
      align: "center",
      headerClassName: "text-center",
      cell: (item) => (
        <div className="flex flex-col items-center justify-center">
          <span className="font-bold text-xs text-foreground">
            {item.adultsCount + item.childrenCount}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {item.adultsCount}A{item.childrenCount > 0 ? ` + ${item.childrenCount}C` : ""}
          </span>
        </div>
      )
    },
    {
      header: "AMOUNT",
      cell: (item) => (
        <div className="font-black text-xs text-foreground">
          ${Number(item.totalAmount).toFixed(2)}
          <span className="text-[10px] font-bold text-muted-foreground ml-0.5">
            {item.currency || "USD"}
          </span>
        </div>
      )
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setSelectedBooking(item)}
            className="h-8 gap-1.5 px-3 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Platform Bookings
            </h1>
            <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30 bg-primary/5">
              {totalCount} Total
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Live centralized reservation manifest across all island transfer routes and operators.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 h-9 px-3.5 text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>{isFetching ? "Syncing..." : "Sync Live Data"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Bookings</p>
              <p className="text-2xl font-black text-foreground mt-1">
                {totalCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Platform recorded</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Confirmed</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {confirmedCount} Active
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tickets confirmed</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Checked In</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {checkedInCount} Boarded
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Boarding passes scanned</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Ticket className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Cancelled</p>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {cancelledCount} Cancelled
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Released seats</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Controls */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as BookingStatusTab)}
          className="w-full"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="h-10 p-1 bg-muted/80 max-w-full overflow-x-auto flex flex-nowrap">
              <TabsTrigger value="ALL" className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap">
                All Bookings
              </TabsTrigger>
              <TabsTrigger value="CONFIRMED" className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap">
                Confirmed
              </TabsTrigger>
              <TabsTrigger value="CHECKED_IN" className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap">
                Checked In
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap">
                Completed
              </TabsTrigger>
              <TabsTrigger value="CANCELLED" className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap">
                Cancelled
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap">
                Pending
              </TabsTrigger>
            </TabsList>

            {/* Search Input & Page Size Select */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search reference, passenger, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-9 pr-8 text-xs font-medium rounded-xl border-border/80 bg-background"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="w-36 shrink-0">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-medium rounded-xl border-border/80 bg-background">
                    <SelectValue placeholder="Page Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Tabs>

        {/* Bookings Data Table Card */}
        {isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h2 className="text-lg font-bold text-foreground">Failed to Load Platform Bookings</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {error?.message || "Could not retrieve bookings from the live server. Please verify your connection."}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="h-96 rounded-2xl border border-border/60 bg-muted/20 animate-pulse flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">
              Retrieving live platform bookings...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <DashboardTableCard
              title={`Platform Bookings Manifest (${totalCount})`}
              columns={bookingColumns}
              data={bookings}
              keyExtractor={(item) => item.id}
              emptyMessage={
                searchTerm
                  ? `No bookings matched your search query "${searchTerm}".`
                  : activeTab !== "ALL"
                  ? `No ${activeTab.toLowerCase()} bookings found.`
                  : "No platform bookings have been recorded yet."
              }
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 py-2 text-xs">
                <span className="text-muted-foreground font-medium">
                  Showing <strong className="text-foreground">{(page - 1) * limit + 1}</strong> to{" "}
                  <strong className="text-foreground">{Math.min(page * limit, totalCount)}</strong> of{" "}
                  <strong className="text-foreground">{totalCount}</strong> bookings
                </span>

                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 w-8 p-0"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                      let pageNumber = idx + 1;
                      if (totalPages > 5 && page > 3) {
                        pageNumber = page - 3 + idx;
                        if (pageNumber > totalPages) pageNumber = totalPages - (4 - idx);
                      }
                      return (
                        <Button
                          key={pageNumber}
                          variant={page === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNumber)}
                          className={`h-8 w-8 p-0 font-bold text-xs ${
                            page === pageNumber ? "bg-blue-600 text-white" : ""
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 w-8 p-0"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null);
        }}
        onBookingCancelled={() => {
          refetch();
        }}
      />
    </div>
  );
}
