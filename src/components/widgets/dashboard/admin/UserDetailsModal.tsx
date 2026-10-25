"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  User,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import type { IAdminUserItem } from "@/types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/ui";
import { StatusBadge } from "../index";

export interface UserDetailsModalProps {
  user: IAdminUserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsModal({
  user,
  open,
  onOpenChange
}: UserDetailsModalProps) {
  if (!user) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getRoleBadge = (role: string) => {
    const normalized = role?.toUpperCase();
    if (normalized === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    }
    if (normalized === "OPERATOR") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Building2 className="h-3 w-3" />
          Operator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
        <User className="h-3 w-3" />
        Passenger
      </span>
    );
  };

  const formattedStatus =
    user.status === "ACTIVE"
      ? "Active"
      : user.status === "SUSPENDED"
        ? "Suspended"
        : user.status || "Active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-inner text-white font-extrabold text-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{user.name || "Unnamed User"}</span>
                  {user.isRootAdmin && (
                    <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Root Admin
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-0.5 flex items-center gap-2">
                  <span>ID: <strong className="font-mono text-white text-[11px]">{user.id}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user.id, "User ID")}
                    className="hover:text-white transition-colors cursor-pointer"
                    title="Copy User ID"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </DialogDescription>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={formattedStatus} className="text-xs px-3 py-1 font-bold shadow-2xs" />
              {getRoleBadge(user.role)}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Contact & Account Credentials Card */}
          <div className="bg-muted/30 dark:bg-zinc-800/30 border border-border/70 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Contact & Credentials
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[10px] text-muted-foreground">Email Address</p>
                  <p className="font-semibold text-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Phone Number</p>
                  <p className="font-semibold text-foreground">
                    {user.phoneNumber || user.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {user.isEmailVerified ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <div>
                  <p className="text-[10px] text-muted-foreground">Email Verification</p>
                  <p className={`font-semibold ${user.isEmailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {user.isEmailVerified ? "Verified Account" : "Pending Verification"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Registration Date</p>
                  <p className="font-semibold text-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operator Profile Details if Role is OPERATOR */}
          {user.operatorProfile && (
            <div className="border border-border/70 rounded-xl p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Operator Business Profile
                </div>
                <Link
                  href={`/dashboard/admin/providers/${user.operatorProfile.id}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  View Provider Hub
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-muted-foreground">Company Name:</span>
                  <p className="font-bold text-foreground text-sm">{user.operatorProfile.companyName}</p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground">Contact Person:</span>
                  <p className="font-medium text-foreground">
                    {user.operatorProfile.contactPersonName || user.name || "N/A"}
                  </p>
                </div>

                {user.operatorProfile.businessAddress && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-muted-foreground">Address:</span>
                    <p className="text-muted-foreground">{user.operatorProfile.businessAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp footer */}
          <div className="bg-muted/20 border border-border/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-muted-foreground">Last Profile Update:</span>
              <span className="font-mono text-muted-foreground">
                {new Date(user.updatedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Account State:</span>
              <span className="font-medium text-foreground">{user.status}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(user.email, "Email")}
              className="text-xs font-medium gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Email
            </Button>

            <Button
              variant="default"
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
