"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Mail,
  Navigation,
  RefreshCw,
  Ship,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { toast } from "sonner";

import { useAdminProvidersQuery, useUpdateProviderStatusMutation } from "@/hooks/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import {
  DashboardTableCard,
  StatusBadge,
  TablePagination,
  TableToolbar,
  type TableColumn
} from "@/widgets";
import type { IAdminProviderItem } from "@/types";

export default function AdminOperatorsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [activeTab, setActiveTab] = React.useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // Reset page when search or tab changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminProvidersQuery({
    page,
    limit,
    searchTerm: debouncedSearch.trim() || undefined,
    status: activeTab === "ALL" ? undefined : activeTab
  });

  const providers = data?.providers ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  };

  const totalCount = meta.total ?? providers.length;
  const totalPages = Math.max(
    1,
    meta.totalPages ?? meta.totalPage ?? Math.ceil(totalCount / limit)
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Keep page clamped if items are filtered
  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // Sliced providers for resilience if backend sends all items
  const displayedProviders = React.useMemo(() => {
    if (providers.length > limit) {
      const start = (currentPage - 1) * limit;
      return providers.slice(start, start + limit);
    }
    return providers;
  }, [providers, currentPage, limit]);

  // Compute stat card metrics
  const activeCount = providers.filter((p) => p.user?.status === "ACTIVE").length;
  const suspendedCount = providers.filter((p) => p.user?.status === "SUSPENDED").length;
  const totalFleetsCount = providers.reduce((acc, p) => acc + (p.ferriesCount ?? 0), 0);

  // Bulk selection & action states
  const [selectedOperatorIds, setSelectedOperatorIds] = React.useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = React.useState(false);
  const [bulkActionType, setBulkActionType] = React.useState<"activate" | "suspend" | null>(null);

  const updateProviderStatusMutation = useUpdateProviderStatusMutation();

  // Reset selection on page, tab, or search change
  React.useEffect(() => {
    setSelectedOperatorIds(new Set());
  }, [page, activeTab, debouncedSearch]);

  const selectedCount = selectedOperatorIds.size;
  const currentPageIds = React.useMemo(
    () => displayedProviders.map((p) => p.id),
    [displayedProviders]
  );

  const isAllCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedOperatorIds.has(id));

  const isSomeCurrentPageSelected =
    currentPageIds.some((id) => selectedOperatorIds.has(id)) &&
    !isAllCurrentPageSelected;

  const toggleSelectRow = (id: string) => {
    setSelectedOperatorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedOperatorIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedOperatorIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedOperatorIds(new Set());

  // Bulk Status Update Handler
  const handleBulkStatusChange = async (targetStatus: "ACTIVE" | "SUSPENDED") => {
    if (selectedOperatorIds.size === 0 || isBulkOperating) return;
    setIsBulkOperating(true);
    setBulkActionType(targetStatus === "ACTIVE" ? "activate" : "suspend");

    const ids = Array.from(selectedOperatorIds);
    let successCount = 0;

    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          updateProviderStatusMutation.mutateAsync({
            providerId: id,
            payload: { status: targetStatus }
          })
        )
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") successCount++;
      });

      if (successCount > 0) {
        toast.success(
          `Successfully updated ${successCount} ${successCount === 1 ? "operator" : "operators"} to ${
            targetStatus === "ACTIVE" ? "Active" : "Suspended"
          }`
        );
        refetch();
        clearSelection();
      } else {
        toast.error("Failed to update selected operators.");
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
    const selectedItems = providers.filter((p) => selectedOperatorIds.has(p.id));
    if (selectedItems.length === 0) return;

    const headers = ["Company Name", "Contact Person", "Email", "Status", "Ferries", "Routes", "Registered Date"];
    const rows = selectedItems.map((p) => [
      `"${(p.companyName || "").replace(/"/g, '""')}"`,
      `"${(p.contactPersonName || p.user?.name || "").replace(/"/g, '""')}"`,
      `"${(p.user?.email || p.contactEmail || "").replace(/"/g, '""')}"`,
      `"${p.user?.status || "ACTIVE"}"`,
      p.ferriesCount ?? 0,
      p.routesCount ?? 0,
      `"${new Date(p.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `operators_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${selectedItems.length} operators to CSV`);
  };

  const providerColumns: TableColumn<IAdminProviderItem>[] = [
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
            aria-label="Select all operators on current page"
          />
        </div>
      ),
      headerClassName: "w-10 px-3 text-center",
      className: "w-10 px-3 text-center",
      align: "center",
      cell: (item) => {
        const isChecked = selectedOperatorIds.has(item.id);
        return (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggleSelectRow(item.id)}
              aria-label={`Select operator ${item.companyName}`}
            />
          </div>
        );
      }
    },
    {
      header: "OPERATOR",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-foreground text-xs sm:text-sm">{item.companyName}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {item.businessAddress ? item.businessAddress : `Registered ${new Date(item.createdAt).toLocaleDateString()}`}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "CONTACT & EMAIL",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground text-xs">
            {item.contactPersonName || item.user?.name || "Direct Representative"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 font-mono">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{item.user?.email || item.contactEmail || "No email available"}</span>
          </div>
        </div>
      )
    },
    {
      header: "STATUS",
      cell: (item) => {
        const rawStatus = item.user?.status;
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
      header: "FLEET & ROUTES",
      cell: (item) => (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Ship className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-foreground">{item.ferriesCount ?? 0}</span> ferries
          </div>
          <div className="flex items-center gap-1">
            <Navigation className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-foreground">{item.routesCount ?? 0}</span> routes
          </div>
        </div>
      )
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-3 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Link href={`/dashboard/admin/operators/${item.id}`}>
              <Eye className="h-3.5 w-3.5" />
              <span>Manage</span>
            </Link>
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
          Ferry Operators Directory
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Comprehensive roster of licensed ferry providers, vessel fleets, and sea transfer networks.
        </p>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Operators</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalCount} {totalCount === 1 ? "Company" : "Companies"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Licensed marine providers</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Operators</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeCount} {activeCount === 1 ? "Active" : "Active"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Operational in good standing</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Suspended</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {suspendedCount} {suspendedCount === 1 ? "Operator" : "Operators"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Restricted or under review</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Registered Fleet</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalFleetsCount} {totalFleetsCount === 1 ? "Vessel" : "Vessels"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active transport crafts</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reusable Search & Status Toolbar */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search operators by company, contact person, or email..."
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { value: "ALL", label: "All", count: totalCount },
          { value: "ACTIVE", label: "Active", count: activeCount },
          { value: "SUSPENDED", label: "Suspended", count: suspendedCount }
        ]}
      />

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h2 className="text-base font-bold text-foreground">Failed to Load Registered Operators</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error?.message || "Could not retrieve operator list from the server."}
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
        /* Providers Table Card */
        <div className="space-y-3">
          {/* Bulk Action Sticky / Floating Toolbar */}
          {selectedCount > 0 && (
            <div className="bg-card/95 dark:bg-card/90 border-blue-500/30 sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white shadow-2xs">
                  {selectedCount}
                </span>
                <span className="text-foreground text-xs font-semibold">
                  {selectedCount === 1 ? "operator selected" : "operators selected"}
                </span>

                {displayedProviders.length > 0 &&
                  isAllCurrentPageSelected &&
                  totalCount > displayedProviders.length &&
                  selectedCount < totalCount && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOperatorIds(new Set(providers.map((p) => p.id)));
                      }}
                      className="ml-2 cursor-pointer text-xs font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                    >
                      Select all {totalCount} operators in current dataset
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
                  title="Activate selected operators"
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
                  title="Suspend selected operators"
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
                  title="Export selected operators as CSV"
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
                  title="Deselect all operators"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Deselect</span>
                </Button>
              </div>
            </div>
          )}

          <DashboardTableCard
            title="Registered Operators"
            columns={providerColumns}
            data={displayedProviders}
            keyExtractor={(item) => item.id}
            emptyMessage={
              searchTerm || activeTab !== "ALL"
                ? "No operators match the search query or status filter."
                : "No registered ferry operators found in the platform."
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
            itemName="operators"
            isLoading={isFetching}
          />
        </div>
      )}
    </div>
  );
}
