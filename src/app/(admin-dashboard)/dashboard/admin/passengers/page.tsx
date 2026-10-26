"use client";

import * as React from "react";
import {
  AlertCircle,
  Ban,
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  UserCheck,
  Users,
  X,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

import { useUpdateUserStatusMutation, useUsersQuery } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

  // Single-passenger status confirmation modal state
  const [passengerForStatusChange, setPassengerForStatusChange] = React.useState<{
    passenger: IAdminUserItem;
    targetStatus: "ACTIVE" | "SUSPENDED";
  } | null>(null);
  const [isUpdatingSingleStatus, setIsUpdatingSingleStatus] = React.useState(false);

  const handleConfirmSingleStatusChange = async () => {
    if (!passengerForStatusChange || isUpdatingSingleStatus) return;
    const { passenger, targetStatus } = passengerForStatusChange;
    setIsUpdatingSingleStatus(true);
    try {
      await updateUserStatusMutation.mutateAsync({
        userId: passenger.id,
        status: targetStatus
      });
      toast.success(
        targetStatus === "SUSPENDED"
          ? `Suspended account for ${passenger.name || passenger.email}`
          : `Activated account for ${passenger.name || passenger.email}`
      );
      setPassengerForStatusChange(null);
      refetch();
    } catch {
      toast.error("Failed to update passenger status");
    } finally {
      setIsUpdatingSingleStatus(false);
    }
  };

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

  // Bulk selection & action states
  const [selectedPassengerIds, setSelectedPassengerIds] = React.useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = React.useState(false);
  const [bulkActionType, setBulkActionType] = React.useState<"activate" | "suspend" | null>(null);

  const updateUserStatusMutation = useUpdateUserStatusMutation();

  // Reset selection on page, tab, or search change
  React.useEffect(() => {
    setSelectedPassengerIds(new Set());
  }, [page, statusTab, debouncedSearch]);

  const selectedCount = selectedPassengerIds.size;
  const currentPageIds = React.useMemo(
    () => displayedPassengers.map((p) => p.id),
    [displayedPassengers]
  );

  const isAllCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedPassengerIds.has(id));

  const isSomeCurrentPageSelected =
    currentPageIds.some((id) => selectedPassengerIds.has(id)) &&
    !isAllCurrentPageSelected;

  const toggleSelectRow = (id: string) => {
    setSelectedPassengerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedPassengerIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedPassengerIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedPassengerIds(new Set());

  // Bulk Status Update Handler
  const handleBulkStatusChange = async (targetStatus: "ACTIVE" | "SUSPENDED") => {
    if (selectedPassengerIds.size === 0 || isBulkOperating) return;
    setIsBulkOperating(true);
    setBulkActionType(targetStatus === "ACTIVE" ? "activate" : "suspend");

    const ids = Array.from(selectedPassengerIds);
    let successCount = 0;

    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          updateUserStatusMutation.mutateAsync({
            userId: id,
            status: targetStatus
          })
        )
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") successCount++;
      });

      if (successCount > 0) {
        toast.success(
          `Successfully updated ${successCount} ${successCount === 1 ? "passenger" : "passengers"} to ${
            targetStatus === "ACTIVE" ? "Active" : "Suspended"
          }`
        );
        refetch();
        clearSelection();
      } else {
        toast.error("Failed to update selected passengers.");
      }
    } catch {
      toast.error("An error occurred during bulk update.");
    } finally {
      setIsBulkOperating(false);
      setBulkActionType(null);
    }
  };

  // Bulk CSV Export Handler
  const handleBulkExportCSV = () => {
    const selectedItems = passengers.filter((p) => selectedPassengerIds.has(p.id));
    if (selectedItems.length === 0) return;

    const headers = ["Passenger Name", "Email", "Phone", "Status", "Email Verified", "Registered Date"];
    const rows = selectedItems.map((p) => [
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${(p.email || "").replace(/"/g, '""')}"`,
      `"${(p.phoneNumber || p.phone || "").replace(/"/g, '""')}"`,
      `"${p.status || "ACTIVE"}"`,
      p.isEmailVerified ? "Verified" : "Pending",
      `"${new Date(p.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `passengers_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${selectedItems.length} passengers to CSV`);
  };

  const handleOpenDetails = (user: IAdminUserItem) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const passengerColumns: TableColumn<IAdminUserItem>[] = [
    {
      header: (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              isAllCurrentPageSelected
                ? true
                : isSomeCurrentPageSelected
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={toggleSelectAllCurrentPage}
            aria-label="Select all passengers on current page"
          />
        </div>
      ),
      headerClassName: "w-10 px-3 text-center",
      className: "w-10 px-3 text-center",
      align: "center",
      cell: (item) => {
        const isChecked = selectedPassengerIds.has(item.id);
        return (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggleSelectRow(item.id)}
              aria-label={`Select passenger ${item.name || item.email}`}
            />
          </div>
        );
      }
    },
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDetails(item)}
            className="h-8 gap-1.5 px-2.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
          </Button>

          {item.status === "ACTIVE" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPassengerForStatusChange({
                  passenger: item,
                  targetStatus: "SUSPENDED"
                });
              }}
              className="h-8 gap-1 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Suspend Passenger"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Suspend</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPassengerForStatusChange({
                  passenger: item,
                  targetStatus: "ACTIVE"
                });
              }}
              className="h-8 gap-1 px-2.5 rounded-lg text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              title="Activate Passenger"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Activate</span>
            </Button>
          )}
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
          {/* Bulk Action Sticky / Floating Toolbar */}
          {selectedCount > 0 && (
            <div className="bg-card/95 dark:bg-card/90 border-blue-500/30 sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white shadow-2xs">
                  {selectedCount}
                </span>
                <span className="text-foreground text-xs font-semibold">
                  {selectedCount === 1 ? "passenger selected" : "passengers selected"}
                </span>

                {displayedPassengers.length > 0 &&
                  isAllCurrentPageSelected &&
                  totalCount > displayedPassengers.length &&
                  selectedCount < totalCount && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPassengerIds(new Set(passengers.map((p) => p.id)));
                      }}
                      className="ml-2 cursor-pointer text-xs font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                    >
                      Select all {totalCount} passengers in current dataset
                    </button>
                  )}
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkStatusChange("ACTIVE")}
                  className="h-8 cursor-pointer gap-1.5 border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                  title="Activate selected passengers"
                >
                  {isBulkOperating && bulkActionType === "activate" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  )}
                  <span>Activate</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkStatusChange("SUSPENDED")}
                  className="h-8 cursor-pointer gap-1.5 border-amber-200 bg-amber-50/50 text-xs font-semibold text-amber-700 shadow-2xs hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                  title="Suspend selected passengers"
                >
                  {isBulkOperating && bulkActionType === "suspend" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  <span>Suspend</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={handleBulkExportCSV}
                  className="h-8 cursor-pointer gap-1.5 border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                  title="Export selected passengers as CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={clearSelection}
                  className="h-8 cursor-pointer gap-1 text-xs text-muted-foreground hover:text-foreground"
                  title="Deselect all passengers"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Deselect</span>
                </Button>
              </div>
            </div>
          )}

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
        onStatusChange={() => {
          refetch();
        }}
      />

      {/* Single Passenger Status Confirmation Modal */}
      <Dialog
        open={Boolean(passengerForStatusChange)}
        onOpenChange={(open) => {
          if (!open) setPassengerForStatusChange(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  passengerForStatusChange?.targetStatus === "SUSPENDED"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {passengerForStatusChange?.targetStatus === "SUSPENDED" ? (
                  <Ban className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {passengerForStatusChange?.targetStatus === "SUSPENDED"
                    ? "Suspend Passenger Account"
                    : "Activate Passenger Account"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {passengerForStatusChange?.targetStatus === "SUSPENDED"
                    ? "This action will restrict the passenger from making bookings."
                    : "This action will restore full passenger booking privileges."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-muted-foreground">
            <p>
              Are you sure you want to{" "}
              <strong className="text-foreground">
                {passengerForStatusChange?.targetStatus === "SUSPENDED" ? "suspend" : "activate"}
              </strong>{" "}
              the account for{" "}
              <strong className="text-foreground">
                {passengerForStatusChange?.passenger.name || passengerForStatusChange?.passenger.email}
              </strong>
              ?
            </p>
            {passengerForStatusChange?.targetStatus === "SUSPENDED" ? (
              <div className="rounded-xl border border-rose-200/60 bg-rose-50/50 p-3 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                The traveler will no longer be able to log in, search available ferries, or purchase digital boarding passes until reactivated by an administrator.
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                The traveler will regain access to search routes, purchase tickets, and view reservation history.
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingSingleStatus}
              onClick={() => setPassengerForStatusChange(null)}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant={passengerForStatusChange?.targetStatus === "SUSPENDED" ? "destructive" : "default"}
              size="sm"
              disabled={isUpdatingSingleStatus}
              onClick={handleConfirmSingleStatusChange}
              className={`text-xs font-semibold cursor-pointer ${
                passengerForStatusChange?.targetStatus === "ACTIVE"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }`}
            >
              {isUpdatingSingleStatus ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              {passengerForStatusChange?.targetStatus === "SUSPENDED"
                ? "Yes, Suspend Account"
                : "Yes, Activate Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
