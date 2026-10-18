"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search
} from "lucide-react";
import { toast } from "sonner";
import { PROVIDER_MOCK_DATA, type ProviderBookingItem } from "@/data";
import {
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

export default function OperatorBookingsPage() {
  const [bookings, setBookings] = React.useState<ProviderBookingItem[]>(PROVIDER_MOCK_DATA.bookings);
  const [activeTab, setActiveTab] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "confirmed" && b.status === "Confirmed") ||
        (activeTab === "checked-in" && b.status === "Checked In") ||
        (activeTab === "cancelled" && b.status === "Cancelled");

      const matchesSearch =
        b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.passenger.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.route.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchTerm]);

  const handleCheckIn = (item: ProviderBookingItem) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === item.id ? { ...b, status: "Checked In" as const } : b))
    );
    toast.success(`Passenger "${item.passenger}" marked as Checked In!`);
  };

  const bookingColumns: TableColumn<ProviderBookingItem>[] = [
    {
      header: "REFERENCE",
      accessorKey: "bookingReference",
      className: "font-mono font-bold text-slate-700 dark:text-slate-300 text-xs"
    },
    {
      header: "PASSENGER",
      accessorKey: "passenger",
      className: "font-semibold text-foreground"
    },
    {
      header: "EMAIL",
      accessorKey: "email",
      className: "font-mono text-muted-foreground text-[11px]"
    },
    {
      header: "ROUTE",
      accessorKey: "route",
      className: "text-foreground font-medium text-xs"
    },
    {
      header: "VESSEL",
      accessorKey: "vesselName",
      className: "text-muted-foreground text-xs"
    },
    {
      header: "DEPARTURE",
      accessorKey: "departureTime",
      className: "font-mono text-muted-foreground text-[11px]"
    },
    {
      header: "PAX",
      accessorKey: "pax",
      className: "text-center text-foreground font-semibold",
      align: "center"
    },
    {
      header: "AMOUNT",
      className: "font-bold text-foreground text-xs",
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
        <div className="flex items-center justify-end gap-2">
          {item.status === "Confirmed" && (
            <button
              type="button"
              onClick={() => handleCheckIn(item)}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold text-xs hover:underline cursor-pointer transition-colors"
            >
              Check In
            </button>
          )}
          <Link
            href={`/manage-booking/${item.bookingReference}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-xs hover:underline transition-colors"
          >
            View
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Passenger Bookings
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          View customer reservations, verify tickets, and manage boarding check-in.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-muted/70 max-w-md h-9 p-1 rounded-lg">
            <TabsTrigger value="all" className="text-xs font-semibold">
              All Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs font-semibold">
              Confirmed
            </TabsTrigger>
            <TabsTrigger value="checked-in" className="text-xs font-semibold">
              Checked In
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search passenger, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9 bg-card"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <DashboardTableCard
        title="Reservations & Tickets"
        columns={bookingColumns}
        data={filteredBookings}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
