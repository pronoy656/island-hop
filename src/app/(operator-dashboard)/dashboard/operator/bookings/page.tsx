"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PROVIDER_MOCK_DATA, type ProviderBookingItem } from "@/data";
import {
  DashboardTableCard,
  StatusBadge,
  TablePagination,
  TableToolbar,
  type TableColumn,
  type TableToolbarTab
} from "@/widgets";

export default function OperatorBookingsPage() {
  const [bookings, setBookings] = React.useState<ProviderBookingItem[]>(PROVIDER_MOCK_DATA.bookings);
  const [activeTab, setActiveTab] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Pagination states (default 10)
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Filter bookings based on active tab and search query
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

  // Reset page when search or filter tab or pageSize changes
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab, pageSize]);

  // Pagination calculations
  const totalCount = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const paginatedBookings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Tab configurations with counts
  const filterTabs: TableToolbarTab<string>[] = React.useMemo(
    () => [
      { value: "all", label: "All Bookings", count: bookings.length },
      {
        value: "confirmed",
        label: "Confirmed",
        count: bookings.filter((b) => b.status === "Confirmed").length
      },
      {
        value: "checked-in",
        label: "Checked In",
        count: bookings.filter((b) => b.status === "Checked In").length
      },
      {
        value: "cancelled",
        label: "Cancelled",
        count: bookings.filter((b) => b.status === "Cancelled").length
      }
    ],
    [bookings]
  );

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
      header: "FERRY",
      accessorKey: "vesselName",
      className: "text-muted-foreground text-xs"
    },
    {
      header: "DEPARTURE",
      accessorKey: "departureTime",
      className: "font-mono text-muted-foreground text-[11px]"
    },
    {
      header: "SEATS",
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

      {/* Reusable Toolbar: Search Bar on left + Filter Tabs on right */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search passenger, reference, route..."
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={filterTabs}
      />

      {/* Bookings Table & Reusable Pagination */}
      <div className="space-y-4">
        <DashboardTableCard
          title="Reservations & Tickets"
          columns={bookingColumns}
          data={paginatedBookings}
          keyExtractor={(item) => item.id}
        />

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
          itemName="bookings"
        />
      </div>
    </div>
  );
}
