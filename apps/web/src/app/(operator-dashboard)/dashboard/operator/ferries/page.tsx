"use client";

import * as React from "react";
import {
  AlertTriangle,
  Edit,
  Loader2,
  Plus,
  Search,
  Ship,
  Trash2,
  Users,
  Wrench
} from "lucide-react";
import { toast } from "sonner";
import type {
  ICreateFerryPayload,
  IFerry,
  IUpdateFerryPayload,
  VesselStatus,
  VesselType
} from "@repo/types";
import {
  useCreateFerryMutation,
  useDebounce,
  useDeleteFerryMutation,
  useFerriesQuery,
  useFerryStatsQuery,
  useUpdateFerryMutation
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
  ReusableSelect
} from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

// Real-world maritime vessel type options aligning with live backend enum
const VESSEL_TYPE_OPTIONS: Array<{ value: VesselType; label: string }> = [
  { value: "CATAMARAN", label: "Catamaran (High-Speed)" },
  { value: "SPEEDBOAT", label: "Speedboat (Express)" },
  { value: "TRADITIONAL_FERRY", label: "Traditional Ferry (Monohull)" }
];

// Operational statuses recognized in maritime compliance
const VESSEL_STATUS_OPTIONS: Array<{ value: VesselStatus; label: string }> = [
  { value: "IN_SERVICE", label: "In Service" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" }
];

const FILTER_TYPE_OPTIONS = [
  { value: "ALL", label: "All Vessel Types" },
  ...VESSEL_TYPE_OPTIONS
];

const FILTER_STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  ...VESSEL_STATUS_OPTIONS
];

function formatVesselType(type: VesselType | string): string {
  switch (type) {
    case "CATAMARAN":
      return "Catamaran";
    case "SPEEDBOAT":
      return "Speedboat";
    case "TRADITIONAL_FERRY":
      return "Traditional Ferry";
    default:
      return type;
  }
}

function formatVesselStatus(status: VesselStatus | string): string {
  switch (status) {
    case "IN_SERVICE":
      return "In Service";
    case "MAINTENANCE":
      return "Maintenance";
    case "OUT_OF_SERVICE":
      return "Out of Service";
    default:
      return status;
  }
}

export default function OperatorFerriesPage() {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVessel, setEditingVessel] = React.useState<IFerry | null>(null);
  const [deletingVessel, setDeletingVessel] = React.useState<IFerry | null>(null);

  // Queries
  const { data: ferriesData, isLoading, isError, error, refetch } = useFerriesQuery({
    search: debouncedSearch.trim() || undefined,
    type: selectedType !== "ALL" ? (selectedType as VesselType) : undefined,
    status: selectedStatus !== "ALL" ? (selectedStatus as VesselStatus) : undefined
  });

  const { data: statsData } = useFerryStatsQuery();

  // Mutations
  const createMutation = useCreateFerryMutation();
  const updateMutation = useUpdateFerryMutation();
  const deleteMutation = useDeleteFerryMutation();

  // Local vessels state synchronized with server data
  const [localVessels, setLocalVessels] = React.useState<IFerry[]>([]);

  React.useEffect(() => {
    if (ferriesData?.ferries) {
      setLocalVessels(ferriesData.ferries);
    }
  }, [ferriesData?.ferries]);

  const vessels = localVessels;

  // Form states
  const [newVessel, setNewVessel] = React.useState<ICreateFerryPayload>({
    name: "",
    registration: "",
    capacity: 120,
    type: "CATAMARAN",
    status: "IN_SERVICE"
  });

  const [editForm, setEditForm] = React.useState<IUpdateFerryPayload>({
    name: "",
    registration: "",
    capacity: 120,
    type: "CATAMARAN",
    status: "IN_SERVICE"
  });

  const handleOpenEdit = (vessel: IFerry) => {
    setEditingVessel(vessel);
    setEditForm({
      name: vessel.name,
      registration: vessel.registration,
      capacity: vessel.capacity,
      type: vessel.type,
      status: vessel.status
    });
  };

  const handleAddVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVessel.name.trim() || !newVessel.registration.trim()) {
      toast.error("Please provide both Vessel Name and Official Registration No.");
      return;
    }

    if (!newVessel.capacity || newVessel.capacity <= 0) {
      toast.error("Capacity must be at least 1 passenger.");
      return;
    }

    try {
      const res = await createMutation.mutateAsync({
        name: newVessel.name.trim(),
        registration: newVessel.registration.trim().toUpperCase(),
        capacity: Number(newVessel.capacity),
        type: newVessel.type,
        status: newVessel.status
      });

      // Instantly inject created ferry into local table view
      if (res?.data) {
        const createdFerry = res.data;
        setLocalVessels((prev) => [
          createdFerry,
          ...prev.filter((v) => v.id !== createdFerry.id)
        ]);
      }

      await refetch();
      setIsAddModalOpen(false);
      setNewVessel({
        name: "",
        registration: "",
        capacity: 120,
        type: "CATAMARAN",
        status: "IN_SERVICE"
      });
    } catch {
      // Handled in mutation onError
    }
  };

  const handleUpdateVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVessel) return;

    if (!editForm.name?.trim() || !editForm.registration?.trim()) {
      toast.error("Vessel Name and Registration No. cannot be blank.");
      return;
    }

    try {
      const res = await updateMutation.mutateAsync({
        id: editingVessel.id,
        payload: {
          name: editForm.name.trim(),
          registration: editForm.registration.trim().toUpperCase(),
          capacity: Number(editForm.capacity),
          type: editForm.type,
          status: editForm.status
        }
      });

      // Instantly update the edited vessel in local view
      if (res?.data) {
        const updatedFerry = res.data;
        setLocalVessels((prev) =>
          prev.map((v) => (v.id === updatedFerry.id ? updatedFerry : v))
        );
      }

      await refetch();
      setEditingVessel(null);
    } catch {
      // Handled in mutation onError
    }
  };

  const handleDeleteVessel = async () => {
    if (!deletingVessel) return;

    try {
      await deleteMutation.mutateAsync(deletingVessel.id);
      setLocalVessels((prev) => prev.filter((v) => v.id !== deletingVessel.id));
      await refetch();
      setDeletingVessel(null);
    } catch {
      // Handled in mutation onError
    }
  };

  // Aggregated Stats
  const totalFleetCount = statsData?.totalFerries ?? vessels.length;
  const inServiceCount =
    statsData?.inServiceFerries ?? vessels.filter((v) => v.status === "IN_SERVICE").length;
  const maintenanceCount =
    statsData?.maintenanceFerries ?? vessels.filter((v) => v.status === "MAINTENANCE").length;
  const outOfServiceCount =
    statsData?.outOfServiceFerries ?? vessels.filter((v) => v.status === "OUT_OF_SERVICE").length;
  const totalCapacity =
    statsData?.totalCapacity ?? vessels.reduce((acc, v) => acc + (v.capacity || 0), 0);

  const vesselColumns: TableColumn<IFerry>[] = [
    {
      header: "VESSEL NAME",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Ship className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">{item.name}</div>
            {item.createdAt ? (
              <div className="text-[11px] text-muted-foreground">
                Added {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            ) : null}
          </div>
        </div>
      )
    },
    {
      header: "REGISTRATION NO.",
      accessorKey: "registration",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300 text-xs"
    },
    {
      header: "VESSEL TYPE",
      cell: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
          {formatVesselType(item.type)}
        </span>
      )
    },
    {
      header: "CAPACITY",
      className: "font-semibold text-foreground text-xs",
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-mono">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{item.capacity} Seats</span>
        </div>
      )
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={formatVesselStatus(item.status)} />
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
            title="Edit Specifications"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeletingVessel(item)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-semibold h-8 w-8 rounded-lg"
            title="Decommission / Remove Vessel"
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
            Fleet Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage your registered passenger vessels, certified seating capacity, and operational status.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Vessel
        </Button>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Fleet</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalFleetCount} {totalFleetCount === 1 ? "Vessel" : "Vessels"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Commercial registry</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">In Service</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {inServiceCount} Active
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Ready for dispatch</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Maintenance</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {maintenanceCount} In Dock
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Inspection & service</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Out of Service</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {outOfServiceCount} Inactive
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Decommissioned / idle</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Passenger Capacity</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {totalCapacity.toLocaleString()} Seats
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Certified aggregate seats</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vessels by name or registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <ReusableSelect
            value={selectedType}
            onValueChange={setSelectedType}
            options={FILTER_TYPE_OPTIONS}
            placeholder="Filter by type"
            className="w-[160px] h-9 text-xs"
          />

          <ReusableSelect
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            options={FILTER_STATUS_OPTIONS}
            placeholder="Filter by status"
            className="w-[150px] h-9 text-xs"
          />
        </div>
      </div>

      {/* Ferries Table / Content State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Loading fleet directory...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
          <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
          <h3 className="text-sm font-bold text-foreground">Failed to load fleet data</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium max-w-md mt-1">
            {error instanceof Error ? error.message : "Could not fetch registered vessels from the server."}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs font-semibold"
            >
              Retry Connection
            </Button>
            {error instanceof Error &&
            (error.message.toLowerCase().includes("token") ||
              error.message.toLowerCase().includes("unauthorized") ||
              error.message.toLowerCase().includes("authorization")) ? (
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
      ) : vessels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            <Ship className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No vessels found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchTerm || selectedType !== "ALL" || selectedStatus !== "ALL"
              ? "No vessels match the specified search query or filters."
              : "You have not registered any ferries in your fleet yet. Add your first vessel to begin creating sea routes."}
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Register First Vessel
          </Button>
        </div>
      ) : (
        <DashboardTableCard
          title="Fleet Directory"
          columns={vesselColumns}
          data={vessels}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Add New Ferry Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Ship className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Register New Vessel
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Register a passenger ferry or catamaran to your operational carrier fleet.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddVessel} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vessel-name" className="text-xs font-semibold text-foreground">
                  Vessel Name *
                </Label>
                <Input
                  id="vessel-name"
                  placeholder="e.g. Island Star IV"
                  value={newVessel.name}
                  onChange={(e) => setNewVessel((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vessel-reg" className="text-xs font-semibold text-foreground">
                  Registration No. (IMO / Vessel ID) *
                </Label>
                <Input
                  id="vessel-reg"
                  placeholder="e.g. IMO-9482103"
                  value={newVessel.registration}
                  onChange={(e) =>
                    setNewVessel((prev) => ({ ...prev, registration: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vessel-cap" className="text-xs font-semibold text-foreground">
                  Passenger Capacity (Pax) *
                </Label>
                <Input
                  id="vessel-cap"
                  type="number"
                  min="1"
                  max="5000"
                  value={newVessel.capacity}
                  onChange={(e) =>
                    setNewVessel((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Vessel Type *
                </Label>
                <ReusableSelect
                  value={newVessel.type || "CATAMARAN"}
                  onValueChange={(val) =>
                    setNewVessel((prev) => ({ ...prev, type: val as VesselType }))
                  }
                  options={VESSEL_TYPE_OPTIONS}
                  placeholder="Select vessel type"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Operational Status *
                </Label>
                <ReusableSelect
                  value={newVessel.status || "IN_SERVICE"}
                  onValueChange={(val) =>
                    setNewVessel((prev) => ({
                      ...prev,
                      status: val as VesselStatus
                    }))
                  }
                  options={VESSEL_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs"
                disabled={createMutation.isPending}
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
                    Registering...
                  </>
                ) : (
                  "Register Vessel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ferry Modal */}
      <Dialog open={!!editingVessel} onOpenChange={(open) => !open && setEditingVessel(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Vessel Specifications
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update vessel details, registration identification, passenger limit, and operational status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateVessel} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vessel-name" className="text-xs font-semibold text-foreground">
                  Vessel Name *
                </Label>
                <Input
                  id="edit-vessel-name"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vessel-reg" className="text-xs font-semibold text-foreground">
                  Registration No. (IMO / Vessel ID) *
                </Label>
                <Input
                  id="edit-vessel-reg"
                  value={editForm.registration || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, registration: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vessel-cap" className="text-xs font-semibold text-foreground">
                  Passenger Capacity (Pax) *
                </Label>
                <Input
                  id="edit-vessel-cap"
                  type="number"
                  min="1"
                  max="5000"
                  value={editForm.capacity || 0}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Vessel Type *
                </Label>
                <ReusableSelect
                  value={editForm.type || "CATAMARAN"}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({ ...prev, type: val as VesselType }))
                  }
                  options={VESSEL_TYPE_OPTIONS}
                  placeholder="Select vessel type"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Operational Status *
                </Label>
                <ReusableSelect
                  value={editForm.status || "IN_SERVICE"}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: val as VesselStatus
                    }))
                  }
                  options={VESSEL_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingVessel(null)}
                className="text-xs"
                disabled={updateMutation.isPending}
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
                  "Save Specifications"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete / Decommission Confirmation Modal */}
      <Dialog open={!!deletingVessel} onOpenChange={(open) => !open && setDeletingVessel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Decommission Vessel
                </DialogTitle>
                <DialogDescription className="text-xs">
                  This action removes the vessel from active fleet inventory.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              Are you sure you want to remove{" "}
              <span className="font-bold text-foreground">
                {deletingVessel?.name} ({deletingVessel?.registration})
              </span>{" "}
              from your operational fleet?
            </p>
            <p className="text-rose-600 dark:text-rose-400 font-medium">
              Note: If this vessel is currently assigned to future scheduled trips, removing it will
              require re-assigning those routes to an active ferry.
            </p>
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingVessel(null)}
              className="text-xs"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteVessel}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Removing...
                </>
              ) : (
                "Confirm Decommission"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
