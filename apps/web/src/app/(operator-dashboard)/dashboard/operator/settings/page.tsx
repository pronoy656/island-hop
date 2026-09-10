"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  GitFork,
  Map,
  Plus,
  PlusCircle,
  Ship,
  Trash2,
  X
} from "lucide-react";
import { toast } from "sonner";
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

interface OffDayItem {
  id: string;
  month: string;
  day: string;
  monthColor: "rose" | "slate";
  title: string;
  subtitle: string;
}

interface RouteZoneItem {
  id: string;
  title: string;
  departure: string;
  destination: string;
  status: "Active" | "Seasonal" | "Inactive";
  type: "primary" | "secondary";
}

export default function OperatorSettingsPage() {
  // Company info state
  const [companyInfo, setCompanyInfo] = React.useState({
    providerName: "Oceanic Ferries Ltd.",
    contactEmail: "operations@oceanicferries.com",
    businessAddress: "120 Harbor View Dr, Seattle, WA 98104"
  });
  const [isSavingCompany, setIsSavingCompany] = React.useState(false);

  // Schedule defaults state
  const [autoScheduling, setAutoScheduling] = React.useState(true);
  const [bufferTime, setBufferTime] = React.useState("30 Mins");
  const [isBufferModalOpen, setIsBufferModalOpen] = React.useState(false);

  // Active route zones state
  const [routes, setRoutes] = React.useState<RouteZoneItem[]>([
    {
      id: "rt-1",
      title: "North Sound Line",
      departure: "Seattle",
      destination: "San Juan Islands",
      status: "Active",
      type: "primary"
    },
    {
      id: "rt-2",
      title: "Coastal Express",
      departure: "Seattle",
      destination: "Victoria, BC",
      status: "Seasonal",
      type: "secondary"
    }
  ]);
  const [isRouteModalOpen, setIsRouteModalOpen] = React.useState(false);
  const [newRoute, setNewRoute] = React.useState({
    title: "",
    departure: "Seattle",
    destination: "",
    status: "Active" as "Active" | "Seasonal"
  });

  // Operational off days state
  const [offDays, setOffDays] = React.useState<OffDayItem[]>([
    {
      id: "off-1",
      month: "DEC",
      day: "25",
      monthColor: "rose",
      title: "Christmas Day",
      subtitle: "Fleet-wide holiday"
    },
    {
      id: "off-2",
      month: "JAN",
      day: "15",
      monthColor: "slate",
      title: "Scheduled Maintenance",
      subtitle: "North Sound Line vessels only"
    }
  ]);
  const [isOffDayModalOpen, setIsOffDayModalOpen] = React.useState(false);
  const [newOffDay, setNewOffDay] = React.useState({
    date: "",
    title: "",
    subtitle: "Fleet-wide holiday"
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    setTimeout(() => {
      setIsSavingCompany(false);
      toast.success("Company information saved successfully!");
    }, 400);
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.title || !newRoute.destination) {
      toast.error("Please fill in all route details.");
      return;
    }

    const created: RouteZoneItem = {
      id: `rt-${Date.now()}`,
      title: newRoute.title,
      departure: newRoute.departure,
      destination: newRoute.destination,
      status: newRoute.status,
      type: newRoute.status === "Active" ? "primary" : "secondary"
    };

    setRoutes((prev) => [...prev, created]);
    setIsRouteModalOpen(false);
    setNewRoute({
      title: "",
      departure: "Seattle",
      destination: "",
      status: "Active"
    });
    toast.success(`Route "${created.title}" added to active zones!`);
  };

  const handleAddOffDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffDay.title || !newOffDay.date) {
      toast.error("Please enter a title and select a date.");
      return;
    }

    const parsedDate = new Date(newOffDay.date);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[parsedDate.getMonth()] || "JAN";
    const day = String(parsedDate.getDate());

    const created: OffDayItem = {
      id: `off-${Date.now()}`,
      month,
      day,
      monthColor: month === "DEC" || month === "JUL" ? "rose" : "slate",
      title: newOffDay.title,
      subtitle: newOffDay.subtitle || "Fleet-wide holiday"
    };

    setOffDays((prev) => [...prev, created]);
    setIsOffDayModalOpen(false);
    setNewOffDay({ date: "", title: "", subtitle: "Fleet-wide holiday" });
    toast.success(`Off day "${created.title}" added successfully!`);
  };

  const handleDeleteOffDay = (id: string, title: string) => {
    setOffDays((prev) => prev.filter((item) => item.id !== id));
    toast.info(`Removed "${title}" from operational off days.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* 1. Company Information Card */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Soft top-right decorative shape */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-100/50 blur-xl dark:bg-blue-900/20"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <Building2 className="h-5 w-5" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Company Information
            </h2>
          </div>

          <form onSubmit={handleSaveCompany} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="providerName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Provider Name
                </Label>
                <Input
                  id="providerName"
                  value={companyInfo.providerName}
                  onChange={(e) => setCompanyInfo((prev) => ({ ...prev, providerName: e.target.value }))}
                  required
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={companyInfo.contactEmail}
                  onChange={(e) => setCompanyInfo((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  required
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Business Address
              </Label>
              <Input
                id="businessAddress"
                value={companyInfo.businessAddress}
                onChange={(e) => setCompanyInfo((prev) => ({ ...prev, businessAddress: e.target.value }))}
                required
                className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSavingCompany}
                className="h-9 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                {isSavingCompany ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Schedule Defaults Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <Clock className="h-5 w-5" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Schedule Defaults
            </h2>
          </div>
          <Link
            href="/dashboard/operator/schedules"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Manage All
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {/* Row 1: Auto-Scheduling toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Enable Auto-Scheduling
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically generate schedules based on past patterns.
              </p>
            </div>
            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={autoScheduling}
              onClick={() => {
                const nextVal = !autoScheduling;
                setAutoScheduling(nextVal);
                toast.success(
                  nextVal
                    ? "Auto-scheduling enabled."
                    : "Auto-scheduling disabled."
                );
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                autoScheduling ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                  autoScheduling ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Row 2: Default Buffer Time */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Default Buffer Time
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Time allocated between arrival and next departure.
              </p>
            </div>
            {/* Buffer button/selector */}
            <button
              type="button"
              onClick={() => setIsBufferModalOpen(true)}
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors"
            >
              {bufferTime}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Active Route Zones Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
          <GitFork className="h-5 w-5" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Active Route Zones
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {routes.map((route) => (
            <div
              key={route.id}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-800/50"
            >
              {/* Badge */}
              <div className="flex justify-end">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    route.status === "Active"
                      ? "bg-cyan-50 text-cyan-700 border border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800"
                      : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                  }`}
                >
                  {route.status}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="mt-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full mb-3.5 ${
                    route.type === "primary"
                      ? "bg-[#0b192c] text-white dark:bg-slate-700"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {route.type === "primary" ? (
                    <div className="flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <Map className="h-4 w-4" />
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {route.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>{route.departure}</span>
                  <Ship className="h-3 w-3 text-blue-500 inline" />
                  <span>{route.destination}</span>
                </p>
              </div>
            </div>
          ))}

          {/* Configure New Route action card */}
          <button
            type="button"
            onClick={() => setIsRouteModalOpen(true)}
            className="group flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 text-center transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-800/20 dark:hover:border-blue-600 dark:hover:bg-slate-800/50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 group-hover:text-blue-600 transition-colors">
              <PlusCircle className="h-7 w-7" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400 transition-colors">
              Configure New Route
            </span>
          </button>
        </div>
      </section>

      {/* 4. Operational Off Days Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
              <Calendar className="h-5 w-5" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Operational Off Days
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Block booking dates for maintenance or holidays.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsOffDayModalOpen(true)}
            className="h-8 px-3.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold shadow-none dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
          >
            Add Date
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/90 divide-y divide-slate-100 dark:border-slate-800 dark:divide-slate-800">
          {offDays.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No operational off-days scheduled.
            </div>
          ) : (
            offDays.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  {/* Calendar Date Badge */}
                  <div className="w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-2xs dark:border-slate-700 dark:bg-slate-800">
                    <div
                      className={`py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        item.monthColor === "rose"
                          ? "bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.month}
                    </div>
                    <div className="py-0.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                      {item.day}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  title={`Delete ${item.title}`}
                  onClick={() => handleDeleteOffDay(item.id, item.title)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Buffer Time Dialog */}
      <Dialog open={isBufferModalOpen} onOpenChange={setIsBufferModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Configure Buffer Time</DialogTitle>
            <DialogDescription className="text-xs">
              Select time allocated between vessel arrival and next departure.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2.5 py-4">
            {["15 Mins", "30 Mins", "45 Mins", "60 Mins"].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  setBufferTime(time);
                  setIsBufferModalOpen(false);
                  toast.success(`Default buffer time updated to ${time}!`);
                }}
                className={`rounded-xl border p-3 text-xs font-semibold transition-all ${
                  bufferTime === time
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-500"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Route Dialog */}
      <Dialog open={isRouteModalOpen} onOpenChange={setIsRouteModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Configure New Route Zone</DialogTitle>
            <DialogDescription className="text-xs">
              Add a newly licensed or operational maritime transit corridor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRoute} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Route Line Name</Label>
              <Input
                placeholder="e.g. Puget Sound Shuttle"
                value={newRoute.title}
                onChange={(e) => setNewRoute((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Departure Port</Label>
                <Input
                  value={newRoute.departure}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, departure: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Destination Port</Label>
                <Input
                  placeholder="e.g. Bainbridge Island"
                  value={newRoute.destination}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, destination: e.target.value }))}
                  required
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Operational Status</Label>
              <div className="flex gap-2">
                {(["Active", "Seasonal"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setNewRoute((prev) => ({ ...prev, status }))}
                    className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all ${
                      newRoute.status === status
                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-500"
                        : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRouteModalOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9">
                Save Route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Off Day Dialog */}
      <Dialog open={isOffDayModalOpen} onOpenChange={setIsOffDayModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Operational Off Day</DialogTitle>
            <DialogDescription className="text-xs">
              Block booking schedules across your fleet or specific routes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOffDay} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Holiday / Event Title</Label>
              <Input
                placeholder="e.g. Harbor Maintenance Day"
                value={newOffDay.title}
                onChange={(e) => setNewOffDay((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Date</Label>
              <Input
                type="date"
                value={newOffDay.date}
                onChange={(e) => setNewOffDay((prev) => ({ ...prev, date: e.target.value }))}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Scope / Note</Label>
              <Input
                placeholder="e.g. Fleet-wide holiday or Specific vessels"
                value={newOffDay.subtitle}
                onChange={(e) => setNewOffDay((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOffDayModalOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9">
                Add Date
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

