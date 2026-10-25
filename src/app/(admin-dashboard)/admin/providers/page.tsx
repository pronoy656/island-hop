"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

import { useAdminProvidersQuery } from "@/hooks/use-admin";
import { Button, Tabs, TabsList, TabsTrigger } from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

interface ProviderRowItem {
  id: string;
  provider: string;
  contactPerson: string;
  totalFerries: number;
  status: "Active" | "Suspended" | "Pending" | string;
  email?: string;
  routesCount?: number;
}

export default function AdminProvidersPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const statusParam =
    activeTab === "active" ? "ACTIVE" : activeTab === "suspended" ? "SUSPENDED" : undefined;

  const { data, isLoading, isError, error, refetch } = useAdminProvidersQuery(
    statusParam ? { status: statusParam } : undefined
  );

  const providers = data?.providers ?? [];

  const providerRows: ProviderRowItem[] = React.useMemo(() => {
    return providers.map((p) => {
      const userStatus = p.user?.status;
      const formattedStatus =
        userStatus === "ACTIVE"
          ? "Active"
          : userStatus === "SUSPENDED"
            ? "Suspended"
            : userStatus || "Active";

      return {
        id: p.id,
        provider: p.companyName,
        contactPerson: p.contactPersonName || p.user?.name || "N/A",
        totalFerries: p.ferriesCount ?? 0,
        status: formattedStatus,
        email: p.user?.email,
        routesCount: p.routesCount ?? 0
      };
    });
  }, [providers]);

  const activeCount = providers.filter((p) => p.user?.status === "ACTIVE").length;
  const suspendedCount = providers.filter((p) => p.user?.status === "SUSPENDED").length;

  const providerColumns: TableColumn<ProviderRowItem>[] = [
    {
      header: "OPERATOR",
      accessorKey: "provider",
      className: "font-semibold text-foreground"
    },
    {
      header: "CONTACT PERSON",
      accessorKey: "contactPerson",
      className: "text-muted-foreground font-medium"
    },
    {
      header: "TOTAL FERRIES",
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
          View Operator
        </Link>
      )
    }
  ];

  const getTableTitle = () => {
    if (activeTab === "active") return `Active Operators (${activeCount})`;
    if (activeTab === "suspended") return `Suspended Operators (${suspendedCount})`;
    return `All Registered Operators (${providers.length})`;
  };

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Operators
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Manage registered commercial ferry operators and fleet ferries ({data?.meta?.total ?? providers.length} registered operators).
        </p>
      </div>

      {isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h2 className="text-base font-bold text-foreground">Failed to Load Registered Operators</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error?.message || "Could not retrieve operator list from the server."}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      )}

      {/* Tabs: All, Active, Suspended */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="h-10 p-1 bg-muted/80">
          <TabsTrigger value="all" className="px-4 py-1.5 text-xs font-semibold">
            All ({providers.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="px-4 py-1.5 text-xs font-semibold">
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="px-4 py-1.5 text-xs font-semibold">
            Suspended ({suspendedCount})
          </TabsTrigger>
        </TabsList>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-6 animate-pulse">
            <div className="h-6 w-48 rounded bg-muted/60 mb-6" />
            <div className="h-12 w-full rounded bg-muted/40" />
            <div className="h-12 w-full rounded bg-muted/40" />
            <div className="h-12 w-full rounded bg-muted/40" />
          </div>
        ) : (
          /* Providers Table Card */
          <DashboardTableCard
            title={getTableTitle()}
            columns={providerColumns}
            data={providerRows}
            keyExtractor={(item) => item.id}
            emptyMessage={`No ${activeTab !== "all" ? activeTab : "registered"} operators found.`}
          />
        )}
      </Tabs>
    </div>
  );
}
