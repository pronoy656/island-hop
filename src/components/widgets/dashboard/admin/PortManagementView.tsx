"use client";

import * as React from "react";
import {
  AlertTriangle,
  Anchor,
  Check,
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
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";

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
  Tabs,
  TabsList,
  TabsTrigger
} from "@/ui";
import { DashboardTableCard, StatusBadge, TablePagination, TableToolbar, type TableColumn } from "@/widgets";

const STATUS_SELECT_OPTIONS = [
  { value: "ACTIVE", label: "Active (Operational)" },
  { value: "INACTIVE", label: "Inactive (Closed)" }
];

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

export function PortManagementView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(["all", "active", "inactive"] as const).withDefault("all")
  );

  // Pagination states synced to URL query (?page=2&pageSize=10)
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  // Bulk selection & action states
  const [selectedPortIds, setSelectedPortIds] = React.useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = React.useState(false);
  const [bulkActionType, setBulkActionType] = React.useState<
    "activate" | "deactivate" | "delete" | null
  >(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);

  // Dialog States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPort, setEditingPort] = React.useState<IPort | null>(null);
  const [deletingPort, setDeletingPort] = React.useState<IPort | null>(null);

  // Form Fields
  const [formName, setFormName] = React.useState("");
  const [formStatus, setFormStatus] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errorText, setErrorText] = React.useState("");

  // Data Fetching
  const { data, isLoading, refetch, isFetching } = useAdminPortsQuery({ limit: 100 });
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

  // Reset page & selection whenever search, filter, or page size changes (skip on mount to preserve URL page)
  const isFirstMount = React.useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    void setPage(1);
    setSelectedPortIds(new Set());
  }, [debouncedSearch, activeTab, pageSize, setPage]);

  // Pagination calculations
  const totalFiltered = filteredPorts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Keep page clamped if items are deleted or filter changes (guarded: wait until data finishes loading)
  React.useEffect(() => {
    if (!isLoading && !isFetching && data && page > totalPages && totalPages > 0) {
      void setPage(totalPages);
    }
  }, [page, totalPages, isLoading, isFetching, data, setPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedPorts = React.useMemo(() => {
    return filteredPorts.slice(startIndex, endIndex);
  }, [filteredPorts, startIndex, endIndex]);

  // Selection Computations
  const displayedPortIds = React.useMemo(
    () => paginatedPorts.map((p) => p.id),
    [paginatedPorts]
  );
  const isAllCurrentPageSelected =
    paginatedPorts.length > 0 && paginatedPorts.every((p) => selectedPortIds.has(p.id));
  const isSomeCurrentPageSelected =
    paginatedPorts.some((p) => selectedPortIds.has(p.id)) && !isAllCurrentPageSelected;
  const selectedCount = selectedPortIds.size;

  const toggleSelectAllCurrentPage = () => {
    setSelectedPortIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        displayedPortIds.forEach((id) => next.delete(id));
      } else {
        displayedPortIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectAllAcrossPages = () => {
    const allIds = filteredPorts.map((p) => p.id);
    setSelectedPortIds(new Set(allIds));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedPortIds((prev) => {
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
    setSelectedPortIds(new Set());
  };

  // Bulk Handlers
  const handleBulkActivate = async () => {
    if (selectedPortIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedPortIds);
    setIsBulkOperating(true);
    setBulkActionType("activate");

    const toastId = toast.loading(
      `Activating ${ids.length} ${ids.length === 1 ? "port" : "ports"}...`
    );

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      const targetPort = ports.find((p) => p.id === id);
      try {
        await updateMutation.mutateAsync({
          id,
          payload: {
            name: targetPort?.name ?? "",
            isActive: true
          }
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetch();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setSelectedPortIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully activated all ${successCount} ports!`, { id: toastId });
    } else {
      toast.warning(`Activated ${successCount} ports (${failCount} failed)`, { id: toastId });
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedPortIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedPortIds);
    setIsBulkOperating(true);
    setBulkActionType("deactivate");

    const toastId = toast.loading(
      `Deactivating ${ids.length} ${ids.length === 1 ? "port" : "ports"}...`
    );

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      const targetPort = ports.find((p) => p.id === id);
      try {
        await updateMutation.mutateAsync({
          id,
          payload: {
            name: targetPort?.name ?? "",
            isActive: false
          }
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetch();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setSelectedPortIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully deactivated all ${successCount} ports!`, { id: toastId });
    } else {
      toast.warning(`Deactivated ${successCount} ports (${failCount} failed)`, { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPortIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedPortIds);
    setIsBulkOperating(true);
    setBulkActionType("delete");

    const toastId = toast.loading(
      `Deleting ${ids.length} ${ids.length === 1 ? "port" : "ports"}...`
    );

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

    await refetch();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setIsBulkDeleteModalOpen(false);
    setSelectedPortIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully deleted ${successCount} ports!`, { id: toastId });
    } else {
      toast.warning(`Deleted ${successCount} ports (${failCount} failed)`, { id: toastId });
    }
  };

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
            aria-label="Select all ports on current page"
          />
        </div>
      ),
      headerClassName: "w-10 px-3 text-center",
      className: "w-10 px-3 text-center",
      align: "center",
      cell: (item) => {
        const isChecked = selectedPortIds.has(item.id);
        return (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggleSelectRow(item.id)}
              aria-label={`Select port ${item.name}`}
            />
          </div>
        );
      }
    },
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
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 self-start sm:self-auto h-9 text-xs font-semibold px-3.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Port</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Terminals</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{totalCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Anchor className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Operational (Active)</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {activeCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Suspended (Closed)</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {inactiveCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reusable Search & Status Toolbar */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search ports by name..."
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { value: "all", label: "All", count: totalCount },
          { value: "active", label: "Active", count: activeCount },
          { value: "inactive", label: "Inactive", count: inactiveCount }
        ]}
      />

      {/* Table & Bulk Actions */}
      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-border/80 bg-card p-6 shadow-xs animate-pulse">
          <div className="h-5 w-40 rounded bg-muted mb-4" />
          <div className="h-10 w-full rounded bg-muted/60" />
          <div className="h-10 w-full rounded bg-muted/40" />
          <div className="h-10 w-full rounded bg-muted/60" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bulk Action Sticky / Floating Toolbar */}
          {selectedCount > 0 && (
            <div className="bg-card/95 dark:bg-card/90 border-blue-500/30 sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white shadow-2xs">
                  {selectedCount}
                </span>
                <span className="text-foreground text-xs font-semibold">
                  {selectedCount === 1 ? "port selected" : "ports selected"}
                </span>

                {paginatedPorts.length > 0 &&
                  isAllCurrentPageSelected &&
                  totalFiltered > paginatedPorts.length &&
                  selectedCount < totalFiltered && (
                    <button
                      type="button"
                      onClick={toggleSelectAllAcrossPages}
                      className="ml-2 cursor-pointer text-xs font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                    >
                      Select all {totalFiltered} ports across all pages
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
                  title="Activate selected ports"
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
                  title="Deactivate / Suspend selected ports"
                >
                  {isBulkOperating && bulkActionType === "deactivate" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  <span>Suspend</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="h-8 cursor-pointer gap-1.5 bg-rose-600 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700"
                  title="Delete selected ports"
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
                  title="Deselect all ports"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Deselect</span>
                </Button>
              </div>
            </div>
          )}

          <DashboardTableCard
            title={
              searchTerm || activeTab !== "all"
                ? "Filtered Ports"
                : "All Ports"
            }
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
            columns={columns}
            data={paginatedPorts}
            keyExtractor={(item) => item.id}
            rowClassName={(item) =>
              selectedPortIds.has(item.id)
                ? "bg-blue-500/10 hover:bg-blue-500/15 dark:bg-blue-950/30 dark:hover:bg-blue-950/40 border-l-2 border-l-blue-600 dark:border-l-blue-400"
                : undefined
            }
            emptyMessage={
              searchTerm || activeTab !== "all"
                ? "No ports found matching your search."
                : "No ports registered yet. Click 'Add Port' to create one."
            }
          />

          {/* Reusable Pagination Controls */}
          <TablePagination
            page={currentPage}
            totalPages={totalPages}
            totalCount={totalFiltered}
            pageSize={pageSize}
            onPageChange={(newPage) => void setPage(newPage)}
            onPageSizeChange={(newSize) => {
              void setPageSize(newSize);
              void setPage(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemName="ports"
            isLoading={isFetching}
          />
        </div>
      )}

      {/* ─── ADD / EDIT DIALOG ────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-foreground flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue-600" />
              <span>{editingPort ? "Edit Port" : "Add New Port"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingPort
                ? "Update port title and operational state."
                : "Register a new terminal or harbor destination into the network."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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

      {/* ─── SINGLE DELETE CONFIRMATION DIALOG ─────────────────────────────── */}
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

      {/* ─── BULK DELETE CONFIRMATION MODAL ───────────────────────────────── */}
      <Dialog
        open={isBulkDeleteModalOpen}
        onOpenChange={(open) => !open && !isBulkOperating && setIsBulkDeleteModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-base font-bold">
                  Delete {selectedCount} {selectedCount === 1 ? "Port" : "Ports"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to permanently delete {selectedCount} selected ports? This may affect routes that originate or terminate at these ports.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkOperating}
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isBulkOperating}
              onClick={handleBulkDelete}
              className="bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {isBulkOperating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Deleting {selectedCount} Ports...
                </>
              ) : (
                `Delete ${selectedCount} ${selectedCount === 1 ? "Port" : "Ports"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
