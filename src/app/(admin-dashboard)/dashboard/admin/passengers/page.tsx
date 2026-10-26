"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  UserCheck,
  Users,
  XCircle
} from "lucide-react";

import { useUsersQuery } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import {
  DashboardTableCard,
  StatusBadge,
  TablePagination,
  TableToolbar,
  UserDetailsModal,
  type TableColumn
} from "@/widgets";
import type { IAdminUserItem } from "@/types";

export default function AdminPassengersPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [statusTab, setStatusTab] = React.useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // Selected user for details modal
  const [selectedUser, setSelectedUser] = React.useState<IAdminUserItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusTab]);

  const { data, isLoading, isError, error, refetch, isFetching } = useUsersQuery({
    page,
    limit,
    searchTerm: debouncedSearch.trim() || undefined,
    role: "USER",
    status: statusTab === "ALL" ? undefined : statusTab
  });

  // Filter out any non-passenger users from the directory
  const rawUsers = data?.users ?? [];
  const passengers = rawUsers.filter((u) => u.role !== "ADMIN" && u.role !== "OPERATOR");

  const meta = data?.meta ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  };

  const totalCount = meta.total ?? passengers.length;
  const totalPages = Math.max(
    1,
    meta.totalPages ?? meta.totalPage ?? Math.ceil(totalCount / limit)
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Keep page clamped if items are deleted or filtered
  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // Sliced passengers for resilience if backend sends all users
  const displayedPassengers = React.useMemo(() => {
    if (passengers.length > limit) {
      const start = (currentPage - 1) * limit;
      return passengers.slice(start, start + limit);
    }
    return passengers;
  }, [passengers, currentPage, limit]);

  // Compute stat metrics for current batch
  const activeCount = passengers.filter((u) => u.status === "ACTIVE").length;
  const suspendedCount = passengers.filter((u) => u.status === "SUSPENDED").length;

  const handleOpenDetails = (user: IAdminUserItem) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const passengerColumns: TableColumn<IAdminUserItem>[] = [
    {
      header: "PASSENGER",
      cell: (item) => {
        const initials = item.name ? item.name.charAt(0).toUpperCase() : item.email.charAt(0).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                  {item.name || "Unnamed Passenger"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{item.email}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: "PHONE NUMBER",
      cell: (item) => {
        const phone = item.phoneNumber || item.phone;
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            {phone ? (
              <>
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>{phone}</span>
              </>
            ) : (
              <span className="text-muted-foreground/60">—</span>
            )}
          </div>
        );
      }
    },
    {
      header: "VERIFICATION",
      align: "center",
      headerClassName: "text-center",
      cell: (item) => {
        return item.isEmailVerified ? (
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Verified</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <XCircle className="h-3.5 w-3.5" />
            <span>Pending</span>
          </div>
        );
      }
    },
    {
      header: "STATUS",
      cell: (item) => {
        const rawStatus = item.status;
        const formattedStatus =
          rawStatus === "ACTIVE"
            ? "Active"
            : rawStatus === "SUSPENDED"
              ? "Suspended"
              : rawStatus || "Active";
        return <StatusBadge status={formattedStatus} />;
      }
    },
    {
      header: "REGISTERED",
      cell: (item) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDetails(item)}
            className="h-8 gap-1.5 px-3 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Details</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Passenger Management
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Directory of registered travelers, ticket buyers, and passenger accounts.
        </p>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Passengers</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalCount} {totalCount === 1 ? "Passenger" : "Passengers"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Registered traveler accounts</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Travelers</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeCount} {activeCount === 1 ? "Active" : "Active"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Verified & active to travel</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Suspended Accounts</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {suspendedCount} {suspendedCount === 1 ? "Account" : "Accounts"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Restricted from booking</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reusable Search & Status Toolbar */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by passenger name, email, or phone number..."
        activeTab={statusTab}
        onTabChange={setStatusTab}
        tabs={[
          { value: "ALL", label: "All Passengers", count: totalCount },
          { value: "ACTIVE", label: "Active", count: activeCount },
          { value: "SUSPENDED", label: "Suspended", count: suspendedCount }
        ]}
      />

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h2 className="text-base font-bold text-foreground">Failed to Load Passengers</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error?.message || "Could not retrieve passenger directory from the server."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2 text-xs">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            {error?.message?.toLowerCase().includes("token") ||
            error?.message?.toLowerCase().includes("unauthorized") ? (
              <Button
                size="sm"
                onClick={() => (window.location.href = "/login")}
                className="bg-primary text-primary-foreground text-xs"
              >
                Log In as Admin
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-border/80 bg-card p-6 shadow-xs animate-pulse">
          <div className="h-5 w-48 rounded bg-muted mb-4" />
          <div className="h-12 w-full rounded-lg bg-muted/60" />
          <div className="h-12 w-full rounded-lg bg-muted/40" />
          <div className="h-12 w-full rounded-lg bg-muted/60" />
          <div className="h-12 w-full rounded-lg bg-muted/40" />
        </div>
      ) : (
        /* Passengers Table Card */
        <div className="space-y-3">
          <DashboardTableCard
            title={
              statusTab === "ALL"
                ? "All Registered Passengers"
                : statusTab === "ACTIVE"
                  ? "Active Passengers"
                  : "Suspended Passengers"
            }
            columns={passengerColumns}
            data={displayedPassengers}
            keyExtractor={(item) => item.id}
            emptyMessage={
              searchTerm || statusTab !== "ALL"
                ? "No passengers match the search criteria or selected status filter."
                : "No registered passengers found in the system."
            }
          />

          {/* Reusable Pagination Controls */}
          <TablePagination
            page={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            itemName="passengers"
            isLoading={isFetching}
          />
        </div>
      )}

      {/* User Details Modal Dialog */}
      <UserDetailsModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
