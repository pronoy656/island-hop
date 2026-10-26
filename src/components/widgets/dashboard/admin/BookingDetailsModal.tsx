"use client";

import * as React from "react";
import {
  Anchor,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Ship,
  Ticket,
  User,
  Users,
  X
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import type { IAdminBookingItem } from "@/types";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator
} from "@/ui";
import { StatusBadge } from "../index";
import { useCancelBookingMutation } from "@/hooks/use-bookings";

export interface BookingDetailsModalProps {
  booking: IAdminBookingItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCancelled?: () => void;
}

export function BookingDetailsModal({
  booking,
  open,
  onOpenChange,
  onBookingCancelled
}: BookingDetailsModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const cancelMutation = useCancelBookingMutation();

  if (!booking) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const schedule = booking.schedule;
  const route = schedule?.route;
  const departurePort = route?.departurePort?.name || "Departure Hub";
  const destinationPort = route?.destinationPort?.name || "Arrival Hub";
  const operatorName = route?.operator?.companyName || "Commercial Carrier";
  const ferryName = schedule?.ferry?.name || "Express Ferry";
  const ferryReg = schedule?.ferry?.registration;

  const departureDate = schedule?.departureTime
    ? new Date(schedule.departureTime)
    : null;
  const arrivalDate = schedule?.arrivalTime ? new Date(schedule.arrivalTime) : null;

  const handleConfirmCancel = () => {
    cancelMutation.mutate(
      {
        bookingId: booking.id,
        reason: "Administrative cancellation by Platform Administrator"
      },
      {
        onSuccess: () => {
          setShowCancelConfirm(false);
          onOpenChange(false);
          if (onBookingCancelled) onBookingCancelled();
        }
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl"
          closeButtonClassName="text-white/80 hover:text-white hover:bg-white/20 rounded-full"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white shadow-xs">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mr-9 shrink-0">
                    <span className="font-mono text-base font-bold tracking-tight text-white">
                      {booking.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(booking.reference, "Booking reference")}
                      className="text-white/70 hover:text-white transition-colors"
                      title="Copy Reference"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-white/80">
                    Booked on{" "}
                    {booking.createdAt
                      ? format(new Date(booking.createdAt), "MMM dd, yyyy • hh:mm a")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={booking.status} className="border-white/30 bg-white/20 text-white font-bold" />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Voyage / Sailing Route Card */}
            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Ship className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Voyage & Vessel Info
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {operatorName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-2 border-y border-border/50">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">From</span>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{departurePort}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {departureDate ? format(departureDate, "hh:mm a") : "—"}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-2">
                  <span className="text-[10px] text-muted-foreground font-medium mb-1">
                    {route?.durationMinutes ? `${route.durationMinutes} mins` : "Direct Sailing"}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <div className="h-0.5 w-12 bg-border sm:w-20" />
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">To</span>
                  <div className="font-bold text-sm text-foreground flex items-center justify-end gap-1.5">
                    <span>{destinationPort}</span>
                    <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {arrivalDate ? format(arrivalDate, "hh:mm a") : "—"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">Travel Date</span>
                  <p className="font-semibold text-foreground">
                    {departureDate ? format(departureDate, "MMM dd, yyyy") : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Ferry Vessel</span>
                  <p className="font-semibold text-foreground">
                    {ferryName} {ferryReg ? `(${ferryReg})` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Boarding Gate</span>
                  <p className="font-semibold text-foreground font-mono">
                    {schedule?.gate || "Standard Pier"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Master / Captain</span>
                  <p className="font-semibold text-foreground">
                    {schedule?.captain || "Certified Master"}
                  </p>
                </div>
              </div>
            </div>

            {/* Passenger & Financials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lead Passenger */}
              <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  Lead Passenger
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-foreground">
                    {booking.leadPassengerName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                    <Mail className="h-3 w-3 text-muted-foreground/70" />
                    <span>{booking.leadPassengerEmail}</span>
                  </p>
                  {booking.leadPassengerPhone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                      <Phone className="h-3 w-3 text-muted-foreground/70" />
                      <span>{booking.leadPassengerPhone}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 font-medium text-foreground">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {booking.adultsCount} {booking.adultsCount === 1 ? "Adult" : "Adults"}
                      {booking.childrenCount > 0 && `, ${booking.childrenCount} Child`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financials Breakdown */}
              <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    Fare & Billing
                  </span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Total Settled:</span>
                    <span className="text-2xl font-black text-foreground">
                      ${Number(booking.totalAmount).toFixed(2)}
                      <span className="text-xs font-bold text-muted-foreground ml-1">
                        {booking.currency || "USD"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Adult Rate: ${schedule?.adultFare ?? 35}</span>
                  <span>Child Rate: ${schedule?.childFare ?? 21}</span>
                </div>
              </div>
            </div>

            {/* Issued E-Tickets List */}
            {booking.tickets && booking.tickets.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5 text-blue-600" />
                    Issued Passenger Tickets ({booking.tickets.length})
                  </span>
                </div>

                <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden">
                  {booking.tickets.map((t, idx) => (
                    <div
                      key={t.id || t.ticketNumber || idx}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{t.passengerName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span className="font-mono">{t.ticketNumber}</span>
                            <span>•</span>
                            <span>{t.cabinClass || "Standard"}</span>
                            {t.passportOrId && (
                              <>
                                <span>•</span>
                                <span className="font-mono">ID: {t.passportOrId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(t.ticketNumber, "Ticket number")}
                          className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-mono text-muted-foreground flex items-center gap-1 transition-colors"
                          title="Copy Ticket Number"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.boardingStatus === "BOARDED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {t.boardingStatus || "CONFIRMED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-border/70 bg-muted/20 px-6 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              {booking.status !== "CANCELLED" && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelMutation.isPending}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Cancel Reservation</span>
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-medium"
            >
              Close Window
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Cancel Booking {booking.reference}?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation for{" "}
              <strong className="text-foreground">{booking.leadPassengerName}</strong>?
              This will restore booked seats ({booking.adultsCount + booking.childrenCount} passengers)
              back to the sailing inventory and flag issued tickets as CANCELLED.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={cancelMutation.isPending}
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Active
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              className="font-semibold"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
