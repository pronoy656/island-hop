"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Loader2,
  Navigation,
  Plus,
  RefreshCw,
  Ship,
  Ticket,
  Trash2,
  Users,
  X
} from "lucide-react";
import { addMinutes, format, isValid, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import type { IOperatorSchedule, OperatorScheduleStatus } from "@/types";
import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useFerriesQuery,
  useOperatorSchedulesQuery,
  useRoutesQuery,
  useUpdateScheduleMutation,
  useUpdateScheduleStatusMutation
} from "@/hooks";
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
import { DashboardTableCard, StatusBadge, TablePagination, type TableColumn } from "@/widgets";

const STATUS_OPTIONS: { value: OperatorScheduleStatus; label: string }[] = [
  { value: "ON_TIME", label: "On Time / Scheduled" },
  { value: "BOARDING", label: "Boarding" },
  { value: "DEPARTED", label: "Departed" },
  { value: "DELAYED", label: "Delayed" },
  { value: "ARRIVED", label: "Arrived / Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

export default function OperatorSchedulesPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [routeFilter, setRouteFilter] = React.useState<string>("ALL");
  const [dateFilter, setDateFilter] = React.useState<string>("");

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Bulk selection & action states
  const [selectedScheduleIds, setSelectedScheduleIds] = React.useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = React.useState(false);
  const [bulkActionType, setBulkActionType] = React.useState<
    "on_time" | "boarding" | "departed" | "delayed" | "arrived" | "cancelled" | "delete" | null
  >(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);

  // Reset page whenever tab, route, date, or page size changes (guarded against initial mount)
  const isFirstMount = React.useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
    setSelectedScheduleIds(new Set());
  }, [activeTab, routeFilter, dateFilter, pageSize]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState<IOperatorSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = React.useState<IOperatorSchedule | null>(null);

  // 1. Queries
  const {
    data: scheduleData,
    isLoading: isSchedulesLoading,
    isError: isSchedulesError,
    error: schedulesError,
    refetch: refetchSchedules,
    isFetching: isSchedulesFetching
  } = useOperatorSchedulesQuery({
    status: activeTab === "all" ? undefined : activeTab,
    routeId: routeFilter === "ALL" ? undefined : routeFilter,
    date: dateFilter || undefined,
    page,
    limit: pageSize
  });

  const { data: routesData, isLoading: isRoutesLoading } = useRoutesQuery({ limit: 100 });
  const { data: ferriesData, isLoading: isFerriesLoading } = useFerriesQuery({ limit: 100 });

  // 2. Mutations
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const updateStatusMutation = useUpdateScheduleStatusMutation();
  const deleteScheduleMutation = useDeleteScheduleMutation();

  // Local schedules state for optimistic updates
  const [localSchedules, setLocalSchedules] = React.useState<IOperatorSchedule[]>([]);

  React.useEffect(() => {
    if (scheduleData?.schedules) {
      setLocalSchedules(scheduleData.schedules);
    }
  }, [scheduleData?.schedules]);

  const rawSchedules = localSchedules.length > 0 ? localSchedules : (scheduleData?.schedules ?? []);

  // Pagination calculations
  const meta = scheduleData?.meta;
  const totalCount = meta?.total ?? rawSchedules.length;
  const totalPages = Math.max(1, meta?.totalPages ?? Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Sliced schedules for resilience in case backend returns all items
  const displayedSchedules = React.useMemo(() => {
    if (rawSchedules.length > pageSize) {
      const start = (currentPage - 1) * pageSize;
      return rawSchedules.slice(start, start + pageSize);
    }
    return rawSchedules;
  }, [rawSchedules, currentPage, pageSize]);

  const schedules = displayedSchedules;

  // Keep page clamped ONLY when query has settled and is not in flight
  React.useEffect(() => {
    if (!isSchedulesLoading && !isSchedulesFetching && scheduleData && page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages, isSchedulesLoading, isSchedulesFetching, scheduleData]);

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

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

  // Dropdown options
  const routeOptions = React.useMemo(() => {
    const list = routesData?.routes ?? [];
    return list.map((r) => ({
      value: r.id,
      label: `${r.departurePort?.name ?? "Origin"} ➔ ${r.destinationPort?.name ?? "Dest"} • ${r.durationMinutes} mins trip`
    }));
  }, [routesData?.routes]);

  const ferryOptions = React.useMemo(() => {
    const list = ferriesData?.ferries ?? [];
    return list
      .filter((f) => {
        const normalized = (f.status || "").toUpperCase();
        return normalized === "IN_SERVICE" || normalized === "IN SERVICE";
      })
      .map((f) => {
        const typeLabel = f.type ? f.type.replace("_", " ") : "Ferry";
        return {
          value: f.id,
          label: `${f.name} • ${f.capacity} Seats (${typeLabel})`
        };
      });
  }, [ferriesData?.ferries]);

  // Form State for Adding New Schedule
  const [newForm, setNewForm] = React.useState({
    routeId: "",
    ferryId: "",
    departureDateTime: "",
    arrivalDateTime: "",
    adultFare: "25",
    childFare: "15"
  });

  // Selected route and ferry references for real-world contextual preview
  const selectedRoute = React.useMemo(() => {
    return (routesData?.routes ?? []).find((r) => r.id === newForm.routeId);
  }, [routesData?.routes, newForm.routeId]);

  const selectedFerry = React.useMemo(() => {
    return (ferriesData?.ferries ?? []).find((f) => f.id === newForm.ferryId);
  }, [ferriesData?.ferries, newForm.ferryId]);

  const handleOpenAddModal = React.useCallback(() => {
    setNewForm({
      routeId: "",
      ferryId: "",
      departureDateTime: "",
      arrivalDateTime: "",
      adultFare: "25",
      childFare: "15"
    });
    setIsAddModalOpen(true);
  }, []);

  const handleDepartureChange = (val: string) => {
    setNewForm((prev) => {
      let arrivalDateTime = prev.arrivalDateTime;
      if (val && prev.routeId) {
        const route = (routesData?.routes ?? []).find((r) => r.id === prev.routeId);
        if (route?.durationMinutes) {
          try {
            const dep = parseISO(val);
            if (isValid(dep)) {
              const arr = addMinutes(dep, route.durationMinutes);
              arrivalDateTime = format(arr, "yyyy-MM-dd'T'HH:mm");
            }
          } catch {
            // fallback
          }
        }
      }
      return { ...prev, departureDateTime: val, arrivalDateTime };
    });
  };

  const handleRouteChange = (val: string) => {
    setNewForm((prev) => {
      let arrivalDateTime = prev.arrivalDateTime;
      let adultFare = prev.adultFare;
      if (val) {
        const route = (routesData?.routes ?? []).find((r) => r.id === val);
        if (route?.basePrice) {
          adultFare = String(route.basePrice);
        }
        if (route?.durationMinutes && prev.departureDateTime) {
          try {
            const dep = parseISO(prev.departureDateTime);
            if (isValid(dep)) {
              const arr = addMinutes(dep, route.durationMinutes);
              arrivalDateTime = format(arr, "yyyy-MM-dd'T'HH:mm");
            }
          } catch {
            // fallback
          }
        }
      }
      return { ...prev, routeId: val, arrivalDateTime, adultFare };
    });
  };

  // Edit Form State
  const [editForm, setEditForm] = React.useState({
    departureDateTime: "",
    arrivalDateTime: "",
    adultFare: "25",
    childFare: "15",
    status: "ON_TIME" as OperatorScheduleStatus
  });

  const handleOpenEdit = (schedule: IOperatorSchedule) => {
    setEditingSchedule(schedule);
    try {
      const dep = parseISO(schedule.departureTime);
      const arr = parseISO(schedule.arrivalTime);
      setEditForm({
        departureDateTime: isValid(dep) ? format(dep, "yyyy-MM-dd'T'HH:mm") : "",
        arrivalDateTime: isValid(arr) ? format(arr, "yyyy-MM-dd'T'HH:mm") : "",
        adultFare: String(schedule.adultFare),
        childFare: schedule.childFare != null ? String(schedule.childFare) : "",
        status: schedule.status
      });
    } catch {
      // fallback
    }
  };

  const handleEditDepartureChange = (val: string) => {
    setEditForm((prev) => {
      let arrivalDateTime = prev.arrivalDateTime;
      const durationMinutes = editingSchedule?.route?.durationMinutes;
      if (val && durationMinutes) {
        try {
          const dep = parseISO(val);
          if (isValid(dep)) {
            const arr = addMinutes(dep, durationMinutes);
            arrivalDateTime = format(arr, "yyyy-MM-dd'T'HH:mm");
          }
        } catch {
          // fallback
        }
      }
      return { ...prev, departureDateTime: val, arrivalDateTime };
    });
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.routeId) {
      toast.error("Please select a route.");
      return;
    }
    if (!newForm.ferryId) {
      toast.error("Please assign a ferry for this schedule.");
      return;
    }
    const assignedFerry = (ferriesData?.ferries ?? []).find((f) => f.id === newForm.ferryId);
    const normalizedFerryStatus = (assignedFerry?.status || "").toUpperCase();
    if (
      !assignedFerry ||
      (normalizedFerryStatus !== "IN_SERVICE" && normalizedFerryStatus !== "IN SERVICE")
    ) {
      toast.error("Only ferries currently In Service can be assigned to a schedule.");
      return;
    }
    if (!newForm.departureDateTime || !newForm.arrivalDateTime) {
      toast.error("Please select departure and arrival times.");
      return;
    }

    const depDate = new Date(newForm.departureDateTime);
    const arrDate = new Date(newForm.arrivalDateTime);
    if (arrDate <= depDate) {
      toast.error("Arrival time must be later than departure time.");
      return;
    }

    try {
      await createScheduleMutation.mutateAsync({
        routeId: newForm.routeId,
        ferryId: newForm.ferryId,
        departureTime: depDate.toISOString(),
        arrivalTime: arrDate.toISOString(),
        adultFare: Number(newForm.adultFare) || 25,
        childFare: newForm.childFare ? Number(newForm.childFare) : undefined
      });
      setPage(1);
      setIsAddModalOpen(false);
    } catch {
      // mutation handles toast
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    try {
      const depDate = new Date(editForm.departureDateTime);
      const arrDate = new Date(editForm.arrivalDateTime);

      await updateScheduleMutation.mutateAsync({
        id: editingSchedule.id,
        payload: {
          departureTime: depDate.toISOString(),
          arrivalTime: arrDate.toISOString(),
          adultFare: Number(editForm.adultFare) || 25,
          childFare: editForm.childFare ? Number(editForm.childFare) : undefined
        }
      });

      if (editForm.status !== editingSchedule.status) {
        await updateStatusMutation.mutateAsync({
          id: editingSchedule.id,
          status: editForm.status
        });
      }

      setEditingSchedule(null);
    } catch {
      // mutation handles toast
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deletingSchedule) return;
    try {
      await deleteScheduleMutation.mutateAsync(deletingSchedule.id);
      setDeletingSchedule(null);
    } catch {
      // mutation handles toast
    }
  };

  // Quick live status change handler
  const handleQuickStatusChange = async (scheduleId: string, nextStatus: OperatorScheduleStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: scheduleId,
        status: nextStatus
      });
    } catch {
      // mutation handles toast
    }
  };

  // Selection Computations
  const displayedScheduleIds = React.useMemo(() => schedules.map((s) => s.id), [schedules]);
  const isAllCurrentPageSelected =
    schedules.length > 0 && schedules.every((s) => selectedScheduleIds.has(s.id));
  const isSomeCurrentPageSelected =
    schedules.some((s) => selectedScheduleIds.has(s.id)) && !isAllCurrentPageSelected;
  const selectedCount = selectedScheduleIds.size;

  const toggleSelectAllCurrentPage = () => {
    setSelectedScheduleIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        displayedScheduleIds.forEach((id) => next.delete(id));
      } else {
        displayedScheduleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedScheduleIds((prev: Set<string>) => {
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
    setSelectedScheduleIds(new Set());
  };

  // Bulk Handlers
  const handleBulkSetStatus = async (status: OperatorScheduleStatus) => {
    if (selectedScheduleIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedScheduleIds) as string[];
    setIsBulkOperating(true);
    setBulkActionType(status.toLowerCase() as any);

    const statusLabel = status.replace(/_/g, " ");
    const toastId = toast.loading(
      `Setting ${ids.length} ${ids.length === 1 ? "schedule" : "schedules"} to ${statusLabel}...`
    );

    setLocalSchedules((prev) =>
      prev.map((s) => (selectedScheduleIds.has(s.id) ? { ...s, status } : s))
    );

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        await updateStatusMutation.mutateAsync({
          id,
          status
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetchSchedules();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setSelectedScheduleIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully updated ${successCount} schedules to ${statusLabel}!`, {
        id: toastId
      });
    } else {
      toast.warning(`Updated ${successCount} schedules (${failCount} failed)`, { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedScheduleIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedScheduleIds) as string[];
    setIsBulkOperating(true);
    setBulkActionType("delete" as any);

    const toastId = toast.loading(
      `Deleting ${ids.length} ${ids.length === 1 ? "schedule" : "schedules"}...`
    );

    setLocalSchedules((prev) => prev.filter((s) => !selectedScheduleIds.has(s.id)));

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        await deleteScheduleMutation.mutateAsync(id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetchSchedules();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setIsBulkDeleteModalOpen(false);
    setSelectedScheduleIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully deleted ${successCount} schedules!`, {
        id: toastId
      });
    } else {
      toast.warning(`Deleted ${successCount} schedules (${failCount} failed)`, { id: toastId });
    }
  };

  // Stats calculation
  const totalTripsCount = totalCount;
  const boardingCount = schedules.filter((s) => s.status === "BOARDING").length;
  const onTimeCount = schedules.filter((s) => s.status === "ON_TIME").length;
  const departedCount = schedules.filter((s) => s.status === "DEPARTED").length;
  const delayedCount = schedules.filter((s) => s.status === "DELAYED").length;
  const arrivedCount = schedules.filter((s) => s.status === "ARRIVED").length;
  const cancelledCount = schedules.filter((s) => s.status === "CANCELLED").length;
  const totalBookingsCount = schedules.reduce((acc, s) => acc + (s._count?.bookings || 0), 0);

  const scheduleColumns: TableColumn<IOperatorSchedule>[] = [
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
            aria-label="Select all schedules on current page"
          />
        </div>
      ),
      headerClassName: "w-10 px-3 text-center",
      className: "w-10 px-3 text-center",
      align: "center",
      cell: (item) => {
        const isChecked = selectedScheduleIds.has(item.id);
        return (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggleSelectRow(item.id)}
              aria-label={`Select schedule ${item.id}`}
            />
          </div>
        );
      }
    },
    {
      header: "TRIP DATE & TIME",
      cell: (item) => {
        const dep = parseISO(item.departureTime);
        const valid = isValid(dep);
        return (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-foreground text-xs">
              {valid ? format(dep, "hh:mm a") : item.departureTime}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {valid ? format(dep, "dd MMM yyyy") : "—"}
            </span>
          </div>
        );
      }
    },
    {
      header: "ARRIVAL",
      cell: (item) => {
        const arr = parseISO(item.arrivalTime);
        const valid = isValid(arr);
        return (
          <div className="flex flex-col">
            <span className="font-mono font-medium text-foreground text-xs">
              {valid ? format(arr, "hh:mm a") : item.arrivalTime}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {item.route?.durationMinutes ? `${item.route.durationMinutes} mins trip` : "—"}
            </span>
          </div>
        );
      }
    },
    {
      header: "FERRY",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Ship className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-xs">{item.ferry?.name ?? "Ferry"}</div>
            <div className="text-[10px] text-muted-foreground">
              {item.ferry?.type ? item.ferry.type.replace("_", " ") : "Ferry"}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "ROUTE",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground text-xs flex items-center gap-1">
            <span>{item.route?.departurePort?.name ?? "Origin"}</span>
            <span className="text-muted-foreground">→</span>
            <span>{item.route?.destinationPort?.name ?? "Destination"}</span>
          </div>
          {item.route?.durationMinutes ? (
            <div className="text-[10px] text-muted-foreground">
              {item.route.durationMinutes} mins duration
            </div>
          ) : null}
        </div>
      )
    },
    {
      header: "TICKET PRICE",
      cell: (item) => (
        <div className="text-xs">
          <div className="font-bold text-foreground font-mono">${item.adultFare}</div>
          {item.childFare != null && (
            <div className="text-[10px] text-muted-foreground font-mono">
              Child: ${item.childFare}
            </div>
          )}
        </div>
      )
    },
    {
      header: "CAPACITY",
      className: "text-xs",
      cell: (item) => {
        const capacity = item.ferry?.capacity || 0;
        const booked =
          capacity > 0 && item.availableSeats != null
            ? Math.max(0, capacity - item.availableSeats)
            : (item._count?.bookings ?? 0);
        const pct = capacity > 0 ? Math.min(Math.round((booked / capacity) * 100), 100) : 0;
        return (
          <div className="flex flex-col gap-1 min-w-[90px]">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="font-semibold text-foreground">
                {booked}/{capacity > 0 ? capacity : "—"}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: "STATUS",
      cell: (item) => {
        const formattedStatus = item.status ? item.status.replace("_", " ") : "ON TIME";
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge status={formattedStatus} />
            <select
              value={item.status}
              disabled={updateStatusMutation.isPending}
              onChange={(e) =>
                void handleQuickStatusChange(item.id, e.target.value as OperatorScheduleStatus)
              }
              aria-label="Change status"
              className="text-[10px] bg-background border border-border/80 rounded px-1.5 py-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <option value="ON_TIME">On Time</option>
              <option value="BOARDING">Boarding</option>
              <option value="DEPARTED">Departed</option>
              <option value="DELAYED">Delayed</option>
              <option value="ARRIVED">Arrived</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        );
      }
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
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold text-xs h-7 px-2"
            asChild
          >
            <Link href={`/dashboard/operator/manifest?tripId=${item.id}`}>
              Manifest
            </Link>
          </Button>

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
            size="icon"
            onClick={() => setDeletingSchedule(item)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-semibold h-7 w-7 rounded-lg"
            title="Delete Schedule"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
            Trip Schedules & Departures
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage ferry trips, bookings, and passenger boarding.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Ferry Schedule
        </Button>
      </div>

      {/* Operational Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Scheduled Trips</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalTripsCount} {totalTripsCount === 1 ? "Trip" : "Trips"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Scheduled departures</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Boarding Now</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {boardingCount} Live
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Boarding at jetty / dock</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">On Time</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {onTimeCount} {onTimeCount === 1 ? "Trip" : "Trips"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Leaving on time</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Bookings</p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {totalBookingsCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Confirmed passengers</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60">
            <TabsTrigger value="all" className="text-xs">
              All ({totalTripsCount})
            </TabsTrigger>
            <TabsTrigger value="ON_TIME" className="text-xs">
              On Time ({onTimeCount})
            </TabsTrigger>
            <TabsTrigger value="BOARDING" className="text-xs">
              Boarding ({boardingCount})
            </TabsTrigger>
            <TabsTrigger value="DEPARTED" className="text-xs">
              Departed ({departedCount})
            </TabsTrigger>
            <TabsTrigger value="DELAYED" className="text-xs">
              Delayed ({delayedCount})
            </TabsTrigger>
            <TabsTrigger value="ARRIVED" className="text-xs">
              Arrived ({arrivedCount})
            </TabsTrigger>
            <TabsTrigger value="CANCELLED" className="text-xs">
              Cancelled ({cancelledCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date, Route Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 w-38 pl-8 text-xs font-mono"
              placeholder="Filter by date"
            />
            {dateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateFilter("")}
                className="h-7 px-1.5 text-[11px] text-muted-foreground hover:text-foreground ml-1"
              >
                Clear
              </Button>
            )}
          </div>

          {routesData?.routes && routesData.routes.length > 0 && (
            <div className="w-44 sm:w-52">
              <ReusableSelect
                value={routeFilter}
                onValueChange={setRouteFilter}
                options={[
                  { value: "ALL", label: "All Routes" },
                  ...routeOptions
                ]}
                placeholder="Filter by route"
              />
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => void refetchSchedules()}
            disabled={isSchedulesLoading}
            title="Refresh Schedules"
            className="h-9 w-9 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isSchedulesLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Content Area: Loading / Error / Empty / Table */}
      {isSchedulesLoading ? (
        <Card className="border-border/80 bg-card p-12 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold text-muted-foreground">
              Loading operator ferry schedules...
            </p>
          </div>
        </Card>
      ) : isSchedulesError ? (
        <Card className="border-destructive/20 bg-destructive/5 p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Failed to load schedules</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            {schedulesError instanceof Error ? schedulesError.message : "Could not connect to the schedule service."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => void refetchSchedules()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Retry Connection
            </Button>
          </div>
        </Card>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No departure schedules found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {activeTab !== "all"
              ? "No schedules match the selected status filter."
              : "You haven't scheduled any ferry departures yet. Connect an active route with a registered ferry to schedule passenger trips."}
          </p>
          <Button
            onClick={handleOpenAddModal}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add First Ferry Schedule
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Floating Bulk Actions Bar */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-950 shadow-sm backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-100">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-2xs">
                  {selectedCount}
                </span>
                <span className="text-foreground text-xs font-semibold">
                  {selectedCount === 1 ? "schedule selected" : "schedules selected"}
                </span>
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("ON_TIME")}
                  className="h-8 cursor-pointer gap-1.5 border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                  title="Mark selected schedules as On Time"
                >
                  {isBulkOperating && bulkActionType === "on_time" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span>On Time</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("BOARDING")}
                  className="h-8 cursor-pointer gap-1.5 border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                  title="Mark selected schedules as Boarding"
                >
                  {isBulkOperating && bulkActionType === "boarding" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                  <span>Boarding</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("DEPARTED")}
                  className="h-8 cursor-pointer gap-1.5 border-purple-200 bg-purple-50/50 text-xs font-semibold text-purple-700 shadow-2xs hover:bg-purple-100 hover:text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                  title="Mark selected schedules as Departed"
                >
                  {isBulkOperating && bulkActionType === "departed" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Ship className="h-3.5 w-3.5" />
                  )}
                  <span>Departed</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("DELAYED")}
                  className="h-8 cursor-pointer gap-1.5 border-amber-200 bg-amber-50/50 text-xs font-semibold text-amber-700 shadow-2xs hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                  title="Mark selected schedules as Delayed"
                >
                  {isBulkOperating && bulkActionType === "delayed" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  <span>Delayed</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("ARRIVED")}
                  className="h-8 cursor-pointer gap-1.5 border-teal-200 bg-teal-50/50 text-xs font-semibold text-teal-700 shadow-2xs hover:bg-teal-100 hover:text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
                  title="Mark selected schedules as Arrived"
                >
                  {isBulkOperating && bulkActionType === "arrived" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>Arrived</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("CANCELLED")}
                  className="h-8 cursor-pointer gap-1.5 border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-100 hover:text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                  title="Cancel selected schedules"
                >
                  {isBulkOperating && bulkActionType === "cancelled" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Ban className="h-3.5 w-3.5" />
                  )}
                  <span>Cancel</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="h-8 cursor-pointer gap-1.5 bg-rose-600 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700"
                  title="Delete selected schedules"
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
                  title="Deselect all schedules"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Deselect</span>
                </Button>
              </div>
            </div>
          )}

          <DashboardTableCard
            title="Ferry Departure Schedules"
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
            columns={scheduleColumns}
            data={schedules}
            keyExtractor={(item) => item.id}
            rowClassName={(item) =>
              selectedScheduleIds.has(item.id)
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
            itemName="schedules"
            isLoading={isSchedulesFetching}
          />
        </div>
      )}

      {/* Schedule Ferry Departure Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Ship className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Add Ferry Schedule
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Plan and publish a scheduled sailing between island ports with assigned ferry and ticket prices.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddSchedule} className="space-y-4 py-2">
            {/* Prerequisite Warnings */}
            {(!routesData?.routes || routesData.routes.length === 0) && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  No active routes registered. Please add a ferry route in{" "}
                  <Link href="/dashboard/operator/routes" className="underline font-bold">
                    Route Management
                  </Link>{" "}
                  before scheduling departures.
                </span>
              </div>
            )}
            {(!ferriesData?.ferries || ferriesData.ferries.length === 0) && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  No ferries registered. Please register a ferry in{" "}
                  <Link href="/dashboard/operator/ferries" className="underline font-bold">
                    Ferry Management
                  </Link>{" "}
                  before scheduling departures.
                </span>
              </div>
            )}

            {/* Real-World Voyage Preview Summary */}
            {selectedRoute && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white text-[11px] font-bold">
                      ➔
                    </div>
                    <span className="font-bold text-xs text-foreground">
                      {selectedRoute.departurePort?.name ?? "Origin"} ➔ {selectedRoute.destinationPort?.name ?? "Destination"}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {selectedRoute.durationMinutes} mins trip
                  </span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-muted-foreground pt-1 border-t border-emerald-500/10">
                  <span>
                    Ferry:{" "}
                    <strong className="text-foreground font-semibold">
                      {selectedFerry?.name ?? "Selected Ferry"}
                    </strong>{" "}
                    ({selectedFerry?.capacity ?? 0} Seats Capacity)
                  </span>
                  <span>
                    Maximum Bookings:{" "}
                    <strong className="text-foreground font-semibold">
                      {selectedFerry?.capacity ?? 0} seats
                    </strong>
                  </span>
                </div>

                {selectedFerry?.status === "MAINTENANCE" && (
                  <div className="mt-1 px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Notice: This ferry is currently marked as <strong>Under Maintenance</strong>. Ensure maintenance is complete before departure date.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 1. Voyage & Schedule Timing */}
            <div className="space-y-3 pt-1">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                1. Sailing Timing & Ferry
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Route Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Ferry Route *
                  </Label>
                  {isRoutesLoading ? (
                    <div className="h-9 flex items-center text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Loading routes...
                    </div>
                  ) : (
                    <ReusableSelect
                      value={newForm.routeId}
                      onValueChange={handleRouteChange}
                      options={routeOptions}
                      placeholder="Select ferry route..."
                    />
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Origin and destination island ports
                  </p>
                </div>

                {/* Ferry Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Assign Ferry *
                  </Label>
                  {isFerriesLoading ? (
                    <div className="h-9 flex items-center text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Loading ferries...
                    </div>
                  ) : (
                    <ReusableSelect
                      value={newForm.ferryId}
                      onValueChange={(val) => setNewForm((prev) => ({ ...prev, ferryId: val }))}
                      options={ferryOptions}
                      placeholder={
                        ferryOptions.length === 0
                          ? "No in-service ferries available"
                          : "Select ferry..."
                      }
                    />
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Only ferries currently In Service can be assigned
                  </p>
                </div>

                {/* Departure DateTime */}
                <div className="space-y-1.5">
                  <Label htmlFor="dep-datetime" className="text-xs font-semibold text-foreground">
                    Departure Time *
                  </Label>
                  <Input
                    id="dep-datetime"
                    type="datetime-local"
                    value={newForm.departureDateTime}
                    onChange={(e) => handleDepartureChange(e.target.value)}
                    required
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {selectedRoute?.departurePort?.name
                      ? `Date & time ferry leaves ${selectedRoute.departurePort.name}`
                      : "Date & time the ferry leaves origin port"}
                  </p>
                </div>

                {/* Arrival DateTime */}
                <div className="space-y-1.5">
                  <Label htmlFor="arr-datetime" className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Arrival Time *</span>
                    {selectedRoute?.durationMinutes && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        ≈ {selectedRoute.durationMinutes} mins trip
                      </span>
                    )}
                  </Label>
                  <Input
                    id="arr-datetime"
                    type="datetime-local"
                    value={newForm.arrivalDateTime}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, arrivalDateTime: e.target.value }))
                    }
                    required
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-600 inline shrink-0" />
                    <span>
                      {selectedRoute?.destinationPort?.name
                        ? `Date & time ferry reaches ${selectedRoute.destinationPort.name}`
                        : "Date & time ferry reaches destination"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Ticket Prices */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-emerald-600" />
                2. Ticket Prices
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Adult Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="adultFare" className="text-xs font-semibold text-foreground">
                    Adult Ticket Price ($) *
                  </Label>
                  <Input
                    id="adultFare"
                    type="number"
                    min="1"
                    step="0.5"
                    placeholder="e.g. 25"
                    value={newForm.adultFare}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, adultFare: e.target.value }))
                    }
                    required
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Standard passenger price per seat
                  </p>
                </div>

                {/* Child Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="childFare" className="text-xs font-semibold text-foreground">
                    Child Ticket Price ($)
                  </Label>
                  <Input
                    id="childFare"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 15"
                    value={newForm.childFare}
                    onChange={(e) =>
                      setNewForm((prev) => ({ ...prev, childFare: e.target.value }))
                    }
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Discounted rate for children (ages 2–12)
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
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
                disabled={createScheduleMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
              >
                {createScheduleMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Scheduling...
                  </>
                ) : (
                  <>
                    <Ship className="h-3.5 w-3.5" />
                    Schedule Departure
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Departure Schedule Modal */}
      <Dialog open={!!editingSchedule} onOpenChange={(open) => !open && setEditingSchedule(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Ferry Schedule
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update departure timing, live trip status, or passenger ticket prices.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Real-World Context Card */}
          {editingSchedule && (
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-foreground">
                  {editingSchedule.route?.departurePort?.name ?? "Origin"} ➔ {editingSchedule.route?.destinationPort?.name ?? "Dest"}
                </span>
                <span className="text-muted-foreground ml-2">
                  ({editingSchedule.ferry?.name ?? "Ferry"} • {editingSchedule.ferry?.capacity ?? 0} Seats)
                </span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full self-start sm:self-auto">
                👥 {editingSchedule._count?.bookings ?? 0} Confirmed Bookings
              </div>
            </div>
          )}

          <form onSubmit={handleUpdateSchedule} className="space-y-4 py-2">
            {/* 1. Schedule Timing & Live Status */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                1. Sailing Timing & Live Status
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Departure DateTime */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-dep-time" className="text-xs font-semibold text-foreground">
                    Departure Time *
                  </Label>
                  <Input
                    id="edit-dep-time"
                    type="datetime-local"
                    value={editForm.departureDateTime}
                    onChange={(e) => handleEditDepartureChange(e.target.value)}
                    required
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {editingSchedule?.route?.departurePort?.name
                      ? `Date & time ferry leaves ${editingSchedule.route.departurePort.name}`
                      : "Date & time the ferry leaves origin port"}
                  </p>
                </div>

                {/* Arrival DateTime */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-arr-time" className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Arrival Time *</span>
                    {editingSchedule?.route?.durationMinutes && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        ≈ {editingSchedule.route.durationMinutes} mins trip
                      </span>
                    )}
                  </Label>
                  <Input
                    id="edit-arr-time"
                    type="datetime-local"
                    value={editForm.arrivalDateTime}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, arrivalDateTime: e.target.value }))
                    }
                    required
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-600 inline shrink-0" />
                    <span>
                      {editingSchedule?.route?.destinationPort?.name
                        ? `Date & time ferry reaches ${editingSchedule.route.destinationPort.name}`
                        : "Date & time ferry reaches destination"}
                    </span>
                  </p>
                </div>

                {/* Live Status */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Live Departure Status *
                  </Label>
                  <ReusableSelect
                    value={editForm.status}
                    onValueChange={(val) =>
                      setEditForm((prev) => ({ ...prev, status: val as OperatorScheduleStatus }))
                    }
                    options={STATUS_OPTIONS}
                    placeholder="Select status..."
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Broadcasted to passenger search and digital tickets
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Ticket Prices */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-emerald-600" />
                2. Ticket Prices
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Adult Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-adultFare" className="text-xs font-semibold text-foreground">
                    Adult Ticket Price ($) *
                  </Label>
                  <Input
                    id="edit-adultFare"
                    type="number"
                    min="1"
                    step="0.5"
                    value={editForm.adultFare}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, adultFare: e.target.value }))
                    }
                    required
                    className="text-xs h-9 font-mono"
                  />
                </div>

                {/* Child Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-childFare" className="text-xs font-semibold text-foreground">
                    Child Ticket Price ($)
                  </Label>
                  <Input
                    id="edit-childFare"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editForm.childFare}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, childFare: e.target.value }))
                    }
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
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
                disabled={updateScheduleMutation.isPending || updateStatusMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                {updateScheduleMutation.isPending || updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...
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
      <Dialog open={!!deletingSchedule} onOpenChange={(open) => !open && setDeletingSchedule(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Delete Departure Schedule
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to delete this scheduled ferry departure?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deletingSchedule && (
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1.5 text-xs">
              <div className="font-semibold text-foreground">
                {deletingSchedule.route?.departurePort?.name ?? "Origin"} ➔ {deletingSchedule.route?.destinationPort?.name ?? "Destination"}
              </div>
              <div className="text-muted-foreground flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                {isValid(parseISO(deletingSchedule.departureTime))
                  ? format(parseISO(deletingSchedule.departureTime), "hh:mm a, dd MMM yyyy")
                  : deletingSchedule.departureTime}
              </div>
              <div className="text-muted-foreground flex items-center gap-1">
                <Ship className="h-3.5 w-3.5 text-blue-600" />
                {deletingSchedule.ferry?.name ?? "Assigned Ferry"}
              </div>
              {(deletingSchedule._count?.bookings ?? 0) > 0 && (
                <div className="mt-2 text-rose-600 font-bold bg-rose-500/10 p-2 rounded-lg">
                  ⚠️ Caution: {deletingSchedule._count?.bookings} passenger bookings are already confirmed on this trip.
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleteScheduleMutation.isPending}
              onClick={() => setDeletingSchedule(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleteScheduleMutation.isPending}
              onClick={handleDeleteSchedule}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
            >
              {deleteScheduleMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Deleting...
                </>
              ) : (
                "Delete Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Delete {selectedCount} Departure {selectedCount === 1 ? "Schedule" : "Schedules"}?
                </DialogTitle>
                <DialogDescription className="text-xs">
                  This action permanently removes the selected departure slots from the timetable.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-muted-foreground">
            <p>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">
                {selectedCount} selected {selectedCount === 1 ? "schedule" : "schedules"}
              </strong>
              ?
            </p>
            <div className="rounded-xl border border-rose-200/60 bg-rose-50/50 p-3 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
              Warning: Any confirmed passenger bookings associated with these departure schedules will require refunds or manual reassignment. This action cannot be reversed.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkOperating}
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isBulkOperating}
              onClick={handleBulkDelete}
              className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 cursor-pointer"
            >
              {isBulkOperating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Yes, Delete {selectedCount} {selectedCount === 1 ? "Schedule" : "Schedules"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
