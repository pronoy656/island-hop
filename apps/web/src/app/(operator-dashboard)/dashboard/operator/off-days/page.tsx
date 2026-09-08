"use client";

import * as React from "react";
import {
  CalendarX,
  Edit,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { PROVIDER_MOCK_DATA, type ProviderOffDayItem } from "@/data";
import {
  Button,
  DatePicker,
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

export default function OperatorOffDaysPage() {
  const [offDays, setOffDays] = React.useState<ProviderOffDayItem[]>(PROVIDER_MOCK_DATA.offDays);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingOffDay, setEditingOffDay] = React.useState<ProviderOffDayItem | null>(null);

  const [newOffDay, setNewOffDay] = React.useState({
    date: "2026-09-30",
    title: "",
    reason: "Scheduled Maintenance" as ProviderOffDayItem["reason"],
    affectedVessel: "Ocean Voyager I",
    affectedRoute: "Honolulu ⇄ Maui"
  });

  const [editForm, setEditForm] = React.useState({
    date: "2026-09-30",
    title: "",
    reason: "Scheduled Maintenance" as ProviderOffDayItem["reason"],
    affectedVessel: "Ocean Voyager I",
    affectedRoute: "Honolulu ⇄ Maui"
  });

  const handleAddOffDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffDay.title || !newOffDay.date) {
      toast.error("Please enter a title and date for the off-day.");
      return;
    }

    const created: ProviderOffDayItem = {
      id: `OFF-${Date.now().toString().slice(-4)}`,
      date: newOffDay.date,
      title: newOffDay.title,
      reason: newOffDay.reason,
      affectedVessel: newOffDay.affectedVessel,
      affectedRoute: newOffDay.affectedRoute,
      status: "Confirmed"
    };

    setOffDays((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    toast.success(`Off-day "${created.title}" scheduled for ${created.date}!`);
  };

  const handleOpenEdit = (offDay: ProviderOffDayItem) => {
    setEditingOffDay(offDay);
    setEditForm({
      date: offDay.date,
      title: offDay.title,
      reason: offDay.reason,
      affectedVessel: offDay.affectedVessel || "Ocean Voyager I",
      affectedRoute: offDay.affectedRoute || "Honolulu ⇄ Maui"
    });
  };

  const handleUpdateOffDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffDay) return;

    setOffDays((prev) =>
      prev.map((item) =>
        item.id === editingOffDay.id
          ? {
              ...item,
              date: editForm.date,
              title: editForm.title,
              reason: editForm.reason,
              affectedVessel: editForm.affectedVessel,
              affectedRoute: editForm.affectedRoute
            }
          : item
      )
    );

    setEditingOffDay(null);
    toast.success(`Off-day "${editForm.title}" updated successfully!`);
  };

  const offDayColumns: TableColumn<ProviderOffDayItem>[] = [
    {
      header: "DATE",
      accessorKey: "date",
      className: "font-mono font-bold text-foreground text-xs"
    },
    {
      header: "EVENT / REASON",
      accessorKey: "title",
      className: "font-semibold text-foreground"
    },
    {
      header: "CATEGORY",
      accessorKey: "reason",
      className: "text-muted-foreground text-xs"
    },
    {
      header: "AFFECTED VESSEL",
      accessorKey: "affectedVessel",
      className: "text-foreground font-medium text-xs"
    },
    {
      header: "AFFECTED ROUTE",
      accessorKey: "affectedRoute",
      className: "text-muted-foreground text-xs"
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
            title="Edit Off-Day"
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
            Off Days & Maintenance
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Block booking slots for vessel dry-docking, public holidays, or scheduled port maintenance.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Schedule Off Day
        </Button>
      </div>

      {/* Off Days Table */}
      <DashboardTableCard
        title="Scheduled Fleet Off-Days"
        columns={offDayColumns}
        data={offDays}
        keyExtractor={(item) => item.id}
      />

      {/* Add Off Day Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CalendarX className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Schedule Fleet Off-Day
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Declare a blackout date for maintenance or public holidays.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddOffDay} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="off-date" className="text-xs font-semibold text-foreground">
                  Off-Day Date *
                </Label>
                <DatePicker
                  id="off-date"
                  value={newOffDay.date}
                  onChange={(val) => setNewOffDay((prev) => ({ ...prev, date: val }))}
                  placeholder="Select off-day date"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Category *
                </Label>
                <ReusableSelect
                  value={newOffDay.reason}
                  onValueChange={(val) =>
                    setNewOffDay((prev) => ({
                      ...prev,
                      reason: val as ProviderOffDayItem["reason"]
                    }))
                  }
                  options={[
                    { value: "Scheduled Maintenance", label: "Scheduled Maintenance" },
                    { value: "Public Holiday", label: "Public Holiday" },
                    { value: "Weather Warning", label: "Weather Warning" },
                    { value: "Charter Event", label: "Private Charter Event" }
                  ]}
                  placeholder="Select category"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="off-title" className="text-xs font-semibold text-foreground">
                  Description / Title *
                </Label>
                <Input
                  id="off-title"
                  placeholder="e.g. Engine Overhaul & Propeller Servicing"
                  value={newOffDay.title}
                  onChange={(e) => setNewOffDay((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Affected Vessel
                </Label>
                <ReusableSelect
                  value={newOffDay.affectedVessel}
                  onValueChange={(val) =>
                    setNewOffDay((prev) => ({ ...prev, affectedVessel: val }))
                  }
                  options={[
                    { value: "All Vessels", label: "All Fleet Vessels" },
                    { value: "Ocean Voyager I", label: "Ocean Voyager I" },
                    { value: "Pacific Wave Runner", label: "Pacific Wave Runner" },
                    { value: "Island Hopper III", label: "Island Hopper III" }
                  ]}
                  placeholder="Select vessel"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Affected Route
                </Label>
                <ReusableSelect
                  value={newOffDay.affectedRoute}
                  onValueChange={(val) =>
                    setNewOffDay((prev) => ({ ...prev, affectedRoute: val }))
                  }
                  options={[
                    { value: "All Inter-Island Routes", label: "All Inter-Island Routes" },
                    { value: "Honolulu ⇄ Maui", label: "Honolulu ⇄ Maui" },
                    { value: "Honolulu ⇄ Lanai", label: "Honolulu ⇄ Lanai" },
                    { value: "Honolulu ⇄ Molokai", label: "Honolulu ⇄ Molokai" }
                  ]}
                  placeholder="Select route"
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
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
              >
                Save Off-Day
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Off Day Modal */}
      <Dialog open={!!editingOffDay} onOpenChange={(open) => !open && setEditingOffDay(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Fleet Off-Day
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update blackout schedule details for maintenance or holidays.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateOffDay} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-off-date" className="text-xs font-semibold text-foreground">
                  Off-Day Date *
                </Label>
                <DatePicker
                  id="edit-off-date"
                  value={editForm.date}
                  onChange={(val) => setEditForm((prev) => ({ ...prev, date: val }))}
                  placeholder="Select off-day date"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Category *
                </Label>
                <ReusableSelect
                  value={editForm.reason}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({
                      ...prev,
                      reason: val as ProviderOffDayItem["reason"]
                    }))
                  }
                  options={[
                    { value: "Scheduled Maintenance", label: "Scheduled Maintenance" },
                    { value: "Public Holiday", label: "Public Holiday" },
                    { value: "Weather Warning", label: "Weather Warning" },
                    { value: "Charter Event", label: "Private Charter Event" }
                  ]}
                  placeholder="Select category"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="edit-off-title" className="text-xs font-semibold text-foreground">
                  Description / Title *
                </Label>
                <Input
                  id="edit-off-title"
                  placeholder="e.g. Engine Overhaul & Propeller Servicing"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Affected Vessel
                </Label>
                <ReusableSelect
                  value={editForm.affectedVessel}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({ ...prev, affectedVessel: val }))
                  }
                  options={[
                    { value: "All Vessels", label: "All Fleet Vessels" },
                    { value: "Ocean Voyager I", label: "Ocean Voyager I" },
                    { value: "Pacific Wave Runner", label: "Pacific Wave Runner" },
                    { value: "Island Hopper III", label: "Island Hopper III" }
                  ]}
                  placeholder="Select vessel"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Affected Route
                </Label>
                <ReusableSelect
                  value={editForm.affectedRoute}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({ ...prev, affectedRoute: val }))
                  }
                  options={[
                    { value: "All Inter-Island Routes", label: "All Inter-Island Routes" },
                    { value: "Honolulu ⇄ Maui", label: "Honolulu ⇄ Maui" },
                    { value: "Honolulu ⇄ Lanai", label: "Honolulu ⇄ Lanai" },
                    { value: "Honolulu ⇄ Molokai", label: "Honolulu ⇄ Molokai" }
                  ]}
                  placeholder="Select route"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingOffDay(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
              >
                Update Off-Day
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
