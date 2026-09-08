"use client";

import * as React from "react";
import { ADMIN_DASHBOARD_DATA, type RecentBookingItem } from "@/data";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";
import { Tabs, TabsList, TabsTrigger } from "@/ui";

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const { recentBookings, summaryStats } = ADMIN_DASHBOARD_DATA;

  // Filter bookings based on active tab
  const filteredBookings = React.useMemo(() => {
    if (activeTab === "confirmed") {
      return recentBookings.filter((b) => b.status === "Confirmed");
    }
    if (activeTab === "cancelled") {
      return recentBookings.filter((b) => b.status === "Cancelled");
    }
    return recentBookings;
  }, [recentBookings, activeTab]);

  const confirmedCount = recentBookings.filter((b) => b.status === "Confirmed").length;
  const cancelledCount = recentBookings.filter((b) => b.status === "Cancelled").length;

  const bookingColumns: TableColumn<RecentBookingItem>[] = [
    {
      header: "BOOKING REFERENCE",
      accessorKey: "bookingReference",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300"
    },
    {
      header: "PASSENGER",
      accessorKey: "passenger",
      className: "font-semibold text-foreground"
    },
    {
      header: "PROVIDER",
      accessorKey: "provider",
      className: "text-muted-foreground"
    },
    {
      header: "ROUTE",
      accessorKey: "route",
      className: "text-foreground font-medium"
    },
    {
      header: "TRAVEL DATE",
      accessorKey: "travelDate",
      className: "font-mono text-muted-foreground text-[11px]"
    },
    {
      header: "PAX",
      accessorKey: "pax",
      className: "text-center text-foreground font-medium",
      align: "center"
    },
    {
      header: "AMOUNT",
      className: "font-bold text-foreground",
      cell: (item) => `$${item.amount.toFixed(2)}`
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />
    }
  ];

  const getTableTitle = () => {
    if (activeTab === "confirmed") return `Confirmed Bookings (${confirmedCount})`;
    if (activeTab === "cancelled") return `Cancelled Bookings (${cancelledCount})`;
    return `All Platform Bookings (${recentBookings.length})`;
  };

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Bookings
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Platform-wide reservations and ticketing manifest ({summaryStats.totalBookings.toLocaleString()} total bookings recorded).
        </p>
      </div>

      {/* Shadcn Tabs: All Bookings, Confirmed, Cancelled without icons */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="h-10 p-1 bg-muted/80">
          <TabsTrigger value="all" className="px-4 py-1.5 text-xs font-semibold">
            All Bookings ({recentBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="px-4 py-1.5 text-xs font-semibold">
            Confirmed ({confirmedCount})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="px-4 py-1.5 text-xs font-semibold">
            Cancelled ({cancelledCount})
          </TabsTrigger>
        </TabsList>

        {/* Bookings Table Card */}
        <DashboardTableCard
          title={getTableTitle()}
          columns={bookingColumns}
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          emptyMessage={`No ${activeTab} bookings found.`}
        />
      </Tabs>
    </div>
  );
}
