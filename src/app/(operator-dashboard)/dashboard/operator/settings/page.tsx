"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label
} from "@/ui";

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

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    setTimeout(() => {
      setIsSavingCompany(false);
      toast.success("Company information saved successfully!");
    }, 400);
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
                  Operator / Company Name
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

      {/* Buffer Time Dialog */}
      <Dialog open={isBufferModalOpen} onOpenChange={setIsBufferModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Configure Buffer Time</DialogTitle>
            <DialogDescription className="text-xs">
              Select time allocated between ferry arrival and next departure.
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
    </div>
  );
}

