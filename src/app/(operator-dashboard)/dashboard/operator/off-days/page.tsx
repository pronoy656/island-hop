"use client";

import * as React from "react";
import {
  AlertTriangle,
  Anchor,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarX,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudLightning,
  Edit,
  Globe,
  Info,
  Landmark,
  List,
  Loader2,
  Plus,
  ShieldAlert,
  Ship,
  Trash2,
  Wrench,
  X
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isSameDay, isAfter, isBefore, startOfDay, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import type {
  ICreateOffDayPayload,
  IFerry,
  IOffDay,
  IOffDayFilterParams,
  IUpdateOffDayPayload,
  OffDayCategory
} from "@/types";
import {
  useCreateOffDayMutation,
  useDeleteOffDayMutation,
  useFerriesQuery,
  useOffDaysQuery,
  useOperatorSchedulesQuery,
  useUpdateOffDayMutation
} from "@/hooks";
import {
  Button,
  Card,
  CardContent,
  DatePicker,
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
import { DashboardTableCard, type TableColumn } from "@/widgets";

const CATEGORY_OPTIONS: Array<{ value: OffDayCategory; label: string; icon: string }> = [
  {
    value: "MAINTENANCE",
    label: "Ferry Maintenance & Repairs",
    icon: "🔧"
  },
  {
    value: "WEATHER",
    label: "Severe Weather / Storm Warning",
    icon: "🌊"
  },
  {
    value: "PUBLIC_HOLIDAY",
    label: "Public Holiday & Festivals",
    icon: "🏛️"
  }
];

const FILTER_CATEGORY_OPTIONS = [
  { value: "ALL", label: "All Categories" },
  { value: "MAINTENANCE", label: "🔧 Maintenance & Repairs" },
  { value: "WEATHER", label: "🌊 Weather Closures" },
  { value: "PUBLIC_HOLIDAY", label: "🏛️ Public Holidays" }
];

const PAGE_SIZE_OPTIONS = [
  { value: "5", label: "5 per page" },
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

function getCategoryConfig(category: OffDayCategory) {
  switch (category) {
    case "MAINTENANCE":
      return {
        label: "Maintenance & Repair",
        badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
        icon: Wrench
      };
    case "WEATHER":
      return {
        label: "Severe Weather Closure",
        badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
        icon: CloudLightning
      };
    case "PUBLIC_HOLIDAY":
      return {
        label: "Public Holiday",
        badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
        icon: Landmark
      };
    default:
      return {
        label: category,
        badgeClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
        icon: CalendarX
      };
  }
}

function getOperationalStatus(dateStr: string) {
  try {
    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(dateStr));

    if (isSameDay(today, target)) {
      return {
        status: "ACTIVE_TODAY",
        label: "Active Today",
        className: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 animate-pulse font-semibold"
      };
    }
    if (isAfter(target, today)) {
      return {
        status: "SCHEDULED",
        label: "Scheduled",
        className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-medium"
      };
    }
    return {
      status: "COMPLETED",
      label: "Completed",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700 font-medium"
    };
  } catch {
    return {
      status: "SCHEDULED",
      label: "Scheduled",
      className: "bg-slate-100 text-slate-600 border-slate-200"
    };
  }
}

/**
 * Calendar Date Badge (Tear-Sheet Style)
 * Renders month ribbon on top and prominent bold day number on bottom
 */
function CalendarDateBadge({
  date,
  className,
  category
}: {
  date: string | Date;
  className?: string;
  category?: OffDayCategory;
}) {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const monthStr = format(dateObj, "MMM").toUpperCase();
    const dayStr = format(dateObj, "d");

    const isMaintenance = category === "MAINTENANCE";
    const isWeather = category === "WEATHER";

    const ribbonClasses = isMaintenance
      ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/40"
      : isWeather
        ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/40"
        : "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/40";

    return (
      <div
        className={cn(
          "w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900",
          className
        )}
      >
        <div
          className={cn(
            "py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-b",
            ribbonClasses
          )}
        >
          {monthStr}
        </div>
        <div className="py-1 text-base font-extrabold text-slate-800 dark:text-white leading-none">
          {dayStr}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

export default function OperatorOffDaysPage() {
  // View mode: 'ledger' (Table) or 'calendar' (Visual Grid)
  const [viewMode, setViewMode] = React.useState<"ledger" | "calendar">("ledger");

  // Filters
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [selectedFerryId, setSelectedFerryId] = React.useState<string>("ALL");

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Calendar month state
  const [calendarDate, setCalendarDate] = React.useState<Date>(new Date());

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingOffDay, setEditingOffDay] = React.useState<IOffDay | null>(null);
  const [deletingOffDay, setDeletingOffDay] = React.useState<IOffDay | null>(null);

  // Form mode: single date vs multi-day date range (Drydock Window)
  const [isRangeMode, setIsRangeMode] = React.useState(false);
  const [newOffDay, setNewOffDay] = React.useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    reason: "",
    category: "MAINTENANCE" as OffDayCategory,
    ferryId: "ALL" // 'ALL' = entire fleet, or ferry UUID
  });

  const [editForm, setEditForm] = React.useState({
    date: format(new Date(), "yyyy-MM-dd"),
    reason: "",
    category: "MAINTENANCE" as OffDayCategory,
    ferryId: "ALL"
  });

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedFerryId, pageSize]);

  // Overall query for stats & calendar view
  const { data: allOffDaysResponse } = useOffDaysQuery({
    limit: 100,
    year: calendarDate.getFullYear()
  });

  // Paginated query for table view
  const {
    data: offDaysResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useOffDaysQuery({
    category: selectedCategory !== "ALL" ? (selectedCategory as OffDayCategory) : undefined,
    ferryId: selectedFerryId !== "ALL" ? selectedFerryId : undefined,
    page,
    limit: pageSize
  });

  // Registered Ferries (to select real fleet vessels)
  const { data: ferriesResponse } = useFerriesQuery({ limit: 100 });
  const ferries: IFerry[] = ferriesResponse?.ferries ?? [];

  // Live schedule conflict check for the selected start date
  const checkDate = isAddModalOpen ? newOffDay.startDate : editingOffDay ? editForm.date : undefined;
  const { data: scheduleConflictData } = useOperatorSchedulesQuery(
    checkDate ? { date: checkDate, limit: 10 } : undefined
  );
  const activeSchedulesOnDate = scheduleConflictData?.schedules ?? [];

  // Mutations
  const createMutation = useCreateOffDayMutation();
  const updateMutation = useUpdateOffDayMutation();
  const deleteMutation = useDeleteOffDayMutation();

  // Active items
  const offDays = offDaysResponse?.offDays ?? [];
  const meta = offDaysResponse?.meta;
  const totalCount = meta?.total ?? offDays.length;
  const totalPages = Math.max(1, meta?.totalPages ?? Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Stats calculation
  const allList = allOffDaysResponse?.offDays ?? offDays;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const activeTodayCount = allList.filter((d) => {
    try {
      return isSameDay(parseISO(d.date), new Date());
    } catch {
      return false;
    }
  }).length;

  const upcomingCount = allList.filter((d) => {
    try {
      return isAfter(startOfDay(parseISO(d.date)), startOfDay(new Date()));
    } catch {
      return false;
    }
  }).length;

  const totalYtdCount = allOffDaysResponse?.meta?.total ?? allList.length;

  // Pagination bounds
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

  // Ferry options formatted with real vessel metadata
  const ferryOptions = React.useMemo(() => {
    return [
      { value: "ALL", label: "🌐 Entire Fleet (All Ferries & Routes)" },
      ...ferries.map((f) => ({
        value: f.id,
        label: `🚢 ${f.name} (${f.capacity} seats · ${f.type})`
      }))
    ];
  }, [ferries]);

  // Form Handlers
  const handleAddOffDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffDay.reason.trim() || newOffDay.reason.trim().length < 3) {
      toast.error("Please enter a reason (min 3 characters).");
      return;
    }

    try {
      const selectedFerryUuid = newOffDay.ferryId !== "ALL" ? newOffDay.ferryId : undefined;

      if (!isRangeMode) {
        // Single date
        await createMutation.mutateAsync({
          date: newOffDay.startDate,
          reason: newOffDay.reason.trim(),
          category: newOffDay.category,
          ferryId: selectedFerryUuid
        });
        toast.success(`Off-day scheduled for ${newOffDay.startDate} successfully!`);
      } else {
        // Multi-day date range (Maintenance Window)
        const start = parseISO(newOffDay.startDate);
        const end = parseISO(newOffDay.endDate);

        if (isAfter(start, end)) {
          toast.error("End Date cannot be earlier than Start Date.");
          return;
        }

        const datesToCreate: string[] = [];
        let curr = start;
        while (!isAfter(curr, end)) {
          datesToCreate.push(format(curr, "yyyy-MM-dd"));
          curr = addDays(curr, 1);
        }

        if (datesToCreate.length > 31) {
          toast.error("An off-day period cannot exceed 31 consecutive days.");
          return;
        }

        const toastId = toast.loading(`Scheduling ${datesToCreate.length} consecutive off-days...`);
        await Promise.all(
          datesToCreate.map((d) =>
            createMutation.mutateAsync({
              date: d,
              reason: newOffDay.reason.trim(),
              category: newOffDay.category,
              ferryId: selectedFerryUuid
            })
          )
        );
        toast.dismiss(toastId);
        toast.success(
          `${datesToCreate.length} off-days scheduled from ${newOffDay.startDate} to ${newOffDay.endDate}!`
        );
      }

      setPage(1);
      await refetch();
      setIsAddModalOpen(false);
      setNewOffDay({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        reason: "",
        category: "MAINTENANCE",
        ferryId: "ALL"
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleOpenEdit = (item: IOffDay) => {
    setEditingOffDay(item);
    setEditForm({
      date: format(parseISO(item.date), "yyyy-MM-dd"),
      reason: item.reason,
      category: item.category,
      ferryId: item.ferryId || "ALL"
    });
  };

  const handleUpdateOffDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffDay) return;

    if (!editForm.reason.trim() || editForm.reason.trim().length < 3) {
      toast.error("Please enter a reason (min 3 characters).");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingOffDay.id,
        payload: {
          date: editForm.date,
          reason: editForm.reason.trim(),
          category: editForm.category,
          ferryId: editForm.ferryId !== "ALL" ? editForm.ferryId : null
        }
      });

      toast.success("Off-day record updated successfully!");
      await refetch();
      setEditingOffDay(null);
    } catch {
      // Handled in mutation
    }
  };

  const handleDeleteOffDay = async () => {
    if (!deletingOffDay) return;

    try {
      await deleteMutation.mutateAsync(deletingOffDay.id);
      toast.success("Off-day removed successfully. Booking slots reopened.");
      await refetch();
      setDeletingOffDay(null);
    } catch {
      // Handled in mutation
    }
  };

  // Table Columns
  const offDayColumns: TableColumn<IOffDay>[] = [
    {
      header: "DATE",
      cell: (item) => {
        const dateObj = parseISO(item.date);
        return (
          <div className="flex items-center gap-3">
            <CalendarDateBadge date={item.date} category={item.category} />
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-xs sm:text-sm">
                {format(dateObj, "MMM dd, yyyy")}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {format(dateObj, "EEEE")}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: "REASON",
      cell: (item) => (
        <div className="max-w-[280px]">
          <p className="font-semibold text-foreground text-xs truncate" title={item.reason}>
            {item.reason}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Declared on {format(parseISO(item.createdAt), "MMM dd, yyyy")}
          </p>
        </div>
      )
    },
    {
      header: "CATEGORY",
      cell: (item) => {
        const config = getCategoryConfig(item.category);
        const IconComponent = config.icon;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
              config.badgeClass
            )}
          >
            <IconComponent className="h-3 w-3 shrink-0" />
            <span>{config.label}</span>
          </span>
        );
      }
    },
    {
      header: "FERRY",
      cell: (item) => {
        if (item.ferry) {
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Ship className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-xs">{item.ferry.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {item.ferry.registration}
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-xs">Entire Fleet</p>
              <p className="text-[10px] text-muted-foreground">All ferries & routes</p>
            </div>
          </div>
        );
      }
    },
    {
      header: "STATUS",
      cell: (item) => {
        const statusMeta = getOperationalStatus(item.date);
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border",
              statusMeta.className
            )}
          >
            {statusMeta.label}
          </span>
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
            size="icon"
            onClick={() => handleOpenEdit(item)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold h-8 w-8 rounded-lg"
            title="Edit Off-Day Details"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeletingOffDay(item)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-semibold h-8 w-8 rounded-lg"
            title="Remove Off-Day"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Calendar days grid computation
  const calendarDays = React.useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Leading padding from prev month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= lastDay.getDate(); dayNum++) {
      const current = new Date(year, month, dayNum);
      const currentIso = format(current, "yyyy-MM-dd");

      const dayBlackouts = allList.filter((b) => {
        try {
          return format(parseISO(b.date), "yyyy-MM-dd") === currentIso;
        } catch {
          return false;
        }
      });

      days.push({
        date: current,
        iso: currentIso,
        isCurrentMonth: true,
        blackouts: dayBlackouts,
        isToday: isSameDay(current, new Date())
      });
    }

    return days;
  }, [calendarDate, allList]);

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Off-Days & Maintenance
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage scheduled ferry maintenance windows, severe weather port closures, and holiday service closures.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Schedule Off-Day
        </Button>
      </div>

      {/* Operational Stat Cards (3 symmetric columns) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Off Today</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {activeTodayCount} {activeTodayCount === 1 ? "Ferry" : "Ferries"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Currently inactive today</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Upcoming Off-Days</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {upcomingCount} Scheduled
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Planned maintenance & holidays</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Days This Year</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {totalYtdCount} Days
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Scheduled in calendar year {calendarDate.getFullYear()}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheckIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
        {/* Left: Category & Ferry Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
          <ReusableSelect
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            options={FILTER_CATEGORY_OPTIONS}
            className="w-[190px] h-8 text-xs"
          />

          <ReusableSelect
            value={selectedFerryId}
            onValueChange={setSelectedFerryId}
            options={ferryOptions}
            className="w-[220px] h-8 text-xs"
          />
        </div>

        {/* Right: View Toggle (Ledger Table vs Visual Calendar) */}
        <div className="flex items-center gap-1.5 self-end lg:self-auto border border-border/80 p-0.5 rounded-lg bg-muted/40">
          <Button
            type="button"
            size="sm"
            variant={viewMode === "ledger" ? "default" : "ghost"}
            onClick={() => setViewMode("ledger")}
            className={cn(
              "h-7 text-xs px-2.5 font-semibold",
              viewMode === "ledger" ? "bg-card text-foreground shadow-2xs border border-border/60" : "text-muted-foreground"
            )}
          >
            <List className="h-3.5 w-3.5 mr-1.5" />
            List View
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "calendar" ? "default" : "ghost"}
            onClick={() => setViewMode("calendar")}
            className={cn(
              "h-7 text-xs px-2.5 font-semibold",
              viewMode === "calendar" ? "bg-card text-foreground shadow-2xs border border-border/60" : "text-muted-foreground"
            )}
          >
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Calendar View
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "ledger" ? (
        /* TABLE LIST VIEW */
        isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Loading off-days schedule...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
            <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
            <h3 className="text-sm font-bold text-foreground">Failed to load off-days</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium max-w-md mt-1">
              {error instanceof Error ? error.message : "Could not fetch off-days from the server."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs font-semibold mt-4"
            >
              Retry Connection
            </Button>
          </div>
        ) : offDays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border/80 shadow-xs text-center px-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <CalendarCheckIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No off-days scheduled</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Your fleet is currently operating normally with no active maintenance or closures.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Schedule Off-Day
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <DashboardTableCard
              title="Off-Days & Maintenance Schedule"
              columns={offDayColumns}
              data={offDays}
              keyExtractor={(item) => item.id}
            />

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-card p-3 sm:px-4 rounded-xl border border-border/80 shadow-xs">
                {/* Left: Showing entries info & Page size selector */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground w-full sm:w-auto justify-between sm:justify-start">
                  <span>
                    Showing <span className="font-semibold text-foreground">{startIndex}</span> to{" "}
                    <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalCount}</span> scheduled off-days
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
                    disabled={currentPage <= 1 || isFetching}
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
                          disabled={isFetching}
                          className={cn(
                            "h-8 min-w-8 px-2 text-xs font-semibold",
                            currentPage === p
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
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
                    disabled={currentPage >= totalPages || isFetching}
                    className="h-8 px-2.5 text-xs flex items-center gap-1 font-medium"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* CALENDAR MONTHLY VIEW */
        <div className="space-y-4">
          {/* Calendar Month Navigation */}
          <div className="flex items-center justify-between bg-card p-3.5 rounded-xl border border-border/80 shadow-xs">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-foreground">
                {format(calendarDate, "MMMM yyyy")}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCalendarDate(new Date())}
                className="h-8 px-2.5 text-xs font-semibold"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 7-Day Grid */}
          <div className="bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border/80 bg-muted/30 text-center py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60">
              {calendarDays.map((dayItem, idx) => {
                if (!dayItem.isCurrentMonth || !dayItem.date) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[100px] p-2 bg-muted/10 opacity-40 select-none"
                    />
                  );
                }

                const dayBlackouts = dayItem.blackouts || [];
                const hasBlackouts = dayBlackouts.length > 0;

                return (
                  <div
                    key={dayItem.iso}
                    onClick={() => {
                      if (!hasBlackouts) {
                        setNewOffDay((prev) => ({
                          ...prev,
                          startDate: dayItem.iso,
                          endDate: dayItem.iso
                        }));
                        setIsAddModalOpen(true);
                      }
                    }}
                    className={cn(
                      "min-h-[100px] p-2 flex flex-col justify-between transition-colors cursor-pointer hover:bg-muted/30",
                      dayItem.isToday && "bg-emerald-500/5 ring-1 ring-emerald-500/40 inset-0",
                      hasBlackouts && "bg-amber-500/[0.03]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-bold rounded-md h-6 w-6 flex items-center justify-center",
                          dayItem.isToday
                            ? "bg-emerald-600 text-white font-extrabold shadow-xs"
                            : "text-foreground"
                        )}
                      >
                        {format(dayItem.date, "d")}
                      </span>

                      {hasBlackouts && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          {dayBlackouts.length} {dayBlackouts.length === 1 ? "ferry" : "ferries"}
                        </span>
                      )}
                    </div>

                    {/* Blackout Badges inside the day */}
                    <div className="space-y-1 mt-1 flex-1">
                      {dayBlackouts.map((b) => {
                        const catConfig = getCategoryConfig(b.category);
                        return (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(b);
                            }}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border flex items-center gap-1 shadow-2xs cursor-pointer hover:opacity-85",
                              catConfig.badgeClass
                            )}
                            title={`${catConfig.label}: ${b.reason} (${b.ferry?.name || "Entire Fleet"})`}
                          >
                            <span>{b.ferry ? `🚢 ${b.ferry.name}` : "🌐 All Fleet"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE OFF-DAY MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CalendarX className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Schedule Off-Day or Maintenance
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Set off-days for ferry maintenance, severe weather, or public holidays.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddOffDay} className="space-y-4 py-2">
            {/* Window Type Selector: Single Day vs Date Range */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border/80 flex items-center justify-between gap-3">
              <div>
                <Label className="text-xs font-bold text-foreground block">
                  Off-Day Duration Mode
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Choose between a single day or a multi-day date range.
                </p>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border/60 bg-background">
                <Button
                  type="button"
                  size="sm"
                  variant={!isRangeMode ? "default" : "ghost"}
                  onClick={() => setIsRangeMode(false)}
                  className={cn(
                    "h-7 text-xs px-2.5 font-semibold",
                    !isRangeMode ? "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs" : "text-muted-foreground"
                  )}
                >
                  Single Day
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isRangeMode ? "default" : "ghost"}
                  onClick={() => setIsRangeMode(true)}
                  className={cn(
                    "h-7 text-xs px-2.5 font-semibold",
                    isRangeMode ? "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs" : "text-muted-foreground"
                  )}
                >
                  Date Range
                </Button>
              </div>
            </div>

            {/* Date Pickers */}
            {!isRangeMode ? (
              <div className="space-y-1.5">
                <Label htmlFor="off-day-date" className="text-xs font-semibold text-foreground">
                  Date *
                </Label>
                <div className="flex items-center gap-3">
                  <CalendarDateBadge date={newOffDay.startDate} category={newOffDay.category} />
                  <div className="flex-1">
                    <DatePicker
                      id="off-day-date"
                      value={newOffDay.startDate}
                      onChange={(val) => setNewOffDay((prev) => ({ ...prev, startDate: val, endDate: val }))}
                      placeholder="Select date"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start-date" className="text-xs font-semibold text-foreground">
                    Start Date *
                  </Label>
                  <div className="flex items-center gap-2.5">
                    <CalendarDateBadge date={newOffDay.startDate} category={newOffDay.category} />
                    <div className="flex-1">
                      <DatePicker
                        id="start-date"
                        value={newOffDay.startDate}
                        onChange={(val) => setNewOffDay((prev) => ({ ...prev, startDate: val }))}
                        placeholder="Start date"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-date" className="text-xs font-semibold text-foreground">
                    End Date *
                  </Label>
                  <div className="flex items-center gap-2.5">
                    <CalendarDateBadge date={newOffDay.endDate} category={newOffDay.category} />
                    <div className="flex-1">
                      <DatePicker
                        id="end-date"
                        value={newOffDay.endDate}
                        onChange={(val) => setNewOffDay((prev) => ({ ...prev, endDate: val }))}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Affected Ferry (Real Registered Fleet) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Ferry *</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  ({ferries.length} registered ferries in fleet)
                </span>
              </Label>
              <ReusableSelect
                value={newOffDay.ferryId}
                onValueChange={(val) => setNewOffDay((prev) => ({ ...prev, ferryId: val }))}
                options={ferryOptions}
                placeholder="Select ferry..."
              />
              <p className="text-[10px] text-muted-foreground">
                Select a specific ferry for maintenance or choose "Entire Fleet" for weather closures or public holidays.
              </p>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Reason Category *
              </Label>
              <ReusableSelect
                value={newOffDay.category}
                onValueChange={(val) => setNewOffDay((prev) => ({ ...prev, category: val as OffDayCategory }))}
                options={CATEGORY_OPTIONS}
                placeholder="Select category..."
              />
            </div>

            {/* Reason / Description */}
            <div className="space-y-1.5">
              <Label htmlFor="reason-desc" className="text-xs font-semibold text-foreground">
                Reason / Description *
              </Label>
              <Input
                id="reason-desc"
                placeholder="e.g. Engine Maintenance, Annual Overhaul, or Storm Warning"
                value={newOffDay.reason}
                onChange={(e) => setNewOffDay((prev) => ({ ...prev, reason: e.target.value }))}
                required
                className="text-xs h-9"
              />
              <p className="text-[10px] text-muted-foreground">
                Provide details for passenger customer service and fleet log records.
              </p>
            </div>

            {/* Live Consequence Warning (Ripple Effect) */}
            {activeSchedulesOnDate.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">
                    ⚠️ Booking Availability Notice
                  </p>
                  <p className="text-[11px] mt-0.5 text-amber-700/90 dark:text-amber-300/90">
                    There {activeSchedulesOnDate.length === 1 ? "is" : "are"}{" "}
                    <span className="font-bold">{activeSchedulesOnDate.length} published trip schedule(s)</span> on this date.
                    Scheduling this off-day will block new booking sales. Please check the Schedules dashboard to notify affected passengers if needed.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Schedule Off-Day
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={!!editingOffDay} onOpenChange={(open) => !open && setEditingOffDay(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Off-Day
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update off-day details, category, or affected ferry.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdateOffDay} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-date" className="text-xs font-semibold text-foreground">
                Date *
              </Label>
              <div className="flex items-center gap-3">
                <CalendarDateBadge date={editForm.date} category={editForm.category} />
                <div className="flex-1">
                  <DatePicker
                    id="edit-date"
                    value={editForm.date}
                    onChange={(val) => setEditForm((prev) => ({ ...prev, date: val }))}
                    placeholder="Select date"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Ferry</Label>
              <ReusableSelect
                value={editForm.ferryId}
                onValueChange={(val) => setEditForm((prev) => ({ ...prev, ferryId: val }))}
                options={ferryOptions}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Category</Label>
              <ReusableSelect
                value={editForm.category}
                onValueChange={(val) => setEditForm((prev) => ({ ...prev, category: val as OffDayCategory }))}
                options={CATEGORY_OPTIONS}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-reason" className="text-xs font-semibold text-foreground">
                Reason / Description *
              </Label>
              <Input
                id="edit-reason"
                value={editForm.reason}
                onChange={(e) => setEditForm((prev) => ({ ...prev, reason: e.target.value }))}
                required
                className="text-xs h-9"
              />
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
                disabled={updateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE / REMOVE OFF-DAY CONFIRMATION MODAL */}
      <Dialog open={!!deletingOffDay} onOpenChange={(open) => !open && setDeletingOffDay(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Remove Off-Day?
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to remove this off-day and reopen booking availability?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deletingOffDay && (
            <div className="flex items-center gap-3.5 p-3.5 bg-muted/30 rounded-xl border border-border/60">
              <CalendarDateBadge date={deletingOffDay.date} category={deletingOffDay.category} />
              <div className="text-xs space-y-1 flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">
                  {format(parseISO(deletingOffDay.date), "EEEE, MMMM dd, yyyy")}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Ferry:</span>{" "}
                  {deletingOffDay.ferry?.name || "Entire Fleet"}
                </p>
                <p className="text-muted-foreground truncate">
                  <span className="font-semibold text-foreground">Reason:</span>{" "}
                  {deletingOffDay.reason}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingOffDay(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteOffDay}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
            >
              {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Remove & Reopen Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}
