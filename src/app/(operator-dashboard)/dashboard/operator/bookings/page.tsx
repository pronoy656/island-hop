"use client";

import * as React from "react";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Ship,
  Ticket,
  Users
} from "lucide-react";
import { format, isValid } from "date-fns";
import { toast } from "sonner";

import {
  useDebounce,
  useOperatorBookingsQuery,
  useOperatorCheckInMutation
} from "@/hooks";
import type { IOperatorBookingItem } from "@/types";
import { Badge, Button, Card, CardContent } from "@/ui";
import {
  BookingDetailsModal,
  DashboardTableCard,
  StatusBadge,
  TablePagination,
  TableToolbar,
  type TableColumn,
  type TableToolbarTab
} from "@/widgets";

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

type BookingFilterTab = "all" | "confirmed" | "checked-in" | "cancelled" | "pending";

export default function OperatorBookingsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [activeTab, setActiveTab] = React.useState<BookingFilterTab>("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedBooking, setSelectedBooking] = React.useState<IOperatorBookingItem | null>(null);
  const [checkingInId, setCheckingInId] = React.useState<string | null>(null);

  // Status mapping for the API query
  const statusParam = React.useMemo(() => {
    if (activeTab === "all") return undefined;
    if (activeTab === "checked-in") return "CHECKED_IN";
    return activeTab.toUpperCase();
  }, [activeTab]);

  // Reset to first page when search query or filter tab changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, pageSize]);

  // Fetch live bookings for this operator
  const { data, isLoading, isError, error, refetch, isFetching } = useOperatorBookingsQuery({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    status: statusParam
  });

  const checkInMutation = useOperatorCheckInMutation();

  const bookings = data?.bookings ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1
  };

  const totalCount = meta.total ?? bookings.length;
  const totalPages = Math.max(1, meta.totalPages ?? Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Quick stat counts from the current dataset
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const checkedInCount = bookings.filter((b) => b.status === "CHECKED_IN").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    }
  };

  const formatDateSafe = (dateString?: string, formatStr: string = "MMM dd, yyyy") => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isValid(d)) return format(d, formatStr);
      return dateString;
    } catch {
      return dateString;
    }
  };

  const handleCheckIn = (item: IOperatorBookingItem) => {
    setCheckingInId(item.id);
    checkInMutation.mutate(item.id, {
      onSuccess: () => {
        if (selectedBooking?.id === item.id) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: "CHECKED_IN" } : null));
        }
        setCheckingInId(null);
      },
      onError: () => {
        setCheckingInId(null);
      }
    });
  };

  // Tab configurations with live counts
  const filterTabs: TableToolbarTab<BookingFilterTab>[] = React.useMemo(
    () => [
      { value: "all", label: "All Bookings", count: totalCount },
      {
        value: "confirmed",
        label: "Confirmed",
        count: activeTab === "confirmed" ? totalCount : confirmedCount
      },
      {
        value: "checked-in",
        label: "Checked In",
        count: activeTab === "checked-in" ? totalCount : checkedInCount
      },
      {
        value: "cancelled",
        label: "Cancelled",
        count: activeTab === "cancelled" ? totalCount : cancelledCount
      },
      {
        value: "pending",
        label: "Pending",
        count: activeTab === "pending" ? totalCount : pendingCount
      }
    ],
    [totalCount, confirmedCount, checkedInCount, cancelledCount, pendingCount, activeTab]
  );

  const bookingColumns: TableColumn<IOperatorBookingItem>[] = [
    {
      header: "BOOKING REFERENCE",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedBooking(item)}
                className="font-mono text-xs font-bold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors text-left cursor-pointer"
              >
                {item.reference}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(item.reference, "Reference")}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Copy Reference"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatDateSafe(item.createdAt)}
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
        const arr = schedule?.route?.destinationPort?.name || "Destination Jetty";
        return (
          <div className="space-y-0.5 max-w-[190px]">
            <div className="font-medium text-xs text-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
      header: "FERRY VESSEL",
      cell: (item) => {
        const schedule = item.schedule;
        const ferryName = schedule?.ferry?.name || "Fleet Vessel";
        const ferryInfo = schedule?.ferry?.type || schedule?.ferry?.registration;
        return (
          <div className="space-y-0.5 max-w-[150px]">
            <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1">
              <Ship className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{ferryName}</span>
            </div>
            {ferryInfo && (
              <div className="text-[11px] text-muted-foreground font-mono truncate pl-4.5">
                {ferryInfo}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: "DEPARTURE",
      cell: (item) => {
        const time = item.schedule?.departureTime;
        if (!time) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-foreground">
              {formatDateSafe(time, "MMM dd, yyyy")}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
              <span>{formatDateSafe(time, "hh:mm a")}</span>
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
      cell: (item) => {
        const isCheckingThis = checkingInId === item.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            {item.status === "CONFIRMED" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isCheckingThis || checkInMutation.isPending}
                onClick={() => handleCheckIn(item)}
                className="h-7 gap-1 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 cursor-pointer transition-colors"
                title="Mark passenger as boarded"
              >
                {isCheckingThis ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span>Check In</span>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSelectedBooking(item)}
              className="h-7 gap-1 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Details</span>
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Passenger Bookings
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-300/40 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30"
            >
              {totalCount} Total
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Live reservation manifest, ticket verification, and passenger check-in for your ferry routes.
          </p>
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Assigned to fleet</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Confirmed</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {confirmedCount} Ready
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting check-in</p>
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
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {checkedInCount} Boarded
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Passes verified</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Seats restored</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reusable Toolbar: Search Input on left + Filter Tabs on right */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search passenger, reference, route..."
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as BookingFilterTab)}
        tabs={filterTabs}
      />

      {/* Bookings Data Table Card */}
      {isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Failed to Load Operator Bookings</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {error?.message || "Could not retrieve bookings from the live server. Please verify your connection."}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="h-96 rounded-2xl border border-border/60 bg-muted/20 animate-pulse flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-muted-foreground">
            Retrieving live passenger bookings...
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <DashboardTableCard
            title="Passenger Manifest"
            columns={bookingColumns}
            data={bookings}
            keyExtractor={(item) => item.id}
            emptyMessage={
              searchTerm
                ? `No bookings matched your search query "${searchTerm}".`
                : activeTab !== "all"
                ? `No ${activeTab.replace("-", " ")} bookings found for your fleet.`
                : "No customer bookings have been recorded for your fleet yet."
            }
          />

          {/* Reusable Pagination Controls */}
          <TablePagination
            page={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemName="bookings"
            isLoading={isFetching}
          />
        </div>
      )}

      {/* Comprehensive Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null);
        }}
        onCheckIn={(b) => handleCheckIn(b)}
        isCheckingIn={checkingInId === selectedBooking?.id || checkInMutation.isPending}
        onBookingCancelled={() => {
          refetch();
        }}
      />
    </div>
  );
}
