"use client";

import * as React from "react";
import {
  Edit,
  Globe2,
  Navigation,
  Plus,
  Ship
} from "lucide-react";
import { toast } from "sonner";
import { PROVIDER_MOCK_DATA, type ProviderRouteItem } from "@/data";
import {
  Badge,
  Button,
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
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Seasonal", label: "Seasonal" }
];

export default function OperatorRoutesPage() {
  const [routes, setRoutes] = React.useState<ProviderRouteItem[]>(PROVIDER_MOCK_DATA.routes);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] = React.useState<ProviderRouteItem | null>(null);
  const [borderFilter, setBorderFilter] = React.useState<"all" | "yes" | "no">("all");

  const ferryOptions = PROVIDER_MOCK_DATA.vessels.map((v) => ({
    value: v.name,
    label: `${v.name} (${v.capacity} PAX)`
  }));

  const [newRoute, setNewRoute] = React.useState({
    departurePort: "",
    arrivalPort: "",
    assignedFerry: ferryOptions[0]?.value || "Ocean Voyager I",
    duration: "1h 30m",
    distanceNm: 60,
    dailyTrips: 4,
    price: 40.0,
    isBorderCrossing: false,
    status: "Active" as ProviderRouteItem["status"]
  });

  const [editForm, setEditForm] = React.useState({
    departurePort: "",
    arrivalPort: "",
    assignedFerry: ferryOptions[0]?.value || "Ocean Voyager I",
    duration: "1h 30m",
    distanceNm: 60,
    dailyTrips: 4,
    price: 40.0,
    isBorderCrossing: false,
    status: "Active" as ProviderRouteItem["status"]
  });

  const handleOpenEdit = (route: ProviderRouteItem) => {
    setEditingRoute(route);
    setEditForm({
      departurePort: route.departurePort,
      arrivalPort: route.arrivalPort,
      assignedFerry: route.assignedFerry || ferryOptions[0]?.value || "Ocean Voyager I",
      duration: route.duration,
      distanceNm: route.distanceNm,
      dailyTrips: route.dailyTrips,
      price: route.price,
      isBorderCrossing: route.isBorderCrossing,
      status: route.status
    });
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.departurePort.trim() || !newRoute.arrivalPort.trim()) {
      toast.error("Please enter both departure and destination ports.");
      return;
    }

    const created: ProviderRouteItem = {
      id: `r-${Date.now().toString().slice(-4)}`,
      routeName: `${newRoute.departurePort.trim()} ⇄ ${newRoute.arrivalPort.trim()}`,
      departurePort: newRoute.departurePort.trim(),
      arrivalPort: newRoute.arrivalPort.trim(),
      assignedFerry: newRoute.assignedFerry,
      duration: newRoute.duration.trim() || "1h 30m",
      distanceNm: Number(newRoute.distanceNm) || 50,
      dailyTrips: Number(newRoute.dailyTrips) || 2,
      price: Number(newRoute.price) || 35.0,
      isBorderCrossing: newRoute.isBorderCrossing,
      status: newRoute.status
    };

    setRoutes((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewRoute({
      departurePort: "",
      arrivalPort: "",
      assignedFerry: ferryOptions[0]?.value || "Ocean Voyager I",
      duration: "1h 30m",
      distanceNm: 60,
      dailyTrips: 4,
      price: 40.0,
      isBorderCrossing: false,
      status: "Active"
    });
    toast.success(`Route "${created.routeName}" created successfully!`);
  };

  const handleUpdateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    setRoutes((prev) =>
      prev.map((r) =>
        r.id === editingRoute.id
          ? {
              ...r,
              routeName: `${editForm.departurePort.trim()} ⇄ ${editForm.arrivalPort.trim()}`,
              departurePort: editForm.departurePort.trim(),
              arrivalPort: editForm.arrivalPort.trim(),
              assignedFerry: editForm.assignedFerry,
              duration: editForm.duration.trim() || r.duration,
              distanceNm: Number(editForm.distanceNm) || r.distanceNm,
              dailyTrips: Number(editForm.dailyTrips) || r.dailyTrips,
              price: Number(editForm.price) || r.price,
              isBorderCrossing: editForm.isBorderCrossing,
              status: editForm.status
            }
          : r
      )
    );

    toast.success("Route details updated successfully!");
    setEditingRoute(null);
  };

  const filteredRoutes = React.useMemo(() => {
    if (borderFilter === "yes") return routes.filter((r) => r.isBorderCrossing);
    if (borderFilter === "no") return routes.filter((r) => !r.isBorderCrossing);
    return routes;
  }, [routes, borderFilter]);

  const routeColumns: TableColumn<ProviderRouteItem>[] = [
    {
      header: "DEPARTURE PORT",
      accessorKey: "departurePort",
      className: "font-semibold text-foreground text-xs"
    },
    {
      header: "DESTINATION PORT",
      accessorKey: "arrivalPort",
      className: "font-semibold text-foreground text-xs"
    },
    {
      header: "ASSIGNED FERRY",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Ship className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium text-foreground text-xs">{item.assignedFerry || "Ocean Voyager I"}</span>
        </div>
      )
    },
    {
      header: "DURATION",
      accessorKey: "duration",
      className: "font-mono text-xs text-muted-foreground font-medium"
    },
    {
      header: "BORDER CROSSING",
      className: "text-xs",
      cell: (item) =>
        item.isBorderCrossing ? (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[11px] font-semibold flex items-center gap-1 w-fit">
            <Globe2 className="h-3 w-3" />
            <span>Yes</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground text-[11px] font-medium w-fit">
            No (Domestic)
          </Badge>
        )
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
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenEdit(item)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold h-8 w-8 rounded-lg"
            title="Edit Route"
          >
            <Edit className="h-4 w-4" />
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
            Operating Routes
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage inter-island passenger lines, assigned ferries, duration, and border crossing controls.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Route
        </Button>
      </div>

      {/* Filter Controls with High-Contrast Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground">Border Crossing Filter:</span>
          <Tabs
            value={borderFilter}
            onValueChange={(val) => setBorderFilter(val as "all" | "yes" | "no")}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="all">
                All Routes ({routes.length})
              </TabsTrigger>
              <TabsTrigger value="yes">
                Yes (Border) ({routes.filter((r) => r.isBorderCrossing).length})
              </TabsTrigger>
              <TabsTrigger value="no">
                No (Domestic) ({routes.filter((r) => !r.isBorderCrossing).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Routes Table */}
      <DashboardTableCard
        title="Configured Ferry Routes"
        columns={routeColumns}
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
      />

      {/* Add Route Modal with expanded width */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Add Operating Route
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Establish a new departure and destination corridor with an assigned ferry.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddRoute} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dep-port" className="text-xs font-semibold text-foreground">
                  Departure Port *
                </Label>
                <Input
                  id="dep-port"
                  placeholder="e.g. Honolulu Pier 4"
                  value={newRoute.departurePort}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, departurePort: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arr-port" className="text-xs font-semibold text-foreground">
                  Destination Port *
                </Label>
                <Input
                  id="arr-port"
                  placeholder="e.g. Kahului Harbor, Maui"
                  value={newRoute.arrivalPort}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, arrivalPort: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Assigned Ferry *
                </Label>
                <ReusableSelect
                  value={newRoute.assignedFerry}
                  onValueChange={(val) => setNewRoute((prev) => ({ ...prev, assignedFerry: val }))}
                  options={ferryOptions}
                  placeholder="Select assigned ferry"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs font-semibold text-foreground">
                  Duration *
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g. 1h 45m"
                  value={newRoute.duration}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, duration: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs font-semibold text-foreground">
                  Standard Fare ($) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="5"
                  step="0.5"
                  value={newRoute.price}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                  className="text-xs h-9 font-mono"
                />
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
                      status: val as ProviderRouteItem["status"]
                    }))
                  }
                  options={ROUTE_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/40">
                <input
                  id="border-crossing"
                  type="checkbox"
                  checked={newRoute.isBorderCrossing}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, isBorderCrossing: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <Label htmlFor="border-crossing" className="text-xs font-semibold text-foreground cursor-pointer">
                  This route is an International / Border Crossing Corridor (Requires Passport Check)
                </Label>
              </div>
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                Add Route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Route Modal with expanded width */}
      <Dialog open={!!editingRoute} onOpenChange={(open) => !open && setEditingRoute(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Route Details
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update departure, destination ports, assigned ferry, and border crossing settings.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateRoute} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dep-port" className="text-xs font-semibold text-foreground">
                  Departure Port *
                </Label>
                <Input
                  id="edit-dep-port"
                  value={editForm.departurePort}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, departurePort: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-arr-port" className="text-xs font-semibold text-foreground">
                  Destination Port *
                </Label>
                <Input
                  id="edit-arr-port"
                  value={editForm.arrivalPort}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, arrivalPort: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Assigned Ferry *
                </Label>
                <ReusableSelect
                  value={editForm.assignedFerry}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, assignedFerry: val }))}
                  options={ferryOptions}
                  placeholder="Select assigned ferry"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration" className="text-xs font-semibold text-foreground">
                  Duration *
                </Label>
                <Input
                  id="edit-duration"
                  value={editForm.duration}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, duration: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-xs font-semibold text-foreground">
                  Standard Fare ($) *
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="5"
                  step="0.5"
                  value={editForm.price}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                  className="text-xs h-9 font-mono"
                />
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
                      status: val as ProviderRouteItem["status"]
                    }))
                  }
                  options={ROUTE_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/40">
                <input
                  id="edit-border-crossing"
                  type="checkbox"
                  checked={editForm.isBorderCrossing}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, isBorderCrossing: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <Label htmlFor="edit-border-crossing" className="text-xs font-semibold text-foreground cursor-pointer">
                  This route is an International / Border Crossing Corridor (Requires Passport Check)
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
