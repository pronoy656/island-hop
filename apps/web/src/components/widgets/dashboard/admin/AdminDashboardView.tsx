"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  CircleDollarSign,
  Ship,
  Ticket,
  Users,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  ADMIN_DASHBOARD_DATA,
  ADMIN_DASHBOARD_PERIOD_DATA,
  type RecentBookingItem,
  type RecentPaymentItem,
  type RecentProviderItem,
  type TimeRangeFilter
} from "@/data";
import { cn } from "@/lib/utils";
import {
  BookingsVolumeChart,
  DashboardTableCard,
  PaymentDetailsModal,
  RevenueAnalyticsChart,
  StatCard,
  StatusBadge,
  TimeRangeFilterSelect,
  type TableColumn
} from "../index";

export function AdminDashboardView() {
  const [globalTimeRange, setGlobalTimeRange] = React.useState<TimeRangeFilter>("30d");
  const [revenueTimeRange, setRevenueTimeRange] = React.useState<TimeRangeFilter>("30d");
  const [bookingsTimeRange, setBookingsTimeRange] = React.useState<TimeRangeFilter>("30d");
  const [selectedPayment, setSelectedPayment] = React.useState<RecentPaymentItem | null>(null);

  // Global KPI & Overview data
  const currentGlobalPeriod = ADMIN_DASHBOARD_PERIOD_DATA[globalTimeRange];
  const { summaryStats, bookingOverview, paymentOverview } = currentGlobalPeriod;

  // Chart-specific independent data
  const revenueChartData = ADMIN_DASHBOARD_PERIOD_DATA[revenueTimeRange].revenueChart;
  const bookingsChartData = ADMIN_DASHBOARD_PERIOD_DATA[bookingsTimeRange].bookingsChart;

  const { recentBookings, recentProviders, recentPayments } = ADMIN_DASHBOARD_DATA;

  // Handler for global time range change that also syncs the charts
  const handleGlobalTimeRangeChange = (range: TimeRangeFilter) => {
    setGlobalTimeRange(range);
    setRevenueTimeRange(range);
    setBookingsTimeRange(range);
  };

  // Streamlined columns for Recent Bookings (Side-by-side card)
  const bookingColumns: TableColumn<RecentBookingItem>[] = [
    {
      header: "REFERENCE",
      accessorKey: "bookingReference",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300 text-[11px]"
    },
    {
      header: "PASSENGER",
      accessorKey: "passenger",
      className: "font-semibold text-foreground truncate max-w-[120px]"
    },
    {
      header: "ROUTE",
      accessorKey: "route",
      className: "text-foreground font-medium text-xs truncate max-w-[140px]"
    },
    {
      header: "AMOUNT",
      className: "font-bold text-foreground",
      cell: (item) => `$${item.amount.toFixed(2)}`
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
        <Link
          href={`/manage-booking/${item.bookingReference}`}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-colors"
        >
          View
        </Link>
      )
    }
  ];

  // Streamlined columns for Recent Providers (Side-by-side card)
  const providerColumns: TableColumn<RecentProviderItem>[] = [
    {
      header: "PROVIDER",
      accessorKey: "provider",
      className: "font-semibold text-foreground truncate max-w-[150px]"
    },
    {
      header: "CONTACT PERSON",
      accessorKey: "contactPerson",
      className: "text-muted-foreground font-medium truncate max-w-[130px]"
    },
    {
      header: "FERRIES",
      accessorKey: "totalFerries",
      className: "text-center text-foreground font-medium",
      align: "center"
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
        <Link
          href={`/dashboard/admin/providers/${item.id}`}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-colors"
        >
          View Provider
        </Link>
      )
    }
  ];

  // Columns for Recent Payments
  const paymentColumns: TableColumn<RecentPaymentItem>[] = [
    {
      header: "BOOKING REFERENCE",
      accessorKey: "bookingReference",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300"
    },
    {
      header: "PROVIDER",
      accessorKey: "provider",
      className: "text-muted-foreground"
    },
    {
      header: "BOOKING AMOUNT",
      className: "font-bold text-foreground",
      cell: (item) => `$${item.bookingAmount.toFixed(2)}`
    },
    {
      header: "COMMISSION",
      className: "font-semibold text-blue-600 dark:text-blue-400",
      cell: (item) => `$${item.commission.toFixed(2)}`
    },
    {
      header: "PROVIDER AMOUNT",
      className: "font-medium text-foreground",
      cell: (item) => `$${item.providerAmount.toFixed(2)}`
    },
    {
      header: "PAYMENT STATUS",
      cell: (item) => <StatusBadge status={item.paymentStatus} />
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <button
          type="button"
          onClick={() => setSelectedPayment(item)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-colors cursor-pointer"
        >
          View
        </button>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header with Title and Filter Dropdown */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <span className="bg-primary/10 text-primary border-primary/20 hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
              Live Metrics
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Overview of FerryGo platform activity and real-time operations.
          </p>
        </div>

        {/* Global Filter Option Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-muted-foreground hidden text-xs font-medium lg:inline-block">
            Filter Period:
          </span>
          <TimeRangeFilterSelect value={globalTimeRange} onChange={handleGlobalTimeRangeChange} />
        </div>
      </div>

      {/* Top 4 Stat Cards with Wave Sparklines & Increase/Decrease Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="TOTAL PROVIDERS"
          value={summaryStats.totalProviders.value}
          icon={Building2}
          changePercent={summaryStats.totalProviders.changePercent}
          trend={summaryStats.totalProviders.trend}
          comparisonText={summaryStats.totalProviders.comparisonText}
          showWave={true}
        />
        <StatCard
          label="TOTAL FERRIES"
          value={summaryStats.totalFerries.value}
          icon={Ship}
          changePercent={summaryStats.totalFerries.changePercent}
          trend={summaryStats.totalFerries.trend}
          comparisonText={summaryStats.totalFerries.comparisonText}
          showWave={true}
        />
        <StatCard
          label="TOTAL BOOKINGS"
          value={summaryStats.totalBookings.formattedValue || summaryStats.totalBookings.value}
          icon={Ticket}
          changePercent={summaryStats.totalBookings.changePercent}
          trend={summaryStats.totalBookings.trend}
          comparisonText={summaryStats.totalBookings.comparisonText}
          showWave={true}
        />
        <StatCard
          label="TOTAL PASSENGERS"
          value={summaryStats.totalPassengers.formattedValue || summaryStats.totalPassengers.value}
          icon={Users}
          changePercent={summaryStats.totalPassengers.changePercent}
          trend={summaryStats.totalPassengers.trend}
          comparisonText={summaryStats.totalPassengers.comparisonText}
          showWave={true}
        />
      </div>

      {/* Overview Cards Row (Booking Overview & Payment Overview) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Booking Overview Section with separate cards */}
        <div className="bg-card text-card-foreground border-border/80 rounded-xl border p-5 shadow-xs lg:col-span-6 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Booking Overview
            </h2>
            <span className="text-muted-foreground text-[11px] font-medium">
              Real-time reservations
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Confirmed Bookings Card */}
            <div className="bg-muted/30 dark:bg-zinc-800/30 border-border/60 rounded-xl border p-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">Confirmed Bookings</p>
                <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-md p-1">
                  <CalendarCheck className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-500">
                  {bookingOverview.confirmedBookings.value}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  +{bookingOverview.confirmedBookings.changePercent}%
                </span>
              </div>
            </div>

            {/* Cancelled Bookings Card */}
            <div className="bg-muted/30 dark:bg-zinc-800/30 border-border/60 rounded-xl border p-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">Cancelled Bookings</p>
                <div className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 rounded-md p-1">
                  <Ticket className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-500">
                  {bookingOverview.cancelledBookings.value}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] font-bold",
                    bookingOverview.cancelledBookings.changePercent < 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {bookingOverview.cancelledBookings.changePercent < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {bookingOverview.cancelledBookings.changePercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Overview Section with separate cards */}
        <div className="bg-card text-card-foreground border-border/80 rounded-xl border p-5 shadow-xs lg:col-span-6 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Payment Overview
            </h2>
            <span className="text-muted-foreground text-[11px] font-medium">
              Gross & provider net payouts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Booking Value Card */}
            <div className="bg-muted/30 dark:bg-zinc-800/30 border-border/60 rounded-xl border p-4 flex flex-col justify-between space-y-2">
              <p className="text-muted-foreground text-xs font-medium">Total Booking Value</p>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  {paymentOverview.totalBookingValue.formattedValue ||
                    `$${paymentOverview.totalBookingValue.value.toFixed(2)}`}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{paymentOverview.totalBookingValue.changePercent}%</span>
                </div>
              </div>
            </div>

            {/* Provider Amount Card */}
            <div className="bg-muted/30 dark:bg-zinc-800/30 border-border/60 rounded-xl border p-4 flex flex-col justify-between space-y-2">
              <p className="text-muted-foreground text-xs font-medium">Provider Net Payout</p>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  {paymentOverview.providerAmount.formattedValue ||
                    `$${paymentOverview.providerAmount.value.toFixed(2)}`}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <span>90% Net payout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Charts Row: Revenue & Bookings Graphs with Individual Filters */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueAnalyticsChart
          data={revenueChartData}
          timeRange={revenueTimeRange}
          onTimeRangeChange={setRevenueTimeRange}
        />
        <BookingsVolumeChart
          data={bookingsChartData}
          timeRange={bookingsTimeRange}
          onTimeRangeChange={setBookingsTimeRange}
        />
      </div>

      {/* Row with Recent Bookings (5 items) and Recent Providers (5 items) Side-by-Side */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-stretch">
        {/* Section: Recent Bookings */}
        <DashboardTableCard
          title="Recent Bookings"
          viewAllHref="/dashboard/admin/bookings"
          columns={bookingColumns}
          data={recentBookings}
          keyExtractor={(item) => item.id}
          className="h-full"
        />

        {/* Section: Recent Providers */}
        <DashboardTableCard
          title="Recent Providers"
          viewAllHref="/dashboard/admin/providers"
          columns={providerColumns}
          data={recentProviders}
          keyExtractor={(item) => item.id}
          className="h-full"
        />
      </div>

      {/* Section: Recent Payments (Full Width) */}
      <DashboardTableCard
        title="Recent Payments"
        viewAllHref="/dashboard/admin/payments"
        columns={paymentColumns}
        data={recentPayments}
        keyExtractor={(item) => item.id}
      />

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        payment={selectedPayment}
        open={!!selectedPayment}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
        }}
      />
    </div>
  );
}
