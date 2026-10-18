"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Navigation,
  RefreshCw,
  Search,
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
  Input,
  ReusableSelect,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";
import type { IAdminProviderItem } from "@repo/types";

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

export default function AdminProvidersPage() {
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

  // Compute stat card metrics
  const activeCount = providers.filter((p) => p.user?.status === "ACTIVE").length;
  const suspendedCount = providers.filter((p) => p.user?.status === "SUSPENDED").length;
  const totalFleetsCount = providers.reduce((acc, p) => acc + (p.ferriesCount ?? 0), 0);

  const providerColumns: TableColumn<IAdminProviderItem>[] = [
    {
      header: "OPERATOR / COMPANY",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
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
            <span>{item.user?.email || item.contactEmail || "—"}</span>
          </div>
        </div>
      )
    },
    {
      header: "OPERATING FLEET",
      align: "center",
      headerClassName: "text-center",
      cell: (item) => (
        <div className="flex items-center justify-center gap-1.5 font-medium text-xs text-foreground">
          <Ship className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{item.ferriesCount} {item.ferriesCount === 1 ? "Vessel" : "Vessels"}</span>
        </div>
      )
    },
    {
      header: "ACTIVE ROUTES",
      align: "center",
      headerClassName: "text-center",
      cell: (item) => (
        <div className="flex items-center justify-center gap-1.5 font-medium text-xs text-foreground">
          <Navigation className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{item.routesCount} {item.routesCount === 1 ? "Route" : "Routes"}</span>
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
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <Link
            href={`/dashboard/admin/providers/${item.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Profile</span>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ferry Operators
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage registered commercial ferry operators, vessels, corridors, and service status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Operators</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalCount} {totalCount === 1 ? "Operator" : "Operators"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Commercial registry</p>
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
                {activeCount} Active
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Verified & operating</p>
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
                {suspendedCount} Suspended
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Deactivated access</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Registered Fleets</p>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {totalFleetsCount} Vessels
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active passenger vessels</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search operators by company, contact person, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "ALL" | "ACTIVE" | "SUSPENDED")}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="ALL" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="ACTIVE" className="text-xs">
                Active
              </TabsTrigger>
              <TabsTrigger value="SUSPENDED" className="text-xs">
                Suspended
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ReusableSelect
            value={String(limit)}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
            options={PAGE_SIZE_OPTIONS}
            placeholder="Per page"
            className="w-[125px] h-9 text-xs"
          />
        </div>
      </div>

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
            title={`Registered Operators (${totalCount})`}
            columns={providerColumns}
            data={providers}
            keyExtractor={(item) => item.id}
            emptyMessage={
              searchTerm || activeTab !== "ALL"
                ? "No operators match the search query or status filter."
                : "No registered ferry operators found in the platform."
            }
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 bg-card rounded-xl border border-border/80 shadow-xs">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(page * limit, totalCount)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{totalCount}</span> operators
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || isFetching}
                  className="h-8 px-2.5 text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>

                <div className="text-xs font-semibold text-muted-foreground px-2">
                  Page {page} of {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="h-8 px-2.5 text-xs flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
