"use client";

import * as React from "react";
import {
  AlertTriangle,
  Anchor,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminPortsQuery,
  useCreatePortMutation,
  useDeletePortMutation,
  useUpdatePortMutation
} from "@/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { IPort } from "@/types";
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

const STATUS_SELECT_OPTIONS = [
  { value: "ACTIVE", label: "Active (Operational)" },
  { value: "INACTIVE", label: "Inactive (Closed)" }
];

const PAGE_SIZE_OPTIONS = [
  { value: "5", label: "5 per page" },
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

export function PortManagementView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "inactive">("all");

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Dialog States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPort, setEditingPort] = React.useState<IPort | null>(null);
  const [deletingPort, setDeletingPort] = React.useState<IPort | null>(null);

  // Form Fields
  const [formName, setFormName] = React.useState("");
  const [formStatus, setFormStatus] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errorText, setErrorText] = React.useState("");

  // Data Fetching
  const { data, isLoading, refetch } = useAdminPortsQuery({ limit: 100 });
  const createMutation = useCreatePortMutation();
  const updateMutation = useUpdatePortMutation();
  const deleteMutation = useDeletePortMutation();

  const ports: IPort[] = React.useMemo(() => {
    return Array.isArray(data?.data) ? data.data : [];
  }, [data]);

  // Counts
  const totalCount = ports.length;
  const activeCount = ports.filter((p) => p.isActive).length;
  const inactiveCount = totalCount - activeCount;

  // Filtered Ports
  const filteredPorts = React.useMemo(() => {
    return ports.filter((port) => {
      if (activeTab === "active" && !port.isActive) return false;
      if (activeTab === "inactive" && port.isActive) return false;

      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        return port.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [ports, activeTab, debouncedSearch]);

  // Reset page whenever search, filter, or page size changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, pageSize]);

  // Pagination calculations
  const totalFiltered = filteredPorts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Keep page clamped if items are deleted or filter changes
  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedPorts = React.useMemo(() => {
    return filteredPorts.slice(startIndex, endIndex);
  }, [filteredPorts, startIndex, endIndex]);

  const pageNumbers = React.useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  // Open Modal for Create
  const handleOpenAdd = () => {
    setEditingPort(null);
    setFormName("");
    setFormStatus("ACTIVE");
    setErrorText("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (port: IPort) => {
    setEditingPort(port);
    setFormName(port.name);
    setFormStatus(port.isActive ? "ACTIVE" : "INACTIVE");
    setErrorText("");
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorText("Port name is required");
      return;
    }

    const payload = {
      name: formName.trim(),
      isActive: formStatus === "ACTIVE"
    };

    try {
      if (editingPort) {
        await updateMutation.mutateAsync({
          id: editingPort.id,
          payload
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
      refetch();
    } catch {
      // Error handled by mutation hook
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deletingPort) return;
    try {
      await deleteMutation.mutateAsync(deletingPort.id);
      setDeletingPort(null);
      refetch();
    } catch {
      // Error handled by mutation hook
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Table Columns
  const columns: TableColumn<IPort>[] = [
    {
      header: "PORT NAME",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Anchor className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground text-xs sm:text-sm">
            {item.name}
          </span>
        </div>
      )
    },

    {
      header: "STATUS",
      cell: (item) => (
        <StatusBadge status={item.isActive ? "Active" : "Suspended"} />
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
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="h-8 px-2.5 text-xs gap-1 text-foreground"
          >
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingPort(item)}
            className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ports
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Manage ferry terminals, harbors, and docking stations ({totalCount} ports total).
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="h-9 text-xs flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 shadow-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Port</span>
        </Button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Ports</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalCount} {totalCount === 1 ? "Port" : "Ports"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Master harbor & terminal hubs</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Anchor className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Operational</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeCount} Active
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {inactiveCount > 0 ? `${inactiveCount} currently closed` : "All ports open for docking"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Inactive Ports</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {inactiveCount} {inactiveCount === 1 ? "Port" : "Ports"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Suspended or inactive</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clean Search & Status Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ports by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9 text-xs bg-background"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "all" | "active" | "inactive")}
          className="w-auto"
        >
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs">
              Inactive ({inactiveCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-border/80 bg-card p-6 shadow-xs animate-pulse">
          <div className="h-5 w-40 rounded bg-muted mb-4" />
          <div className="h-10 w-full rounded bg-muted/60" />
          <div className="h-10 w-full rounded bg-muted/40" />
          <div className="h-10 w-full rounded bg-muted/60" />
        </div>
      ) : (
        <div className="space-y-3">
          <DashboardTableCard
            title={
              searchTerm || activeTab !== "all"
                ? `Filtered Ports (${totalFiltered})`
                : `All Ports (${totalCount})`
            }
            columns={columns}
            data={paginatedPorts}
            keyExtractor={(item) => item.id}
            emptyMessage={
              searchTerm || activeTab !== "all"
                ? "No ports found matching your search."
                : "No ports registered yet. Click 'Add Port' to create one."
            }
          />

          {/* Pagination Controls */}
          {totalFiltered > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-card p-3 sm:px-4 rounded-xl border border-border/80 shadow-xs">
              {/* Left: Showing entries info & Page size selector */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground w-full sm:w-auto justify-between sm:justify-start">
                <span>
                  Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalFiltered}</span> ports
                </span>

                <div className="flex items-center gap-1.5 pl-0 sm:pl-3 sm:border-l sm:border-border/60">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">Show:</span>
                  <ReusableSelect
                    value={String(pageSize)}
                    onValueChange={(val) => setPageSize(Number(val))}
                    options={PAGE_SIZE_OPTIONS}
                    className="h-8 text-xs w-[115px]"
                  />
                </div>
              </div>

              {/* Right: Page Navigation Buttons */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 px-2.5 text-xs flex items-center gap-1 font-medium"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((p, idx) =>
                    typeof p === "number" ? (
                      <Button
                        key={p}
                        variant={currentPage === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className={cn(
                          "h-8 min-w-8 px-2 text-xs font-semibold",
                          currentPage === p
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {p}
                      </Button>
                    ) : (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-xs font-bold text-muted-foreground select-none"
                      >
                        ...
                      </span>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-2.5 text-xs flex items-center gap-1 font-medium"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ADD / EDIT DIALOG ────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPort ? "Edit Port" : "Add New Port"}
            </DialogTitle>
            <DialogDescription>
              {editingPort
                ? "Update port details and operational status."
                : "Register a new port or ferry terminal."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="port-name" className="text-xs font-semibold">
                Port Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="port-name"
                placeholder="e.g. Malé Terminal"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (errorText) setErrorText("");
                }}
                className="h-9 text-xs"
              />
              {errorText && (
                <p className="text-[11px] font-medium text-rose-500">{errorText}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <ReusableSelect
                value={formStatus}
                onValueChange={(val) => setFormStatus(val as "ACTIVE" | "INACTIVE")}
                options={STATUS_SELECT_OPTIONS}
                className="h-9 text-xs w-full"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingPort ? "Save Changes" : "Create Port"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRMATION DIALOG ────────────────────────────────────── */}
      <Dialog open={!!deletingPort} onOpenChange={(open) => !open && setDeletingPort(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-rose-600 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete Port</span>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-xs space-y-3 pt-1 text-muted-foreground">
                <p>
                  Are you sure you want to delete{" "}
                  <strong className="text-foreground">{deletingPort?.name}</strong>?
                </p>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Route & History Safety Notice</span>
                  </p>
                  <p className="leading-relaxed">
                    If this port is linked to active routes or past bookings, it cannot be wiped completely. Instead, the system will safely <strong>deactivate (Suspend)</strong> it to keep route schedules and tickets intact.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingPort(null)}
              disabled={deleteMutation.isPending}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              className="h-9 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 gap-1.5"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
