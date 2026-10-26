"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  Ship,
  Ticket
} from "lucide-react";

import { useAdminProviderDetailQuery, useUpdateProviderStatusMutation } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label
} from "@/ui";

import {
  DashboardTableCard,
  FerryDetailsModal,
  StatCard,
  StatusBadge,
  type TableColumn
} from "../index";

export interface ProviderDetailsViewProps {
  providerId: string;
}

export interface ProviderFerryRow {
  id: string;
  name: string;
  registration?: string;
  type?: string;
  capacity: number;
  yearBuilt?: number;
  status: string;
}

export interface ProviderRouteRow {
  id: string;
  routeName: string;
  departurePort: string;
  arrivalPort: string;
  duration: string;
  isBorderCrossing?: boolean;
  dailyTrips?: number;
  price: number;
  status: string;
}

export interface ProviderBookingRow {
  id: string;
  bookingReference: string;
  passenger: string;
  route: string;
  travelDate: string;
  pax: number;
  amount: number;
  status: string;
}

export function ProviderDetailsView({ providerId }: ProviderDetailsViewProps) {
  const { data: provider, isLoading, isError, error, refetch } = useAdminProviderDetailQuery(providerId);
  const updateStatusMutation = useUpdateProviderStatusMutation();

  const [isSuspendModalOpen, setIsSuspendModalOpen] = React.useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = React.useState(false);
  const [selectedFerry, setSelectedFerry] = React.useState<ProviderFerryRow | null>(null);
  const [suspendReason, setSuspendReason] = React.useState("Scheduled Compliance & Safety Audit");

  const handleConfirmSuspend = () => {
    updateStatusMutation.mutate(
      {
        providerId,
        payload: {
          status: "SUSPENDED",
          reason: suspendReason
        }
      },
      {
        onSuccess: () => {
          setIsSuspendModalOpen(false);
        }
      }
    );
  };

  const handleConfirmActivate = () => {
    updateStatusMutation.mutate(
      {
        providerId,
        payload: {
          status: "ACTIVE"
        }
      },
      {
        onSuccess: () => {
          setIsActivateModalOpen(false);
        }
      }
    );
  };

  // Fleet Columns
  const ferryColumns: TableColumn<ProviderFerryRow>[] = [
    {
      header: "FERRY NAME",
      accessorKey: "name",
      className: "font-semibold text-foreground",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground text-xs sm:text-sm">{item.name}</div>
          {item.registration ? (
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Reg: {item.registration}
            </div>
          ) : null}
        </div>
      )
    },
    {
      header: "FERRY TYPE",
      accessorKey: "type",
      className: "text-muted-foreground",
      cell: (item) => item.type || "Passenger Ferry"
    },
    {
      header: "CAPACITY",
      className: "text-center font-medium text-foreground",
      align: "center",
      cell: (item) => `${item.capacity} Pax`
    },
    {
      header: "YEAR BUILT",
      className: "font-mono text-muted-foreground text-center",
      align: "center",
      cell: (item) => item.yearBuilt || "N/A"
    },
    {
      header: "STATUS",
      cell: (item) => {
        const rawStatus = item.status;
        const formattedStatus =
          rawStatus === "IN_SERVICE" || rawStatus === "In Service"
            ? "In Service"
            : rawStatus === "MAINTENANCE" || rawStatus === "Maintenance"
              ? "Maintenance"
              : rawStatus === "OUT_OF_SERVICE" || rawStatus === "Out of Service"
                ? "Docked"
                : rawStatus;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold border",
              formattedStatus === "In Service" &&
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/80",
              formattedStatus === "Maintenance" &&
                "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/80",
              formattedStatus === "Docked" &&
                "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/80"
            )}
          >
            {formattedStatus}
          </span>
        );
      }
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <button
          type="button"
          onClick={() => setSelectedFerry(item)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-colors cursor-pointer text-xs"
        >
          View Ferry
        </button>
      )
    }
  ];

  // Route Columns
  const routeColumns: TableColumn<ProviderRouteRow>[] = [
    {
      header: "ROUTE",
      accessorKey: "routeName",
      className: "font-semibold text-foreground",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground text-xs sm:text-sm">{item.routeName}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                item.isBorderCrossing
                  ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400"
                  : "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400"
              )}
            >
              {item.isBorderCrossing ? "International Corridor" : "Domestic Channel"}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "DEPARTURE → ARRIVAL",
      className: "text-muted-foreground text-xs",
      cell: (item) => `${item.departurePort} → ${item.arrivalPort}`
    },
    {
      header: "DURATION",
      accessorKey: "duration",
      className: "font-mono text-muted-foreground text-center",
      align: "center"
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-4 w-36 rounded bg-muted/50 mb-4" />
        <div className="h-44 rounded-2xl border border-border/60 bg-muted/20" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-border/40 bg-muted/20" />
          ))}
        </div>
        <div className="h-64 rounded-xl border border-border/40 bg-muted/20" />
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/admin/operators"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Operators</span>
        </Link>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-3">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Operator Not Found</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {error?.message || "Could not retrieve operator details from the backend."}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const isActive = provider.user?.status === "ACTIVE";

  const formattedFerries: ProviderFerryRow[] = (provider.ferries || []).map((f) => ({
    id: f.id,
    name: f.name,
    registration: f.registration,
    type: f.type || "Catamaran",
    capacity: f.capacity,
    yearBuilt: f.yearBuilt,
    status: f.status
  }));

  const formattedRoutes: ProviderRouteRow[] = (provider.routes || []).map((r) => ({
    id: r.id,
    routeName: `${r.departurePort?.name || "Departure"} ⇄ ${r.destinationPort?.name || "Destination"}`,
    departurePort: r.departurePort?.name || "Departure Port",
    arrivalPort: r.destinationPort?.name || "Destination Port",
    duration: r.durationMinutes ? `${r.durationMinutes}m` : r.duration || "45m",
    isBorderCrossing: r.isBorderCrossing,
    dailyTrips: r.dailyTrips || 2,
    price: r.basePrice || r.price || 40.0,
    status: r.status === "ACTIVE" ? "Active" : "Inactive"
  }));

  const registeredDateStr = provider.createdAt
    ? new Date(provider.createdAt).toLocaleDateString()
    : "Verified Member";

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin/operators"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Operators</span>
        </Link>
      </div>

      {/* Provider Header Banner Card */}
      <div className="bg-card text-card-foreground border-border/80 rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          {/* Provider Info Left Column */}
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm">
              <Ship className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {provider.companyName}
                </h1>
                <StatusBadge
                  status={isActive ? "Active" : "Suspended"}
                  className="text-xs px-3 py-1 font-bold"
                />
              </div>

              {/* Contact & Hub Details */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Contact:{" "}
                  <strong className="text-foreground">
                    {provider.contactPersonName || provider.user?.name || "N/A"}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Member Since: {registeredDateStr}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Hub Details Bar */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border/60 pt-5 sm:grid-cols-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Email Address</p>
              <a
                href={`mailto:${provider.contactEmail || provider.user?.email}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {provider.contactEmail || provider.user?.email || "N/A"}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Phone Number</p>
              <a
                href={`tel:${provider.user?.phoneNumber}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {provider.user?.phoneNumber || "N/A"}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Operating Base</p>
              <p className="font-semibold text-foreground truncate">
                {provider.businessAddress || "Main Port Terminal"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="FLEET FERRIES"
          value={formattedFerries.length}
          icon={Ship}
          changePercent={0}
          trend="neutral"
          comparisonText={`${formattedFerries.length} assigned`}
          showWave={true}
        />
        <StatCard
          label="OPERATING ROUTES"
          value={formattedRoutes.length}
          icon={MapPin}
          changePercent={0}
          trend="neutral"
          comparisonText="Active corridors"
          showWave={true}
        />
        <StatCard
          label="REVENUE SPLIT"
          value="90% Net"
          icon={DollarSign}
          changePercent={0}
          trend="up"
          comparisonText="10% platform commission"
          showWave={true}
        />
        <StatCard
          label="ACCOUNT STATUS"
          value={isActive ? "ACTIVE" : "SUSPENDED"}
          icon={ShieldAlert}
          changePercent={0}
          trend={isActive ? "up" : "down"}
          comparisonText={isActive ? "Live in public booking" : "Hidden from booking"}
          showWave={true}
        />
      </div>

      {/* Revenue Metrics & Commercial Settlement Model */}
      <div className="bg-card text-card-foreground border-border/80 rounded-2xl border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Revenue Metrics & Settlement Model
              </h3>
              <p className="text-xs text-muted-foreground">
                Commercial agreements, operator commission splits, and automated payouts.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 w-fit">
            Standard 90/10 Commission Split
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-1">
            <span className="text-muted-foreground font-medium">Operator Net Share</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">90.0%</p>
            <p className="text-[11px] text-muted-foreground">Direct net earnings from passenger tickets</p>
          </div>

          <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-1">
            <span className="text-muted-foreground font-medium">Platform Commission</span>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400">10.0%</p>
            <p className="text-[11px] text-muted-foreground">FerryGo booking service & hosting fee</p>
          </div>

          <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-1">
            <span className="text-muted-foreground font-medium">Settlement Schedule</span>
            <p className="text-xl font-black text-foreground">Weekly</p>
            <p className="text-[11px] text-muted-foreground">Direct bank deposit every Monday</p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Tables: Ferries Fleet & Operating Routes */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Fleet Ferries Table */}
        <DashboardTableCard
          title={`Registered Ferries (${formattedFerries.length})`}
          columns={ferryColumns}
          data={formattedFerries}
          keyExtractor={(item) => item.id}
          emptyMessage="No ferries assigned to this operator yet."
        />

        {/* Operating Routes Table */}
        <DashboardTableCard
          title={`Active Operating Routes (${formattedRoutes.length})`}
          columns={routeColumns}
          data={formattedRoutes}
          keyExtractor={(item) => item.id}
          emptyMessage="No routes configured for this operator yet."
        />
      </div>

      {/* Operator Account Management & Status Controls */}
      <div className="bg-card text-card-foreground border-border/80 rounded-2xl border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Operator Account Control & Operational Permissions
            </h3>
            <p className="text-xs text-muted-foreground">
              {isActive
                ? "This operator is active. Ferry schedules are live and customer reservations are open."
                : "This operator is suspended. Associated public trip schedules are hidden from booking."}
            </p>
          </div>

          <div className="shrink-0">
            {isActive ? (
              <Button
                variant="destructive"
                onClick={() => setIsSuspendModalOpen(true)}
                disabled={updateStatusMutation.isPending}
                className="gap-2 font-bold shadow-xs cursor-pointer text-xs"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>{updateStatusMutation.isPending ? "Updating..." : "Suspend Operator"}</span>
              </Button>
            ) : (
              <Button
                onClick={() => setIsActivateModalOpen(true)}
                disabled={updateStatusMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-xs cursor-pointer text-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{updateStatusMutation.isPending ? "Updating..." : "Reactivate Operator"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ferry Details Modal */}
      <FerryDetailsModal
        ferry={
          selectedFerry
            ? {
                id: selectedFerry.id,
                name: selectedFerry.name,
                type: selectedFerry.type || "Ferry",
                capacity: selectedFerry.capacity,
                yearBuilt: selectedFerry.yearBuilt || 2022,
                status: selectedFerry.status as any,
                providerName: provider.companyName
              }
            : null
        }
        open={!!selectedFerry}
        onOpenChange={(open) => {
          if (!open) setSelectedFerry(null);
        }}
      />

      {/* Confirmation Modal for Suspension */}
      <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg">Suspend Operator Account</DialogTitle>
            <DialogDescription className="text-center text-xs leading-relaxed">
              Are you sure you want to suspend <strong className="text-foreground">{provider.companyName}</strong>?
              This action will atomically cancel their unbooked upcoming schedules, preventing passengers from making new bookings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="suspend-reason" className="text-xs font-semibold">
              Reason for Suspension
            </Label>
            <Input
              id="suspend-reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Safety Audit, License Expiry, Service Violation"
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSuspendModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={updateStatusMutation.isPending}
              onClick={handleConfirmSuspend}
              className="gap-1.5"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{updateStatusMutation.isPending ? "Suspending..." : "Confirm Suspend"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Reactivation */}
      <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg">Reactivate Operator Account</DialogTitle>
            <DialogDescription className="text-center text-xs leading-relaxed">
              Are you sure you want to reactivate <strong className="text-foreground">{provider.companyName}</strong>?
              This will restore full operational status, allowing the operator to schedule new trips and manage routes.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={updateStatusMutation.isPending}
              onClick={handleConfirmActivate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{updateStatusMutation.isPending ? "Reactivating..." : "Confirm Reactivate"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
