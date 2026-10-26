"use client";

import * as React from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Edit,
  ImageIcon,
  Loader2,
  Luggage,
  Plus,
  Search,
  ShieldCheck,
  Ship,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  Users,
  Waves,
  Wifi,
  Wind,
  Wrench,
  X,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  ICreateFerryPayload,
  IFerry,
  IUpdateFerryPayload,
  VesselStatus,
  VesselType
} from "@/types";
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
  Checkbox,
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
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/ui";
import { DashboardTableCard, StatusBadge, TablePagination, type TableColumn, VesselImageUploader } from "@/widgets";
import { DEFAULT_FERRY_IMAGES, getDynamicVesselImage } from "@/data/media-catalog";
export { DEFAULT_FERRY_IMAGES, getDynamicVesselImage };

export function getFerryImage(ferry: IFerry): string {
  if (
    ferry.imageUrl &&
    (ferry.imageUrl.trim().startsWith("http") || ferry.imageUrl.trim().startsWith("data:image/"))
  ) {
    return ferry.imageUrl.trim();
  }
  return getDynamicVesselImage(ferry.type, ferry.name || ferry.registration || ferry.id);
}

// Vessel amenities constants & helper methods
export const SUGGESTED_VESSEL_AMENITIES = [
  "Air Conditioned",
  "WiFi Onboard",
  "Life Jackets Provided",
  "Luggage Assistance",
  "Scenic Sun Deck",
  "Restroom Onboard",
  "USB Charging Ports",
  "Snacks Available",
  "Comfortable Seating",
  "Safety Briefing"
];

export function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("air") || lower.includes("ac") || lower.includes("cool")) {
    return <Wind className="h-3 w-3 shrink-0 text-sky-600 dark:text-sky-400" />;
  }
  if (lower.includes("speed") || lower.includes("boat")) {
    return <Ship className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />;
  }
  if (lower.includes("bag") || lower.includes("luggage")) {
    return <Luggage className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />;
  }
  if (lower.includes("wifi")) {
    return <Wifi className="h-3 w-3 shrink-0 text-indigo-600 dark:text-indigo-400" />;
  }
  if (lower.includes("surf")) {
    return <Waves className="h-3 w-3 shrink-0 text-teal-600 dark:text-teal-400" />;
  }
  if (lower.includes("scenic") || lower.includes("deck") || lower.includes("view")) {
    return <Sun className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />;
  }
  if (lower.includes("jacket") || lower.includes("life") || lower.includes("safe")) {
    return <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />;
  }
  if (lower.includes("snack") || lower.includes("bar") || lower.includes("drink") || lower.includes("coffee")) {
    return <Coffee className="h-3 w-3 shrink-0 text-orange-600 dark:text-orange-400" />;
  }
  if (lower.includes("usb") || lower.includes("charg") || lower.includes("power")) {
    return <Zap className="h-3 w-3 shrink-0 text-yellow-600 dark:text-yellow-400" />;
  }
  if (lower.includes("comfort") || lower.includes("seat") || lower.includes("premium")) {
    return <Sparkles className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />;
  }
  return <Tag className="text-muted-foreground h-3 w-3 shrink-0" />;
}

export function getAmenityStyle(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("air") || lower.includes("ac") || lower.includes("cool")) {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50";
  }
  if (lower.includes("speed") || lower.includes("boat")) {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/50";
  }
  if (lower.includes("bag") || lower.includes("luggage")) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50";
  }
  if (lower.includes("wifi")) {
    return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50";
  }
  if (lower.includes("surf")) {
    return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/50";
  }
  if (lower.includes("scenic") || lower.includes("deck") || lower.includes("view")) {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50";
  }
  if (lower.includes("jacket") || lower.includes("life") || lower.includes("safe")) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50";
  }
  if (lower.includes("snack") || lower.includes("bar") || lower.includes("drink") || lower.includes("coffee")) {
    return "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/50";
  }
  if (lower.includes("usb") || lower.includes("charg") || lower.includes("power")) {
    return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200/80 dark:border-yellow-800/50";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300 border-slate-200 dark:border-slate-700/60";
}

export function getFerryAmenities(ferry: IFerry): string[] {
  if (Array.isArray(ferry.amenities) && ferry.amenities.length > 0) {
    return ferry.amenities;
  }
  return ["Air Conditioned", "Life Jackets Provided", "Luggage Assistance"];
}

// Ferry types matching backend enum with clear, real-world labels
const FERRY_TYPE_OPTIONS: Array<{ value: VesselType; label: string }> = [
  { value: "CATAMARAN", label: "Catamaran (High-Speed)" },
  { value: "SPEEDBOAT", label: "Speedboat (Express)" },
  { value: "TRADITIONAL_FERRY", label: "Traditional Ferry" }
];

// Operational statuses
const FERRY_STATUS_OPTIONS: Array<{ value: VesselStatus; label: string }> = [
  { value: "IN_SERVICE", label: "In Service" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" }
];

const FILTER_TYPE_OPTIONS = [
  { value: "ALL", label: "All Ferry Types" },
  ...FERRY_TYPE_OPTIONS
];

const FILTER_STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  ...FERRY_STATUS_OPTIONS
];

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

function formatFerryType(type: VesselType | string): string {
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

function formatFerryStatus(status: VesselStatus | string): string {
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

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Bulk selection & action states
  const [selectedFerryIds, setSelectedFerryIds] = React.useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = React.useState(false);
  const [bulkActionType, setBulkActionType] = React.useState<
    "in_service" | "maintenance" | "out_of_service" | "delete" | null
  >(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);

  // Reset page whenever search, filter, or page size changes (guard initial mount)
  const isFirstMount = React.useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
    setSelectedFerryIds(new Set());
  }, [debouncedSearch, selectedType, selectedStatus, pageSize]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingFerry, setEditingFerry] = React.useState<IFerry | null>(null);
  const [deletingFerry, setDeletingFerry] = React.useState<IFerry | null>(null);

  // Queries
  const {
    data: ferriesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useFerriesQuery({
    search: debouncedSearch.trim() || undefined,
    type: selectedType !== "ALL" ? (selectedType as VesselType) : undefined,
    status: selectedStatus !== "ALL" ? (selectedStatus as VesselStatus) : undefined,
    page,
    limit: pageSize
  });

  const { data: statsData } = useFerryStatsQuery();

  // Mutations
  const createMutation = useCreateFerryMutation();
  const updateMutation = useUpdateFerryMutation();
  const deleteMutation = useDeleteFerryMutation();

  // Local ferries state synchronized with server data
  const [localFerries, setLocalFerries] = React.useState<IFerry[]>([]);

  React.useEffect(() => {
    if (ferriesData?.ferries) {
      setLocalFerries(ferriesData.ferries);
    }
  }, [ferriesData?.ferries]);

  // Pagination calculations
  const meta = ferriesData?.meta;
  const totalCount = meta?.total ?? localFerries.length;
  const totalPages = Math.max(1, meta?.totalPages ?? Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Sliced ferries for resilience in case backend returns all items
  const displayedFerries = React.useMemo(() => {
    if (localFerries.length > pageSize) {
      const start = (currentPage - 1) * pageSize;
      return localFerries.slice(start, start + pageSize);
    }
    return localFerries;
  }, [localFerries, currentPage, pageSize]);

  const ferries = displayedFerries;

  // Keep page clamped ONLY when query has settled and is not in flight
  React.useEffect(() => {
    if (!isLoading && !isFetching && ferriesData && page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages, isLoading, isFetching, ferriesData]);


  // Form states
  const [newFerry, setNewFerry] = React.useState<ICreateFerryPayload>({
    name: "",
    registration: "",
    capacity: 120,
    type: "CATAMARAN",
    status: "IN_SERVICE",
    imageUrl: "",
    amenities: ["Air Conditioned", "Life Jackets Provided", "Luggage Assistance"]
  });

  const [editForm, setEditForm] = React.useState<IUpdateFerryPayload>({
    name: "",
    registration: "",
    capacity: 120,
    type: "CATAMARAN",
    status: "IN_SERVICE",
    imageUrl: "",
    amenities: []
  });

  const [newCustomAmenity, setNewCustomAmenity] = React.useState("");
  const [editCustomAmenity, setEditCustomAmenity] = React.useState("");

  const handleOpenEdit = (ferry: IFerry) => {
    setEditCustomAmenity("");
    setEditingFerry(ferry);
    setEditForm({
      name: ferry.name,
      registration: ferry.registration,
      capacity: ferry.capacity,
      type: ferry.type,
      status: ferry.status,
      imageUrl: ferry.imageUrl ?? "",
      amenities: Array.isArray(ferry.amenities) ? ferry.amenities : []
    });
  };

  const handleAddCustomAmenity = () => {
    const trimmed = newCustomAmenity.trim();
    if (!trimmed) return;
    if (!newFerry.amenities?.includes(trimmed)) {
      setNewFerry((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), trimmed]
      }));
    }
    setNewCustomAmenity("");
  };

  const removeNewAmenity = (item: string) => {
    setNewFerry((prev) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((a) => a !== item)
    }));
  };

  const handleEditAddCustomAmenity = () => {
    const trimmed = editCustomAmenity.trim();
    if (!trimmed) return;
    if (!editForm.amenities?.includes(trimmed)) {
      setEditForm((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), trimmed]
      }));
    }
    setEditCustomAmenity("");
  };

  const removeEditAmenity = (item: string) => {
    setEditForm((prev) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((a) => a !== item)
    }));
  };

  const toggleNewAmenity = (amenity: string) => {
    setNewFerry((prev) => {
      const list = prev.amenities || [];
      const exists = list.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? list.filter((a) => a !== amenity)
          : [...list, amenity]
      };
    });
  };

  const toggleEditAmenity = (amenity: string) => {
    setEditForm((prev) => {
      const list = prev.amenities || [];
      const exists = list.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? list.filter((a) => a !== amenity)
          : [...list, amenity]
      };
    });
  };

  const unselectedNewSuggestions = React.useMemo(() => {
    return SUGGESTED_VESSEL_AMENITIES.filter((item) => !(newFerry.amenities || []).includes(item));
  }, [newFerry.amenities]);

  const unselectedEditSuggestions = React.useMemo(() => {
    return SUGGESTED_VESSEL_AMENITIES.filter((item) => !(editForm.amenities || []).includes(item));
  }, [editForm.amenities]);

  const handleAddFerry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFerry.name.trim() || !newFerry.registration.trim()) {
      toast.error("Please provide both Ferry Name and Registration Number.");
      return;
    }

    if (!newFerry.capacity || newFerry.capacity <= 0) {
      toast.error("Capacity must be at least 1 passenger.");
      return;
    }

    try {
      const res = await createMutation.mutateAsync({
        name: newFerry.name.trim(),
        registration: newFerry.registration.trim().toUpperCase(),
        capacity: Number(newFerry.capacity),
        type: newFerry.type,
        status: newFerry.status,
        imageUrl: newFerry.imageUrl?.trim() || undefined,
        amenities: newFerry.amenities ?? []
      });

      // Instantly inject created ferry into local table view
      if (res?.data) {
        const createdFerry = res.data;
        setLocalFerries((prev) => [
          createdFerry,
          ...prev.filter((f) => f.id !== createdFerry.id)
        ]);
      }

      setPage(1);
      await refetch();
      setIsAddModalOpen(false);
      setNewFerry({
        name: "",
        registration: "",
        capacity: 120,
        type: "CATAMARAN",
        status: "IN_SERVICE",
        imageUrl: "",
        amenities: ["Air Conditioned", "Life Jackets Provided", "Luggage Assistance"]
      });
      setNewCustomAmenity("");
    } catch {
      // Handled in mutation onError
    }
  };

  const handleUpdateFerry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFerry) return;

    if (!editForm.name?.trim() || !editForm.registration?.trim()) {
      toast.error("Ferry Name and Registration Number cannot be blank.");
      return;
    }

    try {
      const res = await updateMutation.mutateAsync({
        id: editingFerry.id,
        payload: {
          name: editForm.name.trim(),
          registration: editForm.registration.trim().toUpperCase(),
          capacity: Number(editForm.capacity),
          type: editForm.type,
          status: editForm.status,
          imageUrl: editForm.imageUrl?.trim() || undefined,
          amenities: editForm.amenities ?? []
        }
      });

      // Instantly update the edited ferry in local view
      if (res?.data) {
        const updatedFerry = res.data;
        setLocalFerries((prev) =>
          prev.map((f) => (f.id === updatedFerry.id ? updatedFerry : f))
        );
      }

      await refetch();
      setEditingFerry(null);
    } catch {
      // Handled in mutation onError
    }
  };

  const handleDeleteFerry = async () => {
    if (!deletingFerry) return;

    try {
      await deleteMutation.mutateAsync(deletingFerry.id);
      setLocalFerries((prev) => prev.filter((f) => f.id !== deletingFerry.id));
      await refetch();
      setDeletingFerry(null);
    } catch {
      // Handled in mutation onError
    }
  };

  // Aggregated Stats
  const totalFerriesCount = statsData?.totalFerries ?? ferries.length;
  const inServiceCount =
    statsData?.inServiceFerries ?? ferries.filter((f) => f.status === "IN_SERVICE").length;
  const maintenanceCount =
    statsData?.maintenanceFerries ?? ferries.filter((f) => f.status === "MAINTENANCE").length;
  const outOfServiceCount =
    statsData?.outOfServiceFerries ?? ferries.filter((f) => f.status === "OUT_OF_SERVICE").length;
  const totalCapacity =
    statsData?.totalCapacity ?? ferries.reduce((acc, f) => acc + (f.capacity || 0), 0);

  // Selection Computations
  const displayedFerryIds = React.useMemo(() => ferries.map((f) => f.id), [ferries]);
  const isAllCurrentPageSelected =
    ferries.length > 0 && ferries.every((f) => selectedFerryIds.has(f.id));
  const isSomeCurrentPageSelected =
    ferries.some((f) => selectedFerryIds.has(f.id)) && !isAllCurrentPageSelected;
  const selectedCount = selectedFerryIds.size;

  const toggleSelectAllCurrentPage = () => {
    setSelectedFerryIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        displayedFerryIds.forEach((id) => next.delete(id));
      } else {
        displayedFerryIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedFerryIds((prev: Set<string>) => {
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
    setSelectedFerryIds(new Set());
  };

  // Bulk Handlers
  const handleBulkSetStatus = async (status: VesselStatus) => {
    if (selectedFerryIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedFerryIds) as string[];
    setIsBulkOperating(true);
    const actionKey =
      status === "IN_SERVICE"
        ? "in_service"
        : status === "MAINTENANCE"
          ? "maintenance"
          : "out_of_service";
    setBulkActionType(actionKey);

    const statusLabel =
      status === "IN_SERVICE"
        ? "In Service"
        : status === "MAINTENANCE"
          ? "Maintenance"
          : "Out of Service";

    const toastId = toast.loading(
      `Setting ${ids.length} ${ids.length === 1 ? "ferry" : "ferries"} to ${statusLabel}...`
    );

    setLocalFerries((prev) =>
      prev.map((f) => (selectedFerryIds.has(f.id) ? { ...f, status } : f))
    );

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        await updateMutation.mutateAsync({
          id,
          payload: { status }
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    await refetch();
    setIsBulkOperating(false);
    setBulkActionType(null);
    setSelectedFerryIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully updated ${successCount} ferries to ${statusLabel}!`, {
        id: toastId
      });
    } else {
      toast.warning(`Updated ${successCount} ferries (${failCount} failed)`, { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFerryIds.size === 0 || isBulkOperating) return;
    const ids = Array.from(selectedFerryIds) as string[];
    setIsBulkOperating(true);
    setBulkActionType("delete");

    const toastId = toast.loading(
      `Deleting ${ids.length} ${ids.length === 1 ? "ferry" : "ferries"}...`
    );

    setLocalFerries((prev) => prev.filter((f) => !selectedFerryIds.has(f.id)));

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
    setSelectedFerryIds(new Set());

    if (failCount === 0) {
      toast.success(`Successfully deleted ${successCount} ferries!`, { id: toastId });
    } else {
      toast.warning(`Deleted ${successCount} ferries (${failCount} failed)`, { id: toastId });
    }
  };

  const ferryColumns: TableColumn<IFerry>[] = [
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
            aria-label="Select all ferries on current page"
          />
        </div>
      ),
      headerClassName: "w-10 px-3 text-center",
      className: "w-10 px-3 text-center",
      align: "center",
      cell: (item) => {
        const isChecked = selectedFerryIds.has(item.id);
        return (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggleSelectRow(item.id)}
              aria-label={`Select ferry ${item.name}`}
            />
          </div>
        );
      }
    },
    {
      header: "FERRY VESSEL",
      cell: (item) => {
        const ferryImg = getFerryImage(item);
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted shadow-2xs">
              <Image
                src={ferryImg}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={ferryImg.startsWith("data:")}
              />
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
        );
      }
    },
    {
      header: "REGISTRATION NO.",
      accessorKey: "registration",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300 text-xs"
    },
    {
      header: "FERRY TYPE",
      cell: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
          {formatFerryType(item.type)}
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
      header: "ONBOARD FACILITIES",
      cell: (item) => {
        const amenities = getFerryAmenities(item);
        if (amenities.length === 0) {
          return (
            <span className="text-muted-foreground text-[11px] italic">Standard transfer</span>
          );
        }

        const visible = amenities.slice(0, 2);
        const remaining = amenities.slice(2);

        return (
          <div className="flex max-w-[240px] flex-wrap items-center gap-1.5">
            {visible.map((amenity) => {
              const badgeClass = getAmenityStyle(amenity);
              return (
                <span
                  key={amenity}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap shadow-2xs transition-colors",
                    badgeClass
                  )}
                  title={amenity}
                >
                  {getAmenityIcon(amenity)}
                  <span className="max-w-[105px] truncate">{amenity}</span>
                </span>
              );
            })}
            {remaining.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="bg-muted/90 text-foreground/80 hover:bg-muted border-border/80 inline-flex cursor-pointer items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold shadow-2xs transition-colors"
                  >
                    <span>+{remaining.length}</span>
                    <span className="text-muted-foreground text-[9px]">more</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-popover text-popover-foreground border-border/80 z-50 max-w-[240px] space-y-2 rounded-xl border p-2.5 shadow-xl"
                >
                  <div className="text-muted-foreground border-border/60 border-b pb-1 text-[10px] font-bold tracking-wider uppercase">
                    Onboard Facilities ({amenities.length})
                  </div>
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    {amenities.map((a) => (
                      <div
                        key={a}
                        className="text-foreground flex items-center gap-2 text-xs font-medium"
                      >
                        {getAmenityIcon(a)}
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={formatFerryStatus(item.status)} />
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
            title="Edit Ferry Details"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeletingFerry(item)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-semibold h-8 w-8 rounded-lg"
            title="Remove Ferry"
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
            Ferry Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage your registered passenger ferries, seating capacity, and operational status.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Ferry
        </Button>
      </div>

      {/* Ferry Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Ferries</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalFerriesCount} {totalFerriesCount === 1 ? "Ferry" : "Ferries"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Registered ferries</p>
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Ready to sail</p>
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
                {maintenanceCount} In Service
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Under maintenance</p>
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Temporarily inactive</p>
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
              <p className="text-[11px] text-muted-foreground mt-0.5">Total seating capacity</p>
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
            placeholder="Search ferries by name or registration number..."
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
          <p className="text-sm font-medium text-muted-foreground">Loading ferries directory...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
          <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
          <h3 className="text-sm font-bold text-foreground">Failed to load ferries data</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium max-w-md mt-1">
            {error instanceof Error ? error.message : "Could not fetch registered ferries from the server."}
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
      ) : ferries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            <Ship className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No ferries found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchTerm || selectedType !== "ALL" || selectedStatus !== "ALL"
              ? "No ferries match the specified search query or filters."
              : "You have not registered any ferries yet. Add your first ferry to start scheduling trips."}
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Ferry
          </Button>
        </div>
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
                  {selectedCount === 1 ? "ferry selected" : "ferries selected"}
                </span>
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("IN_SERVICE")}
                  className="h-8 cursor-pointer gap-1.5 border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                  title="Mark selected ferries as In Service"
                >
                  {isBulkOperating && bulkActionType === "in_service" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  )}
                  <span>In Service</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("MAINTENANCE")}
                  className="h-8 cursor-pointer gap-1.5 border-amber-200 bg-amber-50/50 text-xs font-semibold text-amber-700 shadow-2xs hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                  title="Mark selected ferries for Maintenance"
                >
                  {isBulkOperating && bulkActionType === "maintenance" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wrench className="h-3.5 w-3.5" />
                  )}
                  <span>Maintenance</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => handleBulkSetStatus("OUT_OF_SERVICE")}
                  className="h-8 cursor-pointer gap-1.5 border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:bg-slate-900/60"
                  title="Mark selected ferries as Out of Service"
                >
                  {isBulkOperating && bulkActionType === "out_of_service" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  <span>Out of Service</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBulkOperating}
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="h-8 cursor-pointer gap-1.5 bg-rose-600 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700"
                  title="Delete selected ferries"
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
                  title="Deselect all ferries"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Deselect</span>
                </Button>
              </div>
            </div>
          )}

          <DashboardTableCard
            title="All Ferries"
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
            columns={ferryColumns}
            data={ferries}
            keyExtractor={(item) => item.id}
            rowClassName={(item) =>
              selectedFerryIds.has(item.id)
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
            itemName="ferries"
            isLoading={isFetching}
          />
        </div>
      )}

      {/* Add New Ferry Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-border/60 border-b px-6 py-4 pr-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Ship className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Add New Ferry
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Add a passenger ferry, catamaran, or speedboat with capacity and onboard amenities.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddFerry} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="h-[min(65vh,540px)] w-full">
              <div className="space-y-4 px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ferry-name" className="text-xs font-semibold text-foreground">
                      Ferry Name *
                    </Label>
                    <Input
                      id="ferry-name"
                      placeholder="e.g. Island Star IV"
                      value={newFerry.name}
                      onChange={(e) => setNewFerry((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ferry-reg" className="text-xs font-semibold text-foreground">
                      Registration Number *
                    </Label>
                    <Input
                      id="ferry-reg"
                      placeholder="e.g. MV-2041 or REG-984"
                      value={newFerry.registration}
                      onChange={(e) =>
                        setNewFerry((prev) => ({ ...prev, registration: e.target.value }))
                      }
                      required
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ferry-cap" className="text-xs font-semibold text-foreground">
                      Passenger Capacity (Seats) *
                    </Label>
                    <Input
                      id="ferry-cap"
                      type="number"
                      min="1"
                      max="5000"
                      value={newFerry.capacity}
                      onChange={(e) =>
                        setNewFerry((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                      }
                      required
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">
                      Ferry Type *
                    </Label>
                    <ReusableSelect
                      value={newFerry.type || "CATAMARAN"}
                      onValueChange={(val) =>
                        setNewFerry((prev) => ({ ...prev, type: val as VesselType }))
                      }
                      options={FERRY_TYPE_OPTIONS}
                      placeholder="Select ferry type"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-semibold text-foreground">
                      Operational Status *
                    </Label>
                    <ReusableSelect
                      value={newFerry.status || "IN_SERVICE"}
                      onValueChange={(val) =>
                        setNewFerry((prev) => ({
                          ...prev,
                          status: val as VesselStatus
                        }))
                      }
                      options={FERRY_STATUS_OPTIONS}
                      placeholder="Select status"
                    />
                  </div>

                  {/* Onboard Amenities / Facilities Section */}
                  <div className="border-border/50 space-y-3 border-t pt-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          What&apos;s Included
                        </Label>
                        <p className="text-muted-foreground mt-0.5 text-[10px]">
                          What passengers get with their ticket (e.g. WiFi, AC, Baggage)
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {newFerry.amenities?.length || 0} selected
                      </span>
                    </div>

                    {/* Active Selected Tags with Remove (x) */}
                    <div className="border-border/80 bg-muted/20 flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl border border-dashed p-2">
                      {(newFerry.amenities?.length || 0) > 0 ? (
                        newFerry.amenities?.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs transition-all dark:text-emerald-300"
                          >
                            {getAmenityIcon(item)}
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeNewAmenity(item)}
                              className="ml-0.5 cursor-pointer rounded-full p-0.5 text-emerald-700 transition-colors hover:bg-emerald-500/30 dark:text-emerald-300"
                              title={`Remove ${item}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-muted-foreground px-1 text-[11px] italic">
                          No facilities selected yet. Type custom items below or click popular options.
                        </p>
                      )}
                    </div>

                    {/* Custom Input Field with Add Button */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" />
                        <Input
                          type="text"
                          placeholder="e.g. Life Jackets, AC Cabin, Scenic Sun Deck..."
                          value={newCustomAmenity}
                          onChange={(e) => setNewCustomAmenity(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomAmenity();
                            }
                          }}
                          className="placeholder:text-muted-foreground h-8 pl-8 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddCustomAmenity}
                        disabled={!newCustomAmenity.trim()}
                        className="h-8 shrink-0 cursor-pointer border-emerald-500/40 px-3 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add Facility
                      </Button>
                    </div>

                    {/* Quick Suggestions - Only showing unselected options */}
                    <div className="space-y-1.5 pt-0.5">
                      <p className="text-muted-foreground text-[10px] font-medium">
                        Popular vessel features (click to add):
                      </p>
                      {unselectedNewSuggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {unselectedNewSuggestions.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleNewAmenity(item)}
                              className="border-border/80 bg-muted/30 text-muted-foreground flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                            >
                              {getAmenityIcon(item)}
                              <span>{item}</span>
                              <Plus className="text-muted-foreground ml-0.5 h-2.5 w-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-[10px] italic">
                          All popular amenities added. You can add more custom amenities above.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ferry Vessel Image Uploader */}
                  <div className="border-border/50 border-t pt-3 sm:col-span-2">
                    <VesselImageUploader
                      value={newFerry.imageUrl || ""}
                      onChange={(url) => setNewFerry((prev) => ({ ...prev, imageUrl: url }))}
                    />
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
                    Adding Ferry...
                  </>
                ) : (
                  "Add Ferry"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ferry Modal */}
      <Dialog open={!!editingFerry} onOpenChange={(open) => !open && setEditingFerry(null)}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-border/60 border-b px-6 py-4 pr-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Ferry Details
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update ferry name, registration number, passenger capacity, status, and onboard facilities.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateFerry} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="h-[min(65vh,540px)] w-full">
              <div className="space-y-4 px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-ferry-name" className="text-xs font-semibold text-foreground">
                      Ferry Name *
                    </Label>
                    <Input
                      id="edit-ferry-name"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-ferry-reg" className="text-xs font-semibold text-foreground">
                      Registration Number *
                    </Label>
                    <Input
                      id="edit-ferry-reg"
                      value={editForm.registration || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, registration: e.target.value }))
                      }
                      required
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-ferry-cap" className="text-xs font-semibold text-foreground">
                      Passenger Capacity (Seats) *
                    </Label>
                    <Input
                      id="edit-ferry-cap"
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
                      Ferry Type *
                    </Label>
                    <ReusableSelect
                      value={editForm.type || "CATAMARAN"}
                      onValueChange={(val) =>
                        setEditForm((prev) => ({ ...prev, type: val as VesselType }))
                      }
                      options={FERRY_TYPE_OPTIONS}
                      placeholder="Select ferry type"
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
                      options={FERRY_STATUS_OPTIONS}
                      placeholder="Select status"
                    />
                  </div>

                  {/* Onboard Amenities / Facilities Section */}
                  <div className="border-border/50 space-y-3 border-t pt-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          What&apos;s Included
                        </Label>
                        <p className="text-muted-foreground mt-0.5 text-[10px]">
                          What passengers get with their ticket (e.g. WiFi, AC, Baggage)
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {editForm.amenities?.length || 0} selected
                      </span>
                    </div>

                    {/* Active Selected Tags with Remove (x) */}
                    <div className="border-border/80 bg-muted/20 flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl border border-dashed p-2">
                      {(editForm.amenities?.length || 0) > 0 ? (
                        editForm.amenities?.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs transition-all dark:text-emerald-300"
                          >
                            {getAmenityIcon(item)}
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeEditAmenity(item)}
                              className="ml-0.5 cursor-pointer rounded-full p-0.5 text-emerald-700 transition-colors hover:bg-emerald-500/30 dark:text-emerald-300"
                              title={`Remove ${item}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-muted-foreground px-1 text-[11px] italic">
                          No facilities selected yet. Type custom items below or click popular options.
                        </p>
                      )}
                    </div>

                    {/* Custom Input Field with Add Button */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" />
                        <Input
                          type="text"
                          placeholder="e.g. Life Jackets, AC Cabin, Scenic Sun Deck..."
                          value={editCustomAmenity}
                          onChange={(e) => setEditCustomAmenity(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleEditAddCustomAmenity();
                            }
                          }}
                          className="placeholder:text-muted-foreground h-8 pl-8 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleEditAddCustomAmenity}
                        disabled={!editCustomAmenity.trim()}
                        className="h-8 shrink-0 cursor-pointer border-emerald-500/40 px-3 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add Facility
                      </Button>
                    </div>

                    {/* Quick Suggestions - Only showing unselected options */}
                    <div className="space-y-1.5 pt-0.5">
                      <p className="text-muted-foreground text-[10px] font-medium">
                        Popular vessel features (click to add):
                      </p>
                      {unselectedEditSuggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {unselectedEditSuggestions.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleEditAmenity(item)}
                              className="border-border/80 bg-muted/30 text-muted-foreground flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                            >
                              {getAmenityIcon(item)}
                              <span>{item}</span>
                              <Plus className="text-muted-foreground ml-0.5 h-2.5 w-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-[10px] italic">
                          All popular amenities added. You can add more custom amenities above.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ferry Vessel Image Uploader */}
                  <div className="border-border/50 border-t pt-3 sm:col-span-2">
                    <VesselImageUploader
                      value={editForm.imageUrl || ""}
                      onChange={(url) => setEditForm((prev) => ({ ...prev, imageUrl: url }))}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="shrink-0 border-border/60 bg-muted/40 border-t px-6 py-3.5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingFerry(null)}
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
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete / Remove Confirmation Modal */}
      <Dialog open={!!deletingFerry} onOpenChange={(open) => !open && setDeletingFerry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Remove Ferry
                </DialogTitle>
                <DialogDescription className="text-xs">
                  This action removes the ferry from your active fleet.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              Are you sure you want to remove{" "}
              <span className="font-bold text-foreground">
                {deletingFerry?.name} ({deletingFerry?.registration})
              </span>{" "}
              from your registered ferries?
            </p>
            <p className="text-rose-600 dark:text-rose-400 font-medium">
              Note: If this ferry is currently assigned to future scheduled trips, removing it will
              require re-assigning those trips to another active ferry.
            </p>
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingFerry(null)}
              className="text-xs"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteFerry}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Removing...
                </>
              ) : (
                "Confirm Remove"
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-base font-bold">
                  Delete {selectedCount} {selectedCount === 1 ? "Ferry" : "Ferries"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to permanently delete {selectedCount} selected vessels from your fleet?
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
                  Deleting {selectedCount} Ferries...
                </>
              ) : (
                `Delete ${selectedCount} ${selectedCount === 1 ? "Ferry" : "Ferries"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
