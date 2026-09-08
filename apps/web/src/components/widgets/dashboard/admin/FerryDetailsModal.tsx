"use client";

import * as React from "react";
import {
  Anchor,
  Building2,
  Calendar,
  CheckCircle2,
  Gauge,
  MapPin,
  Ship,
  Users
} from "lucide-react";
import type { ProviderFerry } from "@/data";
import { cn } from "@/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/ui";

export interface FerryDetailsModalProps {
  ferry: (ProviderFerry & { providerName?: string; assignedRoute?: string }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FerryDetailsModal({ ferry, open, onOpenChange }: FerryDetailsModalProps) {
  if (!ferry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-inner">
                <Ship className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                  {ferry.name}
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-0.5 flex items-center gap-2">
                  <span>ID: <strong className="font-mono text-white">{ferry.id}</strong></span>
                  <span>•</span>
                  <span>{ferry.type}</span>
                </DialogDescription>
              </div>
            </div>

            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold border shadow-2xs backdrop-blur-md",
                ferry.status === "In Service" && "bg-emerald-500/20 text-emerald-100 border-emerald-300/40",
                ferry.status === "Maintenance" && "bg-amber-500/20 text-amber-100 border-amber-300/40",
                ferry.status === "Docked" && "bg-blue-500/20 text-blue-100 border-blue-300/40"
              )}
            >
              {ferry.status}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 dark:bg-zinc-800/40 border border-border/70 rounded-xl p-3 text-center space-y-1">
              <div className="flex items-center justify-center text-primary mb-1">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Passenger Capacity</p>
              <p className="text-base font-extrabold text-foreground">{ferry.capacity} PAX</p>
            </div>

            <div className="bg-muted/40 dark:bg-zinc-800/40 border border-border/70 rounded-xl p-3 text-center space-y-1">
              <div className="flex items-center justify-center text-primary mb-1">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Year Built</p>
              <p className="text-base font-extrabold text-foreground">{ferry.yearBuilt}</p>
            </div>

            <div className="bg-muted/40 dark:bg-zinc-800/40 border border-border/70 rounded-xl p-3 text-center space-y-1">
              <div className="flex items-center justify-center text-primary mb-1">
                <Gauge className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cruising Speed</p>
              <p className="text-base font-extrabold text-foreground">28 Knots</p>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="border border-border/70 rounded-xl p-4 divide-y divide-border/60 text-xs">
            <div className="flex items-center justify-between pb-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Operating Provider:
              </span>
              <span className="font-bold text-foreground">
                {ferry.providerName || "Island Ferry Co."}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Assigned Route:
              </span>
              <span className="font-semibold text-foreground">
                {ferry.assignedRoute || "Honolulu Pier 4 ⇄ Kahului Harbor, Maui"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <Anchor className="h-3.5 w-3.5 text-slate-400" />
                Home Port:
              </span>
              <span className="font-medium text-foreground">Honolulu Harbor Terminal 4</span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                USCG Safety Certificate:
              </span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                USCG-HI-VALID-2025
              </span>
            </div>
          </div>

          {/* Action Close */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold px-5"
            >
              Close Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
