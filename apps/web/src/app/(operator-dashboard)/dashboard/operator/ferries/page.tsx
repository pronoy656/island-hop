"use client";

import * as React from "react";
import {
  Edit,
  Gauge,
  Plus,
  Ship,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { PROVIDER_MOCK_DATA, type ProviderVessel } from "@/data";
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

const VESSEL_TYPE_OPTIONS = [
  { value: "High-Speed Catamaran", label: "High-Speed Catamaran" },
  { value: "Hydrofoil Express", label: "Hydrofoil Express" },
  { value: "Passenger Ferry", label: "Passenger Ferry" },
  { value: "Ro-Ro Vehicle & Pax Ferry", label: "Ro-Ro Vehicle & Pax Ferry" }
];

const VESSEL_STATUS_OPTIONS = [
  { value: "In Service", label: "In Service" },
  { value: "Docked", label: "Docked" },
  { value: "Maintenance", label: "Maintenance" }
];

export default function OperatorFerriesPage() {
  const [vessels, setVessels] = React.useState<ProviderVessel[]>(PROVIDER_MOCK_DATA.vessels);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVessel, setEditingVessel] = React.useState<ProviderVessel | null>(null);

  // New vessel form state
  const [newVessel, setNewVessel] = React.useState({
    name: "",
    type: "High-Speed Catamaran",
    capacity: 150,
    yearBuilt: 2023,
    registrationNumber: "",
    speedKnots: 28,
    assignedRoute: "Honolulu ⇄ Maui",
    status: "In Service" as ProviderVessel["status"]
  });

  // Edit vessel form state
  const [editForm, setEditForm] = React.useState({
    name: "",
    type: "High-Speed Catamaran",
    capacity: 150,
    yearBuilt: 2023,
    registrationNumber: "",
    speedKnots: 28,
    assignedRoute: "Honolulu ⇄ Maui",
    status: "In Service" as ProviderVessel["status"]
  });

  const handleOpenEdit = (vessel: ProviderVessel) => {
    setEditingVessel(vessel);
    setEditForm({
      name: vessel.name,
      type: vessel.type,
      capacity: vessel.capacity,
      yearBuilt: vessel.yearBuilt,
      registrationNumber: vessel.registrationNumber,
      speedKnots: vessel.speedKnots,
      assignedRoute: vessel.assignedRoute || "Unassigned",
      status: vessel.status
    });
  };

  const handleAddVessel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVessel.name.trim() || !newVessel.registrationNumber.trim()) {
      toast.error("Please fill in the Ferry Name and Registration Number.");
      return;
    }

    const created: ProviderVessel = {
      id: `v-${Date.now().toString().slice(-4)}`,
      name: newVessel.name.trim(),
      type: newVessel.type,
      capacity: Number(newVessel.capacity) || 100,
      yearBuilt: Number(newVessel.yearBuilt) || 2024,
      registrationNumber: newVessel.registrationNumber.trim(),
      status: newVessel.status,
      speedKnots: Number(newVessel.speedKnots) || 25,
      assignedRoute: newVessel.assignedRoute
    };

    setVessels((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewVessel({
      name: "",
      type: "High-Speed Catamaran",
      capacity: 150,
      yearBuilt: 2023,
      registrationNumber: "",
      speedKnots: 28,
      assignedRoute: "Honolulu ⇄ Maui",
      status: "In Service"
    });
    toast.success(`Ferry "${created.name}" registered successfully!`);
  };

  const handleUpdateVessel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVessel) return;

    setVessels((prev) =>
      prev.map((v) =>
        v.id === editingVessel.id
          ? {
              ...v,
              name: editForm.name.trim() || v.name,
              type: editForm.type,
              capacity: Number(editForm.capacity) || v.capacity,
              yearBuilt: Number(editForm.yearBuilt) || v.yearBuilt,
              registrationNumber: editForm.registrationNumber.trim() || v.registrationNumber,
              status: editForm.status,
              speedKnots: Number(editForm.speedKnots) || v.speedKnots,
              assignedRoute: editForm.assignedRoute
            }
          : v
      )
    );

    toast.success(`Ferry "${editForm.name}" updated successfully!`);
    setEditingVessel(null);
  };

  const totalCapacity = vessels.reduce((acc, v) => acc + v.capacity, 0);

  const vesselColumns: TableColumn<ProviderVessel>[] = [
    {
      header: "FERRY NAME",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Ship className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">{item.name}</div>
            <div className="text-[11px] text-muted-foreground">{item.type}</div>
          </div>
        </div>
      )
    },
    {
      header: "FERRY ID / REGISTRATION",
      accessorKey: "registrationNumber",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300 text-xs"
    },
    {
      header: "TOTAL SEATS",
      className: "font-semibold text-foreground text-xs",
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-mono">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{item.capacity} Seats</span>
        </div>
      )
    },
    {
      header: "ASSIGNED ROUTE",
      cell: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
          {item.assignedRoute || "Unassigned"}
        </span>
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
            title="Edit Ferry"
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
            Fleet & Ferries
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage your registered passenger vessels, catamarans, and seaworthiness status.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add New Ferry
        </Button>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Ferries</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{vessels.length} Vessels</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {vessels.filter((v) => v.status === "In Service").length} In Service
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Fleet Capacity</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{totalCapacity} Seats</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Combined passenger capacity</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Average Speed</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">28.0 Knots</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">High-speed catamaran fleet</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Gauge className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ferries Table */}
      <DashboardTableCard
        title="Registered Ferry Fleet"
        columns={vesselColumns}
        data={vessels}
        keyExtractor={(item) => item.id}
      />

      {/* Add New Ferry Modal with expanded width */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Ship className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Add New Ferry
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Register a new passenger vessel or catamaran to your operational fleet.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddVessel} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vessel-name" className="text-xs font-semibold text-foreground">
                  Ferry Name *
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
                  Ferry ID / Registration *
                </Label>
                <Input
                  id="vessel-reg"
                  placeholder="e.g. HI-4402-X"
                  value={newVessel.registrationNumber}
                  onChange={(e) =>
                    setNewVessel((prev) => ({ ...prev, registrationNumber: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vessel-cap" className="text-xs font-semibold text-foreground">
                  Total Seats (Capacity) *
                </Label>
                <Input
                  id="vessel-cap"
                  type="number"
                  min="10"
                  max="1000"
                  value={newVessel.capacity}
                  onChange={(e) =>
                    setNewVessel((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vessel-route" className="text-xs font-semibold text-foreground">
                  Assigned Route
                </Label>
                <Input
                  id="vessel-route"
                  placeholder="e.g. Honolulu ⇄ Maui"
                  value={newVessel.assignedRoute}
                  onChange={(e) => setNewVessel((prev) => ({ ...prev, assignedRoute: e.target.value }))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Ferry Type *
                </Label>
                <ReusableSelect
                  value={newVessel.type}
                  onValueChange={(val) => setNewVessel((prev) => ({ ...prev, type: val }))}
                  options={VESSEL_TYPE_OPTIONS}
                  placeholder="Select ferry type"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Ferry Status *
                </Label>
                <ReusableSelect
                  value={newVessel.status}
                  onValueChange={(val) =>
                    setNewVessel((prev) => ({
                      ...prev,
                      status: val as ProviderVessel["status"]
                    }))
                  }
                  options={VESSEL_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vessel-speed" className="text-xs font-semibold text-foreground">
                  Cruising Speed (Knots)
                </Label>
                <Input
                  id="vessel-speed"
                  type="number"
                  min="5"
                  max="60"
                  value={newVessel.speedKnots}
                  onChange={(e) =>
                    setNewVessel((prev) => ({ ...prev, speedKnots: parseInt(e.target.value) || 0 }))
                  }
                  className="text-xs h-9 font-mono"
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                Add Ferry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ferry Modal with expanded width */}
      <Dialog open={!!editingVessel} onOpenChange={(open) => !open && setEditingVessel(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Ferry Details
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update vessel specifications, registration ID, route, and status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateVessel} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vessel-name" className="text-xs font-semibold text-foreground">
                  Ferry Name *
                </Label>
                <Input
                  id="edit-vessel-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vessel-reg" className="text-xs font-semibold text-foreground">
                  Ferry ID / Registration *
                </Label>
                <Input
                  id="edit-vessel-reg"
                  value={editForm.registrationNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, registrationNumber: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vessel-cap" className="text-xs font-semibold text-foreground">
                  Total Seats (Capacity) *
                </Label>
                <Input
                  id="edit-vessel-cap"
                  type="number"
                  min="10"
                  max="1000"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vessel-route" className="text-xs font-semibold text-foreground">
                  Assigned Route
                </Label>
                <Input
                  id="edit-vessel-route"
                  value={editForm.assignedRoute}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, assignedRoute: e.target.value }))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Ferry Type *
                </Label>
                <ReusableSelect
                  value={editForm.type}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, type: val }))}
                  options={VESSEL_TYPE_OPTIONS}
                  placeholder="Select ferry type"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Ferry Status *
                </Label>
                <ReusableSelect
                  value={editForm.status}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: val as ProviderVessel["status"]
                    }))
                  }
                  options={VESSEL_STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vessel-speed" className="text-xs font-semibold text-foreground">
                  Cruising Speed (Knots)
                </Label>
                <Input
                  id="edit-vessel-speed"
                  type="number"
                  min="5"
                  max="60"
                  value={editForm.speedKnots}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, speedKnots: parseInt(e.target.value) || 0 }))
                  }
                  className="text-xs h-9 font-mono"
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
