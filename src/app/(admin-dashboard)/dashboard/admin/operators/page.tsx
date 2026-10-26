"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  Mail,
  Navigation,
  RefreshCw,
  Ship,
  UserCheck,
  Users
} from "lucide-react";

import { useAdminProvidersQuery } from "@/hooks/use-admin";
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

  const providerColumns: TableColumn<IAdminProviderItem>[] = [
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
