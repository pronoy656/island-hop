"use client";

import Link from "next/link";
import { format, isValid, parseISO } from "date-fns";
import {
  AlertCircle,
  DollarSign,
  MapPin,
  Ship,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users
} from "lucide-react";

import { useOperatorOverviewQuery } from "@/hooks";
import { useAuth } from "@/providers/AuthProvider";
import type { IOperatorOverviewBooking, IOperatorOverviewDeparture } from "@/types";
import { Button, Card, CardContent } from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

export default function OperatorOverviewPage() {
  const { user } = useAuth();
  const {
    data: overviewData,
    isLoading,
    isError,
    error,
    refetch
  } = useOperatorOverviewQuery();

  const kpis = overviewData?.kpis;
  const departures = overviewData?.todayDepartures ?? [];
  const bookings = overviewData?.recentBookings ?? [];

  // Format Departure Time safely
  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    try {
      const parsed = parseISO(timeString);
      if (isValid(parsed)) {
        return format(parsed, "hh:mm a");
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  // Streamlined columns for Today's Ferry Trips
  const scheduleColumns: TableColumn<IOperatorOverviewDeparture>[] = [
    {
      header: "FERRY",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Ship className="h-4 w-4" />
          </div>
          <div>
            <div className="text-foreground text-sm font-semibold">
              {item.ferry?.name || "Assigned Ferry"}
            </div>
            <div className="text-muted-foreground text-[11px]">
              {item.captain || item.ferry?.registration || "Captain Assigned"}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "ROUTE",
      cell: (item) => {
        const depPort = item.route?.departurePort?.name || "Origin";
        const destPort = item.route?.destinationPort?.name || "Destination";
        return (
          <div className="text-foreground flex items-center gap-1.5 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {depPort} <span className="text-muted-foreground">→</span> {destPort}
            </span>
          </div>
        );
      }
    },
    {
      header: "DEPARTURE",
      cell: (item) => (
        <div>
          <div className="text-foreground font-mono text-xs font-bold">
            {formatTime(item.departureTime)}
          </div>
          <div className="text-muted-foreground text-[11px]">{item.gate || "Gate Pier"}</div>
        </div>
      )
    },
    {
      header: "CAPACITY",
      className: "text-xs",
      cell: (item) => {
        const capacity = item.capacity || item.ferry?.capacity || 50;
        const booked = item.bookedSeats ?? 0;
        const pct = Math.min(Math.round((booked / capacity) * 100), 100);
        return (
          <div className="flex min-w-[100px] flex-col gap-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-foreground font-semibold">
                {booked}/{capacity}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      }
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
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-emerald-200 px-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          asChild
        >
          <Link href={item.id ? `/dashboard/operator/manifest?scheduleId=${item.id}` : "/dashboard/operator/manifest"}>
            Manifest
          </Link>
        </Button>
      )
    }
  ];

  // Streamlined columns for Recent Bookings
  const bookingColumns: TableColumn<IOperatorOverviewBooking>[] = [
    {
      header: "REFERENCE",
      cell: (item) => (
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
          {item.bookingReference || item.reference || "N/A"}
        </span>
      )
    },
    {
      header: "PASSENGER",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground text-sm">
            {item.passenger || item.leadPassengerName || "Guest"}
          </div>
          {(item.email || item.leadPassengerEmail) && (
            <div className="text-muted-foreground text-[10px] font-mono">
              {item.email || item.leadPassengerEmail}
            </div>
          )}
        </div>
      )
    },
    {
      header: "ROUTE",
      cell: (item) => {
        const routeName =
          item.route ||
          (item.schedule?.route?.departurePort?.name && item.schedule?.route?.destinationPort?.name
            ? `${item.schedule.route.departurePort.name} → ${item.schedule.route.destinationPort.name}`
            : "Maritime Route");
        return <span className="text-muted-foreground text-xs font-medium">{routeName}</span>;
      }
    },
    {
      header: "DEPARTURE",
      cell: (item) => (
        <span className="font-mono text-muted-foreground text-[11px]">
          {formatTime(item.departureTime || item.schedule?.departureTime)}
        </span>
      )
    },
    {
      header: "PAX",
      align: "center",
      cell: (item) => (
        <span className="text-center text-foreground font-semibold text-xs">
          {item.pax ?? item.tickets?.length ?? 1}
        </span>
      )
    },
    {
      header: "AMOUNT",
      cell: (item) => (
        <span className="font-bold text-foreground">
          ${(item.amount ?? item.totalAmount ?? 0).toFixed(2)}
        </span>
      )
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Modern, Clean & Professional Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Operator Overview
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Welcome back, <strong className="font-semibold text-foreground">{user?.name || "Operator Partner"}</strong>
        </p>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="text-sm">
              <span className="font-semibold">Failed to load overview data:</span>{" "}
              {error?.message || "Please check network or backend connection."}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refetch()}
            className="border-rose-300 bg-white text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-200"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4 Provider Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Passengers */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Today&apos;s Passengers
              </p>
              <p className="text-foreground text-2xl font-extrabold tracking-tight">
                {isLoading ? "..." : (kpis?.todayPassengers?.value ?? 0)}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {kpis?.todayPassengers?.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span>
                  {kpis?.todayPassengers?.changePercent
                    ? `+${kpis.todayPassengers.changePercent}% vs ${kpis.todayPassengers.comparedPeriod || "yesterday"}`
                    : "Live passengers"}
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Active Ferry */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Active Ferry
              </p>
              <p className="text-foreground text-2xl font-extrabold tracking-tight">
                {isLoading
                  ? "..."
                  : (kpis?.activeFleet?.ratio ||
                    `${kpis?.activeFleet?.inService ?? 0}/${kpis?.activeFleet?.total ?? 0}`)}
              </p>
              <p className="text-muted-foreground text-[11px] font-medium">
                {kpis?.activeFleet
                  ? `${kpis.activeFleet.inService} of ${kpis.activeFleet.total} vessels in service`
                  : "All vessels ready"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Ship className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Bookings */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Today&apos;s Bookings
              </p>
              <p className="text-foreground text-2xl font-extrabold tracking-tight">
                {isLoading ? "..." : (kpis?.todayBookings?.value ?? 0)}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {kpis?.todayBookings?.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span>
                  {kpis?.todayBookings?.changePercent
                    ? `+${kpis.todayBookings.changePercent}% vs ${kpis.todayBookings.comparedPeriod || "yesterday"}`
                    : "Active reservations"}
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Ticket className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Today&apos;s Net Revenue
              </p>
              <p className="text-foreground text-2xl font-extrabold tracking-tight">
                {isLoading
                  ? "..."
                  : `$${(kpis?.netRevenue?.value ?? 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {kpis?.netRevenue?.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span>
                  {kpis?.netRevenue?.changePercent
                    ? `+${kpis.netRevenue.changePercent}% vs ${kpis.netRevenue.comparedPeriod || "yesterday"}`
                    : "Gross payout"}
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Ferry Trips */}
      <DashboardTableCard
        title="Today's Ferry Trips"
        viewAllHref="/dashboard/operator/schedules"
        columns={scheduleColumns}
        data={departures}
        keyExtractor={(item) => item.id}
        emptyMessage="No ferry departures scheduled for today."
      />

      {/* Recent Passenger Bookings */}
      <DashboardTableCard
        title="Recent Ticket Reservations"
        viewAllHref="/dashboard/operator/bookings"
        columns={bookingColumns}
        data={bookings}
        keyExtractor={(item) => item.id}
        emptyMessage="No recent passenger bookings found."
      />
    </div>
  );
}
