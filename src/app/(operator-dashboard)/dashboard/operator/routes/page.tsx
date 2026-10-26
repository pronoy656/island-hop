"use client";

import * as React from "react";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Edit,
  Globe,
  Loader2,
  Navigation,
  Plus,
  Search,
  Ship,
  Trash2,
  X
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import {
  useCreateRouteMutation,
  useDebounce,
  useDeleteRouteMutation,
  usePortsQuery,
  useRoutesQuery,
  useUpdateRouteMutation
} from "@/hooks";

import {
  DashboardTableCard,
  RouteImageUploader,
  StatusBadge,
  TablePagination,
  TableToolbar,
  type TableColumn,
  type TableToolbarTab
} from "@/widgets";
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
  Input,
  Label,
  ReusableSelect,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import type { ICreateRoutePayload, IPort, IRoute, IUpdateRoutePayload, RouteStatus } from "@/types";

const ROUTE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active (Available for trips)" },
  { value: "INACTIVE", label: "Inactive (Temporarily paused)" }
];

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

export const DEFAULT_ROUTE_IMAGES = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=400&q=80"
];

export function getRouteImage(route: IRoute, index?: number): string {
  if (route.imageUrl && route.imageUrl.trim().startsWith("http")) {
    return route.imageUrl.trim();
  }
  const key = `${route.id || ""}-${route.departurePort?.name || ""}-${route.destinationPort?.name || ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i)) % DEFAULT_ROUTE_IMAGES.length;
  }
  return DEFAULT_ROUTE_IMAGES[hash];
}

function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "0 mins";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${mins} mins`;
}

export default function OperatorRoutesPage() {
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] = React.useState<IRoute | null>(null);
  const [deletingRoute, setDeletingRoute] = React.useState<IRoute | null>(null);

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Bulk selection & action states
  const [selectedRouteIds, setSelectedRouteIds] = React.useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = React.useState(false);
  const [bulkActionType, setBulkActionType] = React.useState<
    "activate" | "deactivate" | "delete" | null
  >(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);

  // Reset page whenever status filter, page size, or search changes
  React.useEffect(() => {
    setPage(1);
    setSelectedRouteIds(new Set());
  }, [statusFilter, pageSize, debouncedSearch]);

  // Overall stats query (to accurately count total, active, inactive across all pages)
  const { data: allRoutesResponse } = useRoutesQuery({
    limit: 100
  });

  // Paginated routes query
  const {
    data: routesResponse,
    isLoading: isRoutesLoading,
    isError: isRoutesError,
    error: routesError,
    refetch: refetchRoutes,
    isFetching: isRoutesFetching
  } = useRoutesQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: debouncedSearch.trim() || undefined,
    page,
    limit: pageSize
  });

  const { data: ports = [], isLoading: isPortsLoading } = usePortsQuery();

  // Mutations
  const createMutation = useCreateRouteMutation();
  const updateMutation = useUpdateRouteMutation();
  const deleteMutation = useDeleteRouteMutation();

  // Local route mirror for 0ms optimistic UI updates
  const [localRoutes, setLocalRoutes] = React.useState<IRoute[]>([]);

  React.useEffect(() => {
    if (routesResponse?.routes) {
      setLocalRoutes(routesResponse.routes);
    }
  }, [routesResponse?.routes]);

  // Port select options formatted with clear real-world labels
  const portOptions = React.useMemo(() => {
    return ports.map((p) => ({
      value: p.id,
      label: p.name
    }));
  }, [ports]);

  // Form states with enriched fields
  const [newRoute, setNewRoute] = React.useState<{
    departurePortId: string;
    destinationPortId: string;
    durationMinutes: number;
    description: string;
    imageUrl: string;
    isBorderCrossing: boolean;
    status: RouteStatus;
  }>({
    departurePortId: "",
    destinationPortId: "",
    durationMinutes: 60,
    description: "",
    imageUrl: "",
    isBorderCrossing: false,
    status: "ACTIVE"
  });

  // Destination port options excluding the currently selected departure port
  const destinationPortOptions = React.useMemo(() => {
    return portOptions.filter((opt) => opt.value !== newRoute.departurePortId);
  }, [portOptions, newRoute.departurePortId]);

  const isSamePort = Boolean(
    newRoute.departurePortId &&
    newRoute.destinationPortId &&
    newRoute.departurePortId === newRoute.destinationPortId
  );

  // Pre-fill default departure/arrival when ports load
  React.useEffect(() => {
    if (ports.length >= 2) {
      if (!newRoute.departurePortId && !newRoute.destinationPortId) {
        setNewRoute((prev) => ({
          ...prev,
          departurePortId: ports[0]?.id ?? "",
          destinationPortId: ports[1]?.id ?? ""
        }));
      } else if (
        newRoute.departurePortId &&
        newRoute.departurePortId === newRoute.destinationPortId
      ) {
        const differentPort = ports.find((p) => p.id !== newRoute.departurePortId);
        if (differentPort) {
          setNewRoute((prev) => ({
            ...prev,
            destinationPortId: differentPort.id
          }));
        }
      }
    } else if (ports.length === 1 && !newRoute.departurePortId) {
      setNewRoute((prev) => ({
        ...prev,
        departurePortId: ports[0]?.id ?? "",
        destinationPortId: ""
      }));
    }
  }, [ports, newRoute.departurePortId, newRoute.destinationPortId]);

  const [editForm, setEditForm] = React.useState<{
    durationMinutes: number;
    description: string;
    imageUrl: string;
    isBorderCrossing: boolean;
    status: RouteStatus;
  }>({
    durationMinutes: 60,
    description: "",
    imageUrl: "",
    isBorderCrossing: false,
    status: "ACTIVE"
  });

  const handleOpenAddModal = () => {
    setNewRoute({
      departurePortId: ports[0]?.id ?? "",
      destinationPortId: ports[1]?.id ?? "",
      durationMinutes: 60,
      description: "",
      imageUrl: "",
      isBorderCrossing: false,
      status: "ACTIVE"
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (route: IRoute) => {
    setEditingRoute(route);
    setEditForm({
      durationMinutes: route.durationMinutes,
      description: route.description ?? "",
      imageUrl: route.imageUrl ?? "",
      isBorderCrossing: route.isBorderCrossing,
      status: route.status
    });
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoute.departurePortId || !newRoute.destinationPortId) {
      toast.error("Please select both Departure Port and Arrival Port.");
      return;
    }

    if (newRoute.departurePortId === newRoute.destinationPortId) {
      toast.error("Departure port and arrival port cannot be the same.");
      return;
    }

    if (!newRoute.durationMinutes || newRoute.durationMinutes < 5) {
      toast.error("Estimated travel time must be at least 5 minutes.");
      return;
    }

    try {
      const payload: ICreateRoutePayload = {
        departurePortId: newRoute.departurePortId,
        destinationPortId: newRoute.destinationPortId,
        durationMinutes: Number(newRoute.durationMinutes),
        description: newRoute.description?.trim() || undefined,
        imageUrl: newRoute.imageUrl?.trim() || undefined,
        isBorderCrossing: newRoute.isBorderCrossing,
        status: newRoute.status
      };

      const res = await createMutation.mutateAsync(payload);

      if (res?.data) {
        const created = res.data;
        setLocalRoutes((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      }

      setPage(1);
      await refetchRoutes();
      setIsAddModalOpen(false);

      // Reset form
      setNewRoute({
        departurePortId: ports[0]?.id ?? "",
        destinationPortId: ports[1]?.id ?? "",
        durationMinutes: 60,
        description: "",
        imageUrl: "",
        isBorderCrossing: false,
        status: "ACTIVE"
      });
    } catch {
      // Handled in mutation onError
    }
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    if (!editForm.durationMinutes || editForm.durationMinutes < 5) {
      toast.error("Estimated travel time must be at least 5 minutes.");
      return;
    }

    try {
      const payload: IUpdateRoutePayload = {
        durationMinutes: Number(editForm.durationMinutes),
        description: editForm.description?.trim() || undefined,
        imageUrl: editForm.imageUrl?.trim() || undefined,
        isBorderCrossing: editForm.isBorderCrossing,
        status: editForm.status
      };

      const res = await updateMutation.mutateAsync({
        id: editingRoute.id,
        payload
      });

      if (res?.data) {
        const updated = res.data;
        setLocalRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }

      await refetchRoutes();
      setEditingRoute(null);
    } catch {
      // Handled in mutation onError
    }
  };

  const handleDeleteRoute = async () => {
    if (!deletingRoute) return;

    try {
      await deleteMutation.mutateAsync(deletingRoute.id);
      setLocalRoutes((prev) => prev.filter((r) => r.id !== deletingRoute.id));
      await refetchRoutes();
      setDeletingRoute(null);
    } catch {
      // Handled in mutation onError
    }
  };

  // Source all routes (from limit: 100 query, fallback to localRoutes)
  const allRoutes = allRoutesResponse?.routes ?? localRoutes;
  const isSearching = Boolean(debouncedSearch.trim());
  const searchNormalized = debouncedSearch.trim().toLowerCase();

  // Filter routes based on search query and status filter
  const filteredRoutes = React.useMemo(() => {
    // When searching, use allRoutes to allow searching across entire fleet network; otherwise use localRoutes
    const baseList = isSearching ? allRoutes : localRoutes;

    return baseList.filter((r) => {
      // 1. Status Filter
      if (statusFilter === "ACTIVE" && r.status !== "ACTIVE") return false;
      if (statusFilter === "INACTIVE" && r.status !== "INACTIVE") return false;

      // 2. Search Query Filter
      if (searchNormalized) {
        const depPort = ports.find((p) => p.id === r.departurePortId);
        const destPort = ports.find((p) => p.id === r.destinationPortId);
        const depName = (r.departurePort?.name || depPort?.name || "").toLowerCase();
        const destName = (r.destinationPort?.name || destPort?.name || "").toLowerCase();
        const desc = (r.description || "").toLowerCase();
        const amenities = Array.isArray(r.amenities) ? r.amenities.join(" ").toLowerCase() : "";
        const priceStr = r.basePrice ? `$${r.basePrice}` : "";

        const matches =
          depName.includes(searchNormalized) ||
          destName.includes(searchNormalized) ||
          desc.includes(searchNormalized) ||
          amenities.includes(searchNormalized) ||
          priceStr.includes(searchNormalized);

        if (!matches) return false;
      }

      return true;
    });
  }, [isSearching, allRoutes, localRoutes, statusFilter, searchNormalized, ports]);

  // Aggregate Stats (derived from allRoutesResponse when available, falling back to local)
  const totalRoutesCount = allRoutesResponse?.pagination?.totalItems ?? allRoutes.length;
  const activeRoutesCount = allRoutes.filter((r) => r.status === "ACTIVE").length;
  const inactiveRoutesCount = allRoutes.filter((r) => r.status === "INACTIVE").length;

  // Pagination calculations
  const meta = routesResponse?.pagination;
  const totalCount = isSearching
    ? filteredRoutes.length
    : (meta?.totalItems ?? (allRoutesResponse?.pagination?.totalItems ?? filteredRoutes.length));
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Paginated slice when searching client-side
  const displayedRoutes = React.useMemo(() => {
    if (isSearching) {
      return filteredRoutes.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }
    return filteredRoutes;
  }, [isSearching, filteredRoutes, currentPage, pageSize]);

  // Keep page clamped if items are deleted or filtered (guarded against active in-flight fetches)
  React.useEffect(() => {
    if (!isRoutesLoading && !isRoutesFetching && page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages, isRoutesLoading, isRoutesFetching]);


  // Selection Computations
  const displayedRouteIds = React.useMemo(
    () => displayedRoutes.map((r) => r.id),
    [displayedRoutes]
  );

  const isAllCurrentPageSelected =
    displayedRoutes.length > 0 &&
    displayedRoutes.every((r) => selectedRouteIds.has(r.id));

  const isSomeCurrentPageSelected =
    displayedRoutes.some((r) => selectedRouteIds.has(r.id)) && !isAllCurrentPageSelected;

  const selectedCount = selectedRouteIds.size;

  const toggleSelectAllCurrentPage = () => {
    setSelectedRouteIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        displayedRouteIds.forEach((id) => next.delete(id));
      } else {
        displayedRouteIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectAllAcrossPages = () => {
    const allIds = (allRoutesResponse?.routes ?? localRoutes).map((r) => r.id);
    setSelectedRouteIds(new Set(allIds));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRouteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedRouteIds(new Set());
  };

  const selectedRoutesList = React.useMemo(() => {
    const allList = allRoutesResponse?.routes ?? localRoutes;
    return allList.filter((r) => selectedRouteIds.has(r.id));
  }, [allRoutesResponse?.routes, localRoutes, selectedRouteIds]);

  // Bulk Handlers
  const handleBulkActivate = async () => {
    if (selectedRouteIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedRouteIds);
    setIsBulkOperating(true);
    setBulkActionType("activate");

    const toastId = toast.loading(
      `Activating ${ids.length} ${ids.length === 1 ? "route" : "routes"}...`
    );

    setLocalRoutes((prev) =>
      prev.map((r) => (selectedRouteIds.has(r.id) ? { ...r, status: "ACTIVE" } : r))
    );

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        await updateMutation.mutateAsync({
          id,
          payload: { status: "ACTIVE" }
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetchRoutes();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setSelectedRouteIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully activated all ${successCount} routes!`, { id: toastId });
    } else {
      toast.warning(`Activated ${successCount} routes (${failCount} failed)`, { id: toastId });
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedRouteIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedRouteIds);
    setIsBulkOperating(true);
    setBulkActionType("deactivate");

    const toastId = toast.loading(
      `Pausing ${ids.length} ${ids.length === 1 ? "route" : "routes"}...`
    );

    setLocalRoutes((prev) =>
      prev.map((r) => (selectedRouteIds.has(r.id) ? { ...r, status: "INACTIVE" } : r))
    );

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        await updateMutation.mutateAsync({
          id,
          payload: { status: "INACTIVE" }
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetchRoutes();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setSelectedRouteIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully paused ${successCount} routes!`, { id: toastId });
    } else {
      toast.warning(`Paused ${successCount} routes (${failCount} failed)`, { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRouteIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedRouteIds);
    setIsBulkOperating(true);
    setBulkActionType("delete");

    const toastId = toast.loading(
      `Deleting ${ids.length} ${ids.length === 1 ? "route" : "routes"}...`
    );

    setLocalRoutes((prev) => prev.filter((r) => !selectedRouteIds.has(r.id)));

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        await deleteMutation.mutateAsync(id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetchRoutes();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setIsBulkDeleteModalOpen(false);
    setSelectedRouteIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully deleted ${successCount} routes!`, { id: toastId });
    } else {
      toast.warning(`Deleted ${successCount} routes (${failCount} failed)`, { id: toastId });
    }
  };



  const routeColumns: TableColumn<IRoute>[] = [
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
            aria-label="Select all routes on current page"
          />
        </div>
      ),
      headerClassName: "w-10 px-3 text-center",
      className: "w-10 px-3 text-center",
      align: "center",
      cell: (item) => {
        const isChecked = selectedRouteIds.has(item.id);
        return (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggleSelectRow(item.id)}
              aria-label={`Select route ${item.departurePort?.name} to ${item.destinationPort?.name}`}
            />
          </div>
        );
      }
    },
    {
      header: "ROUTE",
      cell: (item, idx) => {
        const routeImg = getRouteImage(item, idx);
        return (
          <div className="flex items-center gap-3.5">
            <div className="border-border/80 bg-muted/40 group relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border shadow-2xs sm:h-14 sm:w-20">
              <img
                src={routeImg}
                alt={`${item.departurePort?.name ?? "Port"} to ${item.destinationPort?.name ?? "Port"}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_ROUTE_IMAGES[0];
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              {item.isBorderCrossing && (
                <div
                  className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400 shadow-xs ring-2 ring-white dark:ring-slate-900"
                  title="International Border Crossing"
                />
              )}
            </div>
            <div className="max-w-[280px]">
              <div className="text-foreground flex items-center gap-1.5 text-xs font-bold sm:text-sm">
                <span>{item.departurePort?.name ?? "Departure"}</span>
                <ArrowRight className="text-muted-foreground h-3 w-3 shrink-0" />
                <span>{item.destinationPort?.name ?? "Arrival"}</span>
              </div>
              {item.description ? (
                <p
                  className="text-muted-foreground mt-0.5 truncate text-[11px]"
                  title={item.description}
                >
                  {item.description}
                </p>
              ) : null}
              <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[10px]">
                {item.isBorderCrossing ? (
                  <span className="py-0.2 inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Globe className="h-2.5 w-2.5" /> International
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );
      }
    },

    {
      header: "DURATION",
      cell: (item) => (
        <div className="text-foreground flex items-center gap-1.5 text-xs font-medium">
          <Clock className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          <span>{formatDuration(item.durationMinutes)}</span>
        </div>
      )
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status === "ACTIVE" ? "Active" : "Inactive"} />
    },
    {
      header: "ACTIONS",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenEdit(item)}
            className="h-8 w-8 rounded-lg border-emerald-200 font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            title="Edit Route Details"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeletingRoute(item)}
            className="h-8 w-8 rounded-lg border-rose-200 font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            title="Delete Route"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const newDeparturePort = React.useMemo(() => {
    return ports.find((p) => p.id === newRoute.departurePortId);
  }, [ports, newRoute.departurePortId]);

  const newDestinationPort = React.useMemo(() => {
    return ports.find((p) => p.id === newRoute.destinationPortId);
  }, [ports, newRoute.destinationPortId]);

  const editDeparturePort = React.useMemo(() => {
    return editingRoute?.departurePort || ports.find((p) => p.id === editingRoute?.departurePortId);
  }, [ports, editingRoute]);

  const editDestinationPort = React.useMemo(() => {
    return (
      editingRoute?.destinationPort || ports.find((p) => p.id === editingRoute?.destinationPortId)
    );
  }, [ports, editingRoute]);

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Ferry Routes Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage ferry routes, ports, travel times, descriptions, and included services.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="flex h-9 shrink-0 items-center gap-1.5 self-start bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Route
        </Button>
      </div>

      {/* Operational Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase">Total Routes</p>
              <p className="text-foreground mt-1 text-2xl font-extrabold">
                {totalRoutesCount} {totalRoutesCount === 1 ? "Route" : "Routes"}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">Connected port paths</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Navigation className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase">Active Routes</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {activeRoutesCount} Active
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">Open for trip schedules</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Inactive Routes
              </p>
              <p className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {inactiveRoutesCount} Inactive
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">Temporarily paused</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card border-border/80 flex flex-col gap-3 rounded-xl border p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search routes by departure, arrival port, region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background h-9 pl-9 pr-8 text-xs shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5 rounded-full hover:bg-muted"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap">Filter:</span>
          <Tabs
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as "ALL" | "ACTIVE" | "INACTIVE")}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="ALL" className="text-xs">
                All ({totalRoutesCount})
              </TabsTrigger>
              <TabsTrigger value="ACTIVE" className="text-xs">
                Active ({activeRoutesCount})
              </TabsTrigger>
              <TabsTrigger value="INACTIVE" className="text-xs">
                Inactive ({inactiveRoutesCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Routes Table */}
      {isRoutesLoading && localRoutes.length === 0 ? (
        <div className="bg-card border-border/80 flex flex-col items-center justify-center rounded-xl border py-16 shadow-xs">
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading routes from database...
          </p>
        </div>
      ) : isRoutesError && localRoutes.length === 0 ? (
        <div className="bg-card border-border/80 flex flex-col items-center justify-center rounded-xl border px-4 py-16 text-center shadow-xs">
          <AlertTriangle className="mb-2 h-8 w-8 text-rose-500" />
          <h3 className="text-foreground text-sm font-bold">Unable to load ferry routes</h3>
          <p className="mt-1 max-w-md text-xs font-medium text-rose-600 dark:text-rose-400">
            {routesError instanceof Error
              ? routesError.message
              : "Could not fetch routes from the server."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRoutes()}
            className="mt-4 text-xs font-semibold"
          >
            Retry Connection
          </Button>
        </div>
      ) : displayedRoutes.length === 0 ? (
        isSearching ? (
          <div className="bg-card border-border/80 flex flex-col items-center justify-center rounded-xl border px-4 py-16 text-center shadow-xs">
            <div className="bg-muted text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-foreground text-base font-bold">No matching routes found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              No ferry routes match your search for &ldquo;
              <span className="text-foreground font-semibold">{searchTerm}</span>
              &rdquo;. Try searching for a different port name, atoll, or clear filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="mt-4 h-8 cursor-pointer text-xs font-semibold"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear Search Query
            </Button>
          </div>
        ) : (
          <div className="bg-card border-border/80 flex flex-col items-center justify-center rounded-xl border px-4 py-16 text-center shadow-xs">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Navigation className="h-6 w-6" />
            </div>
            <h3 className="text-foreground text-base font-bold">No ferry routes found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Create your first maritime route connecting departure and arrival ports to start
              scheduling passenger trips.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 h-9 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add First Route
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {/* Bulk Action Sticky / Floating Toolbar */}
          {selectedCount > 0 && (
            <div className="bg-card/95 dark:bg-card/90 border-emerald-500/30 sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-2 text-xs font-bold text-white shadow-2xs">
                  {selectedCount}
                </span>
                <span className="text-foreground text-xs font-semibold">
                  {selectedCount === 1 ? "route selected" : "routes selected"}
                </span>

                {displayedRoutes.length > 0 &&
                  isAllCurrentPageSelected &&
                  totalCount > displayedRoutes.length &&
                  selectedCount < totalCount && (
                    <button
                      type="button"
                      onClick={toggleSelectAllAcrossPages}
                      className="ml-2 cursor-pointer text-xs font-semibold text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
                    >
                      Select all {totalCount} routes across all pages
                    </button>
                  )}
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={handleBulkActivate}
                  className="h-8 cursor-pointer gap-1.5 border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                  title="Activate selected routes"
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
                  onClick={handleBulkDeactivate}
                  className="h-8 cursor-pointer gap-1.5 border-amber-200 bg-amber-50/50 text-xs font-semibold text-amber-700 shadow-2xs hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                  title="Pause / Deactivate selected routes"
                >
                  {isBulkOperating && bulkActionType === "deactivate" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  <span>Pause</span>
                </Button>



                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="h-8 cursor-pointer gap-1.5 bg-rose-600 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700"
                  title="Delete selected routes"
                >
                  {isBulkOperating && bulkActionType === "delete" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Delete ({selectedCount})</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={clearSelection}
                  className="h-8 cursor-pointer gap-1 text-xs text-muted-foreground hover:text-foreground"
                  title="Deselect all routes"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Deselect</span>
                </Button>
              </div>
            </div>
          )}

          <DashboardTableCard
            title="Ferry Routes Network"
            headerRight={
              selectedCount > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-medium">
                    {selectedCount} selected
                  </span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="cursor-pointer text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Clear
                  </button>
                </div>
              ) : undefined
            }
            columns={routeColumns}
            data={displayedRoutes}
            keyExtractor={(item) => item.id}
            rowClassName={(item) =>
              selectedRouteIds.has(item.id)
                ? "bg-emerald-500/10 hover:bg-emerald-500/15 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/40 border-l-2 border-l-emerald-600 dark:border-l-emerald-400"
                : undefined
            }
          />

          {/* Reusable Pagination Controls */}
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
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemName={isSearching ? "matching routes" : "routes"}
            isLoading={isRoutesFetching}
          />
        </div>
      )}

      {/* Add Route Modal (Enriched Option 2) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-border/60 border-b px-6 py-4 pr-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-base font-bold">
                  Add New Ferry Route
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Connect departure and arrival ports, specify estimated travel duration, descriptions, and set route status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddRoute} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="h-[min(65vh,520px)] w-full">
              <div className="space-y-4 px-6 py-4">
                {isSamePort && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Departure port and arrival port cannot be the same.
              </div>
            )}

            {/* Ports 2-Column Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-semibold">From *</Label>
                {isPortsLoading ? (
                  <div className="text-muted-foreground flex h-9 items-center text-xs">
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Loading ports...
                  </div>
                ) : (
                  <ReusableSelect
                    value={newRoute.departurePortId}
                    onValueChange={(val) =>
                      setNewRoute((prev) => {
                        let nextDest = prev.destinationPortId;
                        if (val === nextDest) {
                          const alternative = ports.find((p) => p.id !== val);
                          nextDest = alternative ? alternative.id : "";
                        }
                        return { ...prev, departurePortId: val, destinationPortId: nextDest };
                      })
                    }
                    options={portOptions}
                    placeholder="Select departure port..."
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-semibold">To *</Label>
                {isPortsLoading ? (
                  <div className="text-muted-foreground flex h-9 items-center text-xs">
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Loading ports...
                  </div>
                ) : (
                  <ReusableSelect
                    value={newRoute.destinationPortId}
                    onValueChange={(val) =>
                      setNewRoute((prev) => ({ ...prev, destinationPortId: val }))
                    }
                    options={
                      destinationPortOptions.length > 0 ? destinationPortOptions : portOptions
                    }
                    placeholder="Select arrival port..."
                  />
                )}
              </div>
            </div>

            {/* Travel Time */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="durationMinutes"
                  className="text-foreground text-xs font-semibold"
                >
                  Estimated Travel Time *
                </Label>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  ≈ {formatDuration(newRoute.durationMinutes)}
                </span>
              </div>
              <div className="relative">
                <Clock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  id="durationMinutes"
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  placeholder="e.g. 60"
                  value={newRoute.durationMinutes}
                  onChange={(e) =>
                    setNewRoute((prev) => ({
                      ...prev,
                      durationMinutes: parseInt(e.target.value, 10) || 0
                    }))
                  }
                  required
                  className="h-9 pr-16 pl-9 text-xs"
                />
                <span className="text-muted-foreground pointer-events-none absolute top-2.5 right-3 text-xs">
                  minutes
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="routeDescription" className="text-foreground text-xs font-semibold">
                Route Description
              </Label>
              <textarea
                id="routeDescription"
                rows={2}
                placeholder="e.g. Direct scenic speed ferry connection between Malé and Maafushi with crystal blue lagoon views."
                value={newRoute.description}
                onChange={(e) => setNewRoute((prev) => ({ ...prev, description: e.target.value }))}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border p-2.5 text-xs shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Route Cover Photo Uploader */}
            <RouteImageUploader
              label="Route Cover Photo (Optional)"
              entityName="route"
              value={newRoute.imageUrl}
              onChange={(val) => setNewRoute((prev) => ({ ...prev, imageUrl: val }))}
            />

            {/* Status & Border Crossing */}
            <div className="border-border/50 grid grid-cols-1 gap-4 border-t pt-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-semibold">Route Status *</Label>
                <ReusableSelect
                  value={newRoute.status}
                  onValueChange={(val) =>
                    setNewRoute((prev) => ({ ...prev, status: val as RouteStatus }))
                  }
                  options={ROUTE_STATUS_OPTIONS}
                  placeholder="Select route status..."
                />
              </div>

              <div className="bg-muted/20 border-border/70 flex items-center gap-3 self-end rounded-xl border p-2.5">
                <input
                  type="checkbox"
                  id="borderCrossing"
                  checked={newRoute.isBorderCrossing}
                  onChange={(e) =>
                    setNewRoute((prev) => ({ ...prev, isBorderCrossing: e.target.checked }))
                  }
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <Label
                    htmlFor="borderCrossing"
                    className="text-foreground block cursor-pointer text-xs leading-none font-medium"
                  >
                    Cross-Border / International Route
                  </Label>
                  <p className="text-muted-foreground mt-0.5 text-[10px]">
                    Requires passport & customs clearance
                  </p>
                </div>
              </div>
            </div>
              </div>
            </ScrollArea>

            <DialogFooter className="shrink-0 border-border/60 bg-muted/40 border-t px-6 py-3.5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createMutation.isPending ||
                  ports.length < 2 ||
                  isSamePort ||
                  !newRoute.departurePortId ||
                  !newRoute.destinationPortId
                }
                className="bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Creating Route...
                  </>
                ) : (
                  "Create Route"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Route Modal (Enriched Option 2) */}
      <Dialog open={!!editingRoute} onOpenChange={(open) => !open && setEditingRoute(null)}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-border/60 border-b px-6 py-4 pr-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-base font-bold">
                  Edit Ferry Route
                </DialogTitle>
                <DialogDescription className="text-xs font-medium">
                  {editingRoute?.departurePort?.name} ➔ {editingRoute?.destinationPort?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateRoute} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="h-[min(65vh,520px)] w-full">
              <div className="space-y-4 px-6 py-4">
            {/* Travel Time */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="edit-durationMinutes"
                  className="text-foreground text-xs font-semibold"
                >
                  Estimated Travel Time *
                </Label>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  ≈ {formatDuration(editForm.durationMinutes)}
                </span>
              </div>
              <div className="relative">
                <Clock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  id="edit-durationMinutes"
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  placeholder="e.g. 60"
                  value={editForm.durationMinutes}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      durationMinutes: parseInt(e.target.value, 10) || 0
                    }))
                  }
                  required
                  className="h-9 pr-16 pl-9 text-xs"
                />
                <span className="text-muted-foreground pointer-events-none absolute top-2.5 right-3 text-xs">
                  minutes
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-foreground text-xs font-semibold">
                Route Description
              </Label>
              <textarea
                id="edit-description"
                rows={2}
                placeholder="e.g. Fast island transfer service."
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border p-2.5 text-xs shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Route Cover Photo Uploader */}
            <RouteImageUploader
              label="Route Cover Photo (Optional)"
              entityName="route"
              value={editForm.imageUrl}
              onChange={(val) => setEditForm((prev) => ({ ...prev, imageUrl: val }))}
            />

            {/* Status & Border Crossing */}
            <div className="border-border/50 grid grid-cols-1 gap-4 border-t pt-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-semibold">Route Status *</Label>
                <ReusableSelect
                  value={editForm.status}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({ ...prev, status: val as RouteStatus }))
                  }
                  options={ROUTE_STATUS_OPTIONS}
                  placeholder="Select route status..."
                />
              </div>

              <div className="bg-muted/20 border-border/70 flex items-center gap-3 self-end rounded-xl border p-2.5">
                <input
                  type="checkbox"
                  id="editBorderCrossing"
                  checked={editForm.isBorderCrossing}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, isBorderCrossing: e.target.checked }))
                  }
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <Label
                    htmlFor="editBorderCrossing"
                    className="text-foreground block cursor-pointer text-xs leading-none font-medium"
                  >
                    Cross-Border / International Route
                  </Label>
                  <p className="text-muted-foreground mt-0.5 text-[10px]">
                    Requires passport & customs clearance
                  </p>
                </div>
              </div>
            </div>
              </div>
            </ScrollArea>

            <DialogFooter className="shrink-0 border-border/60 bg-muted/40 border-t px-6 py-3.5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingRoute(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingRoute} onOpenChange={(open) => !open && setDeletingRoute(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-base font-bold">
                  Delete Ferry Route
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to remove this route from your fleet network?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="text-muted-foreground py-2 text-xs leading-relaxed">
            Route:{" "}
            <span className="text-foreground font-semibold">
              {deletingRoute?.departurePort?.name} ➔ {deletingRoute?.destinationPort?.name}
            </span>
            . Any passenger trips scheduled on this route might be affected or canceled. This action
            cannot be undone.
          </div>

          <DialogFooter className="border-border/60 flex items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingRoute(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteRoute}
              className="bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Deleting Route...
                </>
              ) : (
                "Delete Route"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog
        open={isBulkDeleteModalOpen}
        onOpenChange={(open) => !open && !isBulkOperating && setIsBulkDeleteModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-base font-bold">
                  Delete {selectedCount} Ferry {selectedCount === 1 ? "Route" : "Routes"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to permanently delete {selectedCount} selected routes from your fleet?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Any future passenger trips or active bookings associated with these routes may be affected. This action cannot be undone.
            </p>

            <div className="border-border/60 bg-muted/40 max-h-48 space-y-1.5 overflow-y-auto rounded-xl border p-2.5">
              {selectedRoutesList.map((r) => (
                <div
                  key={r.id}
                  className="bg-card/70 flex items-center justify-between rounded-lg border border-border/40 px-2.5 py-1.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span>{r.departurePort?.name || "Departure"}</span>
                    <ArrowRight className="text-muted-foreground h-3 w-3 shrink-0" />
                    <span>{r.destinationPort?.name || "Arrival"}</span>
                  </div>
                  <span className="text-muted-foreground text-xs font-medium">
                    {formatDuration(r.durationMinutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="border-border/60 flex items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkOperating}
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isBulkOperating}
              onClick={handleBulkDelete}
              className="bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {isBulkOperating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Deleting {selectedCount} Routes...
                </>
              ) : (
                `Delete ${selectedCount} ${selectedCount === 1 ? "Route" : "Routes"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
