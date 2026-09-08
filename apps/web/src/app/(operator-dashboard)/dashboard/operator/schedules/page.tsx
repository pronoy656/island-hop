"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Edit,
  Plus,
  Ship
} from "lucide-react";
import { toast } from "sonner";
import { PROVIDER_MOCK_DATA, type ProviderScheduleItem } from "@/data";
import {
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

const VESSEL_OPTIONS = [
  { value: "Ocean Voyager I", label: "Ocean Voyager I (180 PAX)" },
  { value: "Pacific Wave Runner", label: "Pacific Wave Runner (120 PAX)" },
  { value: "Island Hopper III", label: "Island Hopper III (250 PAX)" }
];

const ROUTE_OPTIONS = [
  { value: "Honolulu → Maui", label: "Honolulu → Maui" },
  { value: "Honolulu → Lanai", label: "Honolulu → Lanai" },
  { value: "Honolulu → Molokai", label: "Honolulu → Molokai" },
  { value: "St. Thomas ⇄ Tortola (BVI)", label: "St. Thomas ⇄ Tortola (BVI)" }
];

const STATUS_OPTIONS = [
  { value: "On Schedule", label: "On Schedule" },
  { value: "Boarding", label: "Boarding" },
  { value: "Preparing", label: "Preparing" },
  { value: "Departed", label: "Departed" },
  { value: "Delayed", label: "Delayed" }
];

export default function OperatorSchedulesPage() {
  const [schedules, setSchedules] = React.useState<ProviderScheduleItem[]>(PROVIDER_MOCK_DATA.schedules);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState<ProviderScheduleItem | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");

  const [newSchedule, setNewSchedule] = React.useState({
    departureTime: "09:00 AM",
    arrivalTime: "10:45 AM",
    vesselName: "Ocean Voyager I",
    routeName: "Honolulu → Maui",
    capacity: 180,
    captain: "Capt. Mark Kealoha",
    gatePier: "Pier 4 - Gate A",
    status: "On Schedule" as ProviderScheduleItem["status"]
  });

  const [editForm, setEditForm] = React.useState({
    departureTime: "09:00 AM",
    arrivalTime: "10:45 AM",
    vesselName: "Ocean Voyager I",
    routeName: "Honolulu → Maui",
    capacity: 180,
    captain: "Capt. Mark Kealoha",
    gatePier: "Pier 4 - Gate A",
    status: "On Schedule" as ProviderScheduleItem["status"]
  });

  const handleOpenEdit = (schedule: ProviderScheduleItem) => {
    setEditingSchedule(schedule);
    setEditForm({
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      vesselName: schedule.vesselName,
      routeName: schedule.routeName,
      capacity: schedule.capacity,
      captain: schedule.captain,
      gatePier: schedule.gatePier,
      status: schedule.status
    });
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ProviderScheduleItem = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      departureTime: newSchedule.departureTime,
      arrivalTime: newSchedule.arrivalTime,
      vesselName: newSchedule.vesselName,
      routeName: newSchedule.routeName,
      status: newSchedule.status,
      capacity: Number(newSchedule.capacity) || 150,
      bookedSeats: 0,
      captain: newSchedule.captain,
      gatePier: newSchedule.gatePier
    };

    setSchedules((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    toast.success(`Trip schedule "${created.departureTime} - ${created.routeName}" created!`);
  };

  const handleUpdateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === editingSchedule.id
          ? {
              ...s,
              departureTime: editForm.departureTime,
              arrivalTime: editForm.arrivalTime,
              vesselName: editForm.vesselName,
              routeName: editForm.routeName,
              capacity: Number(editForm.capacity) || s.capacity,
              captain: editForm.captain,
              gatePier: editForm.gatePier,
              status: editForm.status
            }
          : s
      )
    );

    toast.success("Schedule updated successfully!");
    setEditingSchedule(null);
  };

  const filteredSchedules = React.useMemo(() => {
    if (activeTab === "boarding") return schedules.filter((s) => s.status === "Boarding");
    if (activeTab === "scheduled") return schedules.filter((s) => s.status === "On Schedule" || s.status === "Preparing");
    if (activeTab === "departed") return schedules.filter((s) => s.status === "Departed");
    return schedules;
  }, [schedules, activeTab]);

  const scheduleColumns: TableColumn<ProviderScheduleItem>[] = [
    {
      header: "DEPARTURE",
      accessorKey: "departureTime",
      className: "font-mono font-bold text-foreground text-xs"
    },
    {
      header: "ARRIVAL",
      accessorKey: "arrivalTime",
      className: "font-mono text-muted-foreground text-xs"
    },
    {
      header: "FERRY / VESSEL",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Ship className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-foreground text-xs">{item.vesselName}</span>
        </div>
      )
    },
    {
      header: "ROUTE",
      accessorKey: "routeName",
      className: "text-foreground font-medium text-xs"
    },
    {
      header: "GATE / DOCK",
      accessorKey: "gatePier",
      className: "text-muted-foreground font-mono text-[11px]"
    },
    {
      header: "CAPTAIN",
      accessorKey: "captain",
      className: "text-muted-foreground text-xs"
    },
    {
      header: "CAPACITY / LOAD",
      className: "text-xs",
      cell: (item) => {
        const pct = Math.round((item.bookedSeats / item.capacity) * 100);
        return (
          <div className="flex flex-col gap-1 min-w-[90px]">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="font-semibold">{item.bookedSeats}/{item.capacity}</span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      }
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenEdit(item)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold h-7 w-7 rounded-lg"
            title="Edit Schedule"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold text-xs h-7 px-2.5"
            asChild
          >
            <Link href="/dashboard/operator/manifest">
              Manifest
            </Link>
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
            Trip Schedules & Boarding
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage daily ferry departures, gate allocations, and real-time vessel readiness.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="max-w-md">
          <TabsTrigger value="all">
            All Trips ({schedules.length})
          </TabsTrigger>
          <TabsTrigger value="boarding">
            Boarding Now
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="departed">
            Departed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Schedules Table */}
      <DashboardTableCard
        title="Today's Operational Schedule"
        columns={scheduleColumns}
        data={filteredSchedules}
        keyExtractor={(item) => item.id}
      />

      {/* Add Schedule Modal with expanded width */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Schedule New Ferry Trip
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Create a new passenger departure slot with vessel and route assignment.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddSchedule} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dep-time" className="text-xs font-semibold text-foreground">
                  Departure Time *
                </Label>
                <Input
                  id="dep-time"
                  placeholder="e.g. 09:30 AM"
                  value={newSchedule.departureTime}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({ ...prev, departureTime: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arr-time" className="text-xs font-semibold text-foreground">
                  Arrival Time *
                </Label>
                <Input
                  id="arr-time"
                  placeholder="e.g. 11:15 AM"
                  value={newSchedule.arrivalTime}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({ ...prev, arrivalTime: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Assigned Vessel *
                </Label>
                <ReusableSelect
                  value={newSchedule.vesselName}
                  onValueChange={(val) => setNewSchedule((prev) => ({ ...prev, vesselName: val }))}
                  options={VESSEL_OPTIONS}
                  placeholder="Select vessel"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Assigned Route *
                </Label>
                <ReusableSelect
                  value={newSchedule.routeName}
                  onValueChange={(val) => setNewSchedule((prev) => ({ ...prev, routeName: val }))}
                  options={ROUTE_OPTIONS}
                  placeholder="Select route"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gate" className="text-xs font-semibold text-foreground">
                  Gate / Pier *
                </Label>
                <Input
                  id="gate"
                  placeholder="e.g. Pier 4 - Gate A"
                  value={newSchedule.gatePier}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({ ...prev, gatePier: e.target.value }))
                  }
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captain" className="text-xs font-semibold text-foreground">
                  Duty Captain *
                </Label>
                <Input
                  id="captain"
                  placeholder="e.g. Capt. Mark Kealoha"
                  value={newSchedule.captain}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({ ...prev, captain: e.target.value }))
                  }
                  className="text-xs h-9"
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
                Publish Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal with expanded width */}
      <Dialog open={!!editingSchedule} onOpenChange={(open) => !open && setEditingSchedule(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Trip Schedule
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update departure timing, assigned ferry, route, or trip status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateSchedule} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dep-time" className="text-xs font-semibold text-foreground">
                  Departure Time *
                </Label>
                <Input
                  id="edit-dep-time"
                  value={editForm.departureTime}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, departureTime: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-arr-time" className="text-xs font-semibold text-foreground">
                  Arrival Time *
                </Label>
                <Input
                  id="edit-arr-time"
                  value={editForm.arrivalTime}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, arrivalTime: e.target.value }))
                  }
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Assigned Vessel *
                </Label>
                <ReusableSelect
                  value={editForm.vesselName}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, vesselName: val }))}
                  options={VESSEL_OPTIONS}
                  placeholder="Select vessel"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Assigned Route *
                </Label>
                <ReusableSelect
                  value={editForm.routeName}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, routeName: val }))}
                  options={ROUTE_OPTIONS}
                  placeholder="Select route"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Trip Status *
                </Label>
                <ReusableSelect
                  value={editForm.status}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: val as ProviderScheduleItem["status"]
                    }))
                  }
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-gate" className="text-xs font-semibold text-foreground">
                  Gate / Pier
                </Label>
                <Input
                  id="edit-gate"
                  value={editForm.gatePier}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, gatePier: e.target.value }))
                  }
                  className="text-xs h-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingSchedule(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                Save Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
