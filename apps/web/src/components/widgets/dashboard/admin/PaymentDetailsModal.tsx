"use client";

import * as React from "react";
import {
  Building2,
  Calendar,
  CircleDollarSign,
  Clock,
  Copy,
  CreditCard,
  MapPin,
  Receipt,
  User
} from "lucide-react";
import { toast } from "sonner";
import type { RecentPaymentItem } from "@/data";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/ui";
import { StatusBadge } from "../index";

export interface PaymentDetailsModalProps {
  payment: (RecentPaymentItem & {
    passenger?: string;
    route?: string;
    travelDate?: string;
    pax?: number;
    paymentMethod?: string;
    paidAt?: string;
  }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsModal({
  payment,
  open,
  onOpenChange
}: PaymentDetailsModalProps) {
  if (!payment) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const passengerName = payment.passenger || "Elena Rodriguez";
  const route = payment.route || "Honolulu Pier 4 → Maui Harbor";
  const travelDate = payment.travelDate || "2024-08-20";
  const pax = payment.pax || 4;
  const paymentMethod = payment.paymentMethod || "Visa ending in •••• 4242";
  const paidAt = payment.paidAt || "2024-08-15 14:32:10 UTC";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-inner">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                  Payment Details
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-0.5 flex items-center gap-2">
                  <span>Ref: <strong className="font-mono text-white">{payment.bookingReference}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(payment.bookingReference, "Booking Reference")}
                    className="hover:text-white transition-colors cursor-pointer"
                    title="Copy Reference"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </DialogDescription>
              </div>
            </div>

            <StatusBadge status={payment.paymentStatus} className="text-xs px-3 py-1 font-bold shadow-2xs" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Passenger & Booking Info Card */}
          <div className="bg-muted/30 dark:bg-zinc-800/30 border border-border/70 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Reservation Summary
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Passenger</p>
                  <p className="font-semibold text-foreground">{passengerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Ferry Provider</p>
                  <p className="font-semibold text-foreground">{payment.provider}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Route</p>
                  <p className="font-semibold text-foreground">{route}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Travel Date & PAX</p>
                  <p className="font-semibold text-foreground">{travelDate} ({pax} PAX)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Revenue Breakdown Card */}
          <div className="border border-border/70 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Financial Breakdown & Split
            </div>

            <div className="space-y-2 text-xs divide-y divide-border/60">
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Gross Booking Fare:</span>
                <span className="font-bold text-foreground text-sm">
                  ${payment.bookingAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                  <CircleDollarSign className="h-3.5 w-3.5" />
                  FerryGo Platform Commission (10%):
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  +${payment.commission.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Provider Net Payout (90%):
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  ${payment.providerAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Timestamp Bar */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              <span className="text-muted-foreground">Method:</span>
              <span className="font-medium text-foreground">{paymentMethod}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-muted-foreground">Paid:</span>
              <span className="font-mono text-muted-foreground">{paidAt}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold px-5"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
