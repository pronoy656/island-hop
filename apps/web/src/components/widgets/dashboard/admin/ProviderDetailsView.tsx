"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Ship,
  Ticket
} from "lucide-react";
import { toast } from "sonner";
import {
  PROVIDERS_DETAILS,
  type ProviderDetail,
  type ProviderFerry,
  type ProviderRoute,
  type RecentBookingItem
} from "@/data";
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

export function ProviderDetailsView({ providerId }: ProviderDetailsViewProps) {
  // Find provider or default to first provider
  const initialProvider =
    PROVIDERS_DETAILS.find((p) => p.id === providerId || p.provider.toLowerCase().includes(providerId.toLowerCase())) ||
    PROVIDERS_DETAILS[0];

  const [provider, setProvider] = React.useState<ProviderDetail>(initialProvider);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = React.useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = React.useState(false);
  const [selectedFerry, setSelectedFerry] = React.useState<ProviderFerry | null>(null);
  const [suspendReason, setSuspendReason] = React.useState("Scheduled Compliance & Safety Audit");

  const handleConfirmSuspend = () => {
    setProvider((prev) => ({ ...prev, status: "Suspended" }));
    setIsSuspendModalOpen(false);
    toast.error(`Provider "${provider.provider}" has been suspended.`, {
      description: `Reason: ${suspendReason}`
    });
  };

  const handleConfirmActivate = () => {
    setProvider((prev) => ({ ...prev, status: "Active" }));
    setIsActivateModalOpen(false);
    toast.success(`Provider "${provider.provider}" is now Active.`, {
      description: "Live routes and ticket reservations have been restored."
    });
  };

  // Fleet Columns
  const ferryColumns: TableColumn<ProviderFerry>[] = [
    {
      header: "VESSEL NAME",
      accessorKey: "name",
      className: "font-semibold text-foreground"
    },
    {
      header: "VESSEL TYPE",
      accessorKey: "type",
      className: "text-muted-foreground"
    },
    {
      header: "CAPACITY",
      className: "text-center font-medium text-foreground",
      align: "center",
      cell: (item) => `${item.capacity} Pax`
    },
    {
      header: "YEAR BUILT",
      accessorKey: "yearBuilt",
      className: "font-mono text-muted-foreground text-center",
      align: "center"
    },
    {
      header: "STATUS",
      cell: (item) => (
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold border",
            item.status === "In Service" &&
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/80",
            item.status === "Maintenance" &&
              "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/80",
            item.status === "Docked" &&
              "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/80"
          )}
        >
          {item.status}
        </span>
      )
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
  const routeColumns: TableColumn<ProviderRoute>[] = [
    {
      header: "ROUTE",
      accessorKey: "routeName",
      className: "font-semibold text-foreground"
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
      header: "DAILY TRIPS",
      accessorKey: "dailyTrips",
      className: "text-center font-medium text-foreground",
      align: "center"
    },
    {
      header: "BASE FARE",
      className: "font-bold text-foreground",
      cell: (item) => `$${item.price.toFixed(2)}`
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />
    }
  ];

  // Booking Columns
  const bookingColumns: TableColumn<RecentBookingItem>[] = [
    {
      header: "REFERENCE",
      accessorKey: "bookingReference",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300"
    },
    {
      header: "PASSENGER",
      accessorKey: "passenger",
      className: "font-semibold text-foreground"
    },
    {
      header: "ROUTE",
      accessorKey: "route",
      className: "text-foreground font-medium text-xs"
    },
    {
      header: "TRAVEL DATE",
      accessorKey: "travelDate",
      className: "font-mono text-muted-foreground text-[11px]"
    },
    {
      header: "PAX",
      accessorKey: "pax",
      className: "text-center text-foreground font-medium",
      align: "center"
    },
    {
      header: "AMOUNT",
      className: "font-bold text-foreground",
      cell: (item) => `$${item.amount.toFixed(2)}`
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />
    }
  ];

  const isActive = provider.status === "Active";

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin/providers"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Providers</span>
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
                  {provider.provider}
                </h1>
                <StatusBadge status={provider.status} className="text-xs px-3 py-1 font-bold" />
              </div>

              {/* Contact & Hub Details */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Contact: <strong className="text-foreground">{provider.contactPerson}</strong>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  License: <span className="font-mono">{provider.licenseNumber}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Member Since: {provider.registeredDate}
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
              <a href={`mailto:${provider.email}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                {provider.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Phone Number</p>
              <a href={`tel:${provider.phone}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                {provider.phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Operating Hub</p>
              <p className="font-semibold text-foreground truncate">{provider.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider-Specific Core KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="FLEET FERRIES"
          value={provider.totalFerries}
          icon={Ship}
          changePercent={16.7}
          trend="up"
          comparisonText={`${provider.ferries.filter((f) => f.status === "In Service").length} active`}
          showWave={true}
        />
        <StatCard
          label="ACTIVE ROUTES"
          value={provider.totalRoutes}
          icon={MapPin}
          changePercent={0}
          trend="neutral"
          comparisonText="Daily departures"
          showWave={true}
        />
        <StatCard
          label="TOTAL BOOKINGS"
          value={provider.totalBookings.toLocaleString()}
          icon={Ticket}
          changePercent={14.2}
          trend="up"
          comparisonText="vs last month"
          showWave={true}
        />
        <StatCard
          label="GROSS REVENUE"
          value={`$${provider.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          changePercent={18.5}
          trend="up"
          comparisonText="Gross tickets"
          showWave={true}
        />
      </div>

      {/* Side-by-Side Tables: Ferries Fleet & Operating Routes */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Fleet Ferries Table */}
        <DashboardTableCard
          title={`Registered Vessel Fleet (${provider.ferries.length})`}
          columns={ferryColumns}
          data={provider.ferries}
          keyExtractor={(item) => item.id}
        />

        {/* Operating Routes Table */}
        <DashboardTableCard
          title={`Active Operating Routes (${provider.routes.length})`}
          columns={routeColumns}
          data={provider.routes}
          keyExtractor={(item) => item.id}
        />
      </div>

      {/* Provider Recent Bookings */}
      <DashboardTableCard
        title={`Recent Bookings (${provider.recentBookings.length})`}
        columns={bookingColumns}
        data={provider.recentBookings}
        keyExtractor={(item) => item.id}
        emptyMessage="No recent bookings found for this provider."
      />

      {/* Provider Account Management & Status Controls at the Bottom */}
      <div className="bg-card text-card-foreground border-border/80 rounded-2xl border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Provider Account Control & Verification Status
            </h3>
            <p className="text-xs text-muted-foreground">
              {isActive
                ? "This provider is currently active with operational ferry schedules and live passenger bookings."
                : "This provider account is currently suspended. Operational routes and ticket sales are paused."}
            </p>
          </div>

          <div className="shrink-0">
            {isActive ? (
              <Button
                variant="destructive"
                onClick={() => setIsSuspendModalOpen(true)}
                className="gap-2 font-bold shadow-xs cursor-pointer text-xs"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Suspend Provider</span>
              </Button>
            ) : (
              <Button
                onClick={() => setIsActivateModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-xs cursor-pointer text-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Reactivate Provider</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ferry Details Modal */}
      <FerryDetailsModal
        ferry={selectedFerry ? { ...selectedFerry, providerName: provider.provider } : null}
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
            <DialogTitle className="text-center text-lg">Suspend Provider Account</DialogTitle>
            <DialogDescription className="text-center text-xs leading-relaxed">
              Are you sure you want to suspend <strong className="text-foreground">{provider.provider}</strong>?
              This action will immediately disable their live ferry routes, prevent passengers from booking tickets, and temporarily pause pending disbursements.
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
              onClick={handleConfirmSuspend}
              className="gap-1.5"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Confirm Suspend</span>
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
            <DialogTitle className="text-center text-lg">Reactivate Provider Account</DialogTitle>
            <DialogDescription className="text-center text-xs leading-relaxed">
              Are you sure you want to reactivate <strong className="text-foreground">{provider.provider}</strong>?
              This will restore full platform permissions, re-enable their scheduled routes, and make ferry tickets available to passengers immediately.
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
              onClick={handleConfirmActivate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Confirm Reactivate</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
