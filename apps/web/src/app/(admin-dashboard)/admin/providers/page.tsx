"use client";

import * as React from "react";
import Link from "next/link";
import { ADMIN_DASHBOARD_DATA, type RecentProviderItem } from "@/data";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";
import { Tabs, TabsList, TabsTrigger } from "@/ui";

export default function AdminProvidersPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const { recentProviders, summaryStats } = ADMIN_DASHBOARD_DATA;

  // Filter providers based on active tab
  const filteredProviders = React.useMemo(() => {
    if (activeTab === "active") {
      return recentProviders.filter((p) => p.status === "Active");
    }
    if (activeTab === "suspended") {
      return recentProviders.filter((p) => p.status === "Suspended");
    }
    return recentProviders;
  }, [recentProviders, activeTab]);

  const activeCount = recentProviders.filter((p) => p.status === "Active").length;
  const suspendedCount = recentProviders.filter((p) => p.status === "Suspended").length;

  const providerColumns: TableColumn<RecentProviderItem>[] = [
    {
      header: "PROVIDER",
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
          href={`/admin/providers/${item.id}`}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-colors"
        >
          View Provider
        </Link>
      )
    }
  ];

  const getTableTitle = () => {
    if (activeTab === "active") return `Active Providers (${activeCount})`;
    if (activeTab === "suspended") return `Suspended Providers (${suspendedCount})`;
    return `All Registered Providers (${recentProviders.length})`;
  };

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Providers
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Manage registered ferry operators and provider fleets ({summaryStats.totalProviders} active providers).
        </p>
      </div>

      {/* Shadcn Tabs: All, Active, Suspended */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="h-10 p-1 bg-muted/80">
          <TabsTrigger value="all" className="px-4 py-1.5 text-xs font-semibold">
            All ({recentProviders.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="px-4 py-1.5 text-xs font-semibold">
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="px-4 py-1.5 text-xs font-semibold">
            Suspended ({suspendedCount})
          </TabsTrigger>
        </TabsList>

        {/* Providers Table Card */}
        <DashboardTableCard
          title={getTableTitle()}
          columns={providerColumns}
          data={filteredProviders}
          keyExtractor={(item) => item.id}
          emptyMessage={`No ${activeTab} providers found.`}
        />
      </Tabs>
    </div>
  );
}
