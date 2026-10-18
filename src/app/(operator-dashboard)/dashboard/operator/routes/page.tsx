"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  Edit,
  Globe,
  Loader2,
  Navigation,
  Plus,
  RefreshCw,
  Ship,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import type {
  ICreateRoutePayload,
  IPort,
  IRoute,
  RouteStatus
} from "@/types";
import {
  useCreateRouteMutation,
  useDeleteRouteMutation,
  usePortsQuery,
  useRoutesQuery,
  useUpdateRouteMutation
} from "@/hooks";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ReusableSelect,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

const ROUTE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active (Available for trips)" },
  { value: "INACTIVE", label: "Inactive (Temporarily paused)" }
];

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
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] = React.useState<IRoute | null>(null);
  const [deletingRoute, setDeletingRoute] = React.useState<IRoute | null>(null);

  // Queries
  const {
    data: routesResponse,
    isLoading: isRoutesLoading,
    isError: isRoutesError,
    error: routesError,
    refetch: refetchRoutes
  } = useRoutesQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    limit: 100
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
      label: `${p.name}${p.atoll ? ` · ${p.atoll} Atoll` : ""}${p.code ? ` (${p.code})` : ""}`
    }));
  }, [ports]);

  // Form states
  const [newRoute, setNewRoute] = React.useState<{
    departurePortId: string;
    destinationPortId: string;
    durationMinutes: number;
    isBorderCrossing: boolean;
    status: RouteStatus;
  }>({
    departurePortId: "",
    destinationPortId: "",
    durationMinutes: 60,
    isBorderCrossing: false,
    status: "ACTIVE"
  });

  // Pre-fill default departure/arrival when ports load
  React.useEffect(() => {
    if (ports.length >= 2 && !newRoute.departurePortId && !newRoute.destinationPortId) {
      setNewRoute((prev) => ({
        ...prev,
        departurePortId: ports[0]?.id ?? "",
        destinationPortId: ports[1]?.id ?? ""
      }));
    }
  }, [ports, newRoute.departurePortId, newRoute.destinationPortId]);

  const [editForm, setEditForm] = React.useState<{
    durationMinutes: number;
    isBorderCrossing: boolean;
    status: RouteStatus;
  }>({
    durationMinutes: 60,
    isBorderCrossing: false,
    status: "ACTIVE"
  });

  const handleOpenEdit = (route: IRoute) => {
    setEditingRoute(route);
    setEditForm({
      durationMinutes: route.durationMinutes,
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
        isBorderCrossing: newRoute.isBorderCrossing,
        status: newRoute.status
      };

      const res = await createMutation.mutateAsync(payload);

      if (res?.data) {
        const created = res.data;
        setLocalRoutes((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      }

      await refetchRoutes();
      setIsAddModalOpen(false);

      // Reset form
      setNewRoute({
        departurePortId: ports[0]?.id ?? "",
        destinationPortId: ports[1]?.id ?? "",
        durationMinutes: 60,
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
      const res = await updateMutation.mutateAsync({
        id: editingRoute.id,
        payload: {
          durationMinutes: Number(editForm.durationMinutes),
          isBorderCrossing: editForm.isBorderCrossing,
          status: editForm.status
        }
      });

      if (res?.data) {
        const updated = res.data;
        setLocalRoutes((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
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

  // Filtered routes based on local mirror & status filter
  const displayedRoutes = React.useMemo(() => {
    if (statusFilter === "ACTIVE") return localRoutes.filter((r) => r.status === "ACTIVE");
    if (statusFilter === "INACTIVE") return localRoutes.filter((r) => r.status === "INACTIVE");
    return localRoutes;
  }, [localRoutes, statusFilter]);

  // Aggregate Stats
  const totalRoutesCount = localRoutes.length;
  const activeRoutesCount = localRoutes.filter((r) => r.status === "ACTIVE").length;
  const inactiveRoutesCount = localRoutes.filter((r) => r.status === "INACTIVE").length;
  const avgDurationMinutes =
    totalRoutesCount > 0
      ? Math.round(
          localRoutes.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / totalRoutesCount
        )
      : 0;

  const routeColumns: TableColumn<IRoute>[] = [
    {
      header: "FERRY ROUTE",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Compass className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs sm:text-sm">
              <span>{item.departurePort?.name ?? "Departure"}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{item.destinationPort?.name ?? "Arrival"}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                {item.departurePort?.code ?? "DEP"} ➔ {item.destinationPort?.code ?? "ARR"}
              </span>
              {item.isBorderCrossing ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded">
                  <Globe className="h-2.5 w-2.5" /> International
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "DEPARTURE PORT (ORIGIN)",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground text-xs">
            {item.departurePort?.name ?? "Unknown Port"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {item.departurePort?.atoll ? `${item.departurePort.atoll} Atoll` : item.departurePort?.code ?? "Port"}
          </div>
        </div>
      )
    },
    {
      header: "ARRIVAL PORT (DESTINATION)",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground text-xs">
            {item.destinationPort?.name ?? "Unknown Port"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {item.destinationPort?.atoll ? `${item.destinationPort.atoll} Atoll` : item.destinationPort?.code ?? "Port"}
          </div>
        </div>
      )
    },
    {
      header: "EST. TRAVEL TIME",
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{formatDuration(item.durationMinutes)}</span>
        </div>
      )
    },
    {
      header: "ROUTE TYPE",
      cell: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {item.isBorderCrossing ? "International" : "Domestic Island"}
        </span>
      )
    },
    {
      header: "STATUS",
      cell: (item) => (
        <StatusBadge status={item.status === "ACTIVE" ? "Active" : "Inactive"} />
      )
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
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold h-8 w-8 rounded-lg"
            title="Edit travel time or status"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeletingRoute(item)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-semibold h-8 w-8 rounded-lg"
            title="Delete Route"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ferry Routes
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage passenger sea routes between island ports, travel times, and service availability.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRoutes()}
            disabled={isRoutesLoading}
            className="h-9 text-xs flex items-center gap-1.5"
            title="Reload routes from server"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRoutesLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Real-World Operational Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Routes</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalRoutesCount} {totalRoutesCount === 1 ? "Route" : "Routes"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Connected port paths</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Navigation className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Routes</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeRoutesCount} Active
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Open for trip schedules</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Inactive Routes</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {inactiveRoutesCount} Inactive
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Temporarily paused</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Avg. Travel Time</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {avgDurationMinutes > 0 ? formatDuration(avgDurationMinutes) : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Average journey duration</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground">Filter Routes:</span>
          <Tabs
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as "ALL" | "ACTIVE" | "INACTIVE")}
            className="w-auto"
          >
            <TabsList className="h-8">
              <TabsTrigger value="ALL" className="text-xs">
                All Routes ({localRoutes.length})
              </TabsTrigger>
              <TabsTrigger value="ACTIVE" className="text-xs">
                Active ({localRoutes.filter((r) => r.status === "ACTIVE").length})
              </TabsTrigger>
              <TabsTrigger value="INACTIVE" className="text-xs">
                Inactive ({localRoutes.filter((r) => r.status === "INACTIVE").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Routes Table / Loading / Error State */}
      {isRoutesLoading && localRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Loading routes from database...</p>
        </div>
      ) : isRoutesError && localRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
          <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
          <h3 className="text-sm font-bold text-foreground">Unable to load ferry routes</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium max-w-md mt-1">
            {routesError instanceof Error
              ? routesError.message
              : "Could not fetch routes from the server."}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchRoutes()}
              className="text-xs font-semibold"
            >
              Retry Connection
            </Button>
            {routesError instanceof Error &&
            (routesError.message.toLowerCase().includes("token") ||
              routesError.message.toLowerCase().includes("unauthorized") ||
              routesError.message.toLowerCase().includes("authorization")) ? (
              <Button
                size="sm"
                onClick={() => (window.location.href = "/login")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Log In Again
              </Button>
            ) : null}
          </div>
        </div>
      ) : displayedRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            <Navigation className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No ferry routes found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {statusFilter !== "ALL"
              ? "No routes match the selected status filter."
              : "You haven't added any ferry routes yet. Create your first route between two island ports to start scheduling passenger trips."}
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Route
          </Button>
        </div>
      ) : (
        <DashboardTableCard
          title="Ferry Routes Directory"
          columns={routeColumns}
          data={displayedRoutes}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Add Route Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Add New Ferry Route
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Connect a departure port to an arrival port with estimated travel time.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddRoute} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dep-port-select" className="text-xs font-semibold text-foreground">
                  Departure Port (From) *
                </Label>
                {isPortsLoading ? (
                  <div className="h-9 flex items-center text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Loading ports...
                  </div>
                ) : (
                  <ReusableSelect
                    value={newRoute.departurePortId}
                    onValueChange={(val) => setNewRoute((prev) => ({ ...prev, departurePortId: val }))}
                    options={portOptions}
                    placeholder="Select departure port..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dest-port-select" className="text-xs font-semibold text-foreground">
                  Arrival Port (To) *
                </Label>
                {isPortsLoading ? (
                  <div className="h-9 flex items-center text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Loading ports...
                  </div>
                ) : (
                  <ReusableSelect
                    value={newRoute.destinationPortId}
                    onValueChange={(val) => setNewRoute((prev) => ({ ...prev, destinationPortId: val }))}
                    options={portOptions}
                    placeholder="Select arrival port..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes" className="text-xs font-semibold text-foreground">
                  Estimated Travel Time (Minutes) *
                </Label>
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
                  className="text-xs h-9 font-mono"
                />
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  One-way journey: {formatDuration(newRoute.durationMinutes)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Route Status *
                </Label>
                <ReusableSelect
                  value={newRoute.status}
                  onValueChange={(val) =>
                    setNewRoute((prev) => ({
                      ...prev,
                      status: val as RouteStatus
                    }))
                  }
                  options={ROUTE_STATUS_OPTIONS}
                  placeholder="Select route status..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <input
                type="checkbox"
                id="borderCrossing"
                checked={newRoute.isBorderCrossing}
                onChange={(e) =>
                  setNewRoute((prev) => ({ ...prev, isBorderCrossing: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="borderCrossing" className="text-xs font-medium text-foreground cursor-pointer">
                Cross-border / International Route (passengers need passport & immigration clearance)
              </Label>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
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
                disabled={createMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
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

      {/* Edit Route Modal */}
      <Dialog open={!!editingRoute} onOpenChange={(open) => !open && setEditingRoute(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Ferry Route
                </DialogTitle>
                <DialogDescription className="text-xs font-medium">
                  {editingRoute?.departurePort?.name} ➔ {editingRoute?.destinationPort?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateRoute} className="space-y-4 py-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-durationMinutes" className="text-xs font-semibold text-foreground">
                  Estimated Travel Time (Minutes) *
                </Label>
                <Input
                  id="edit-durationMinutes"
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  value={editForm.durationMinutes}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      durationMinutes: parseInt(e.target.value, 10) || 0
                    }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  One-way journey: {formatDuration(editForm.durationMinutes)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Route Status *
                </Label>
                <ReusableSelect
                  value={editForm.status}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: val as RouteStatus
                    }))
                  }
                  options={ROUTE_STATUS_OPTIONS}
                  placeholder="Select route status..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <input
                  type="checkbox"
                  id="editBorderCrossing"
                  checked={editForm.isBorderCrossing}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, isBorderCrossing: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor="editBorderCrossing" className="text-xs font-medium text-foreground cursor-pointer">
                  Cross-border / International Route
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
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
                <DialogTitle className="text-base font-bold text-foreground">
                  Delete Ferry Route
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to remove this route from your fleet network?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2 text-xs text-muted-foreground leading-relaxed">
            Route:{" "}
            <span className="font-semibold text-foreground">
              {deletingRoute?.departurePort?.name} ➔ {deletingRoute?.destinationPort?.name}
            </span>
            . Any passenger trips scheduled on this route might be affected or canceled. This action cannot be undone.
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
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
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Deleting Route...
                </>
              ) : (
                "Delete Route"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
