"use client";

import * as React from "react";
import {
  BadgePercent,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Edit3,
  Globe,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Percent,
  Phone,
  RotateCcw,
  Save,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCog
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/ui";

export interface AdminProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  adminId: string;
  department: string;
  joinedDate: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface CommissionSettingsData {
  commissionType: "percentage" | "fixed";
  commissionRate: number;
  fixedAmount: number;
  gatewayFeeRate: number;
  gatewayFixedFee: number;
  payoutSchedule: "instant" | "daily" | "weekly" | "biweekly";
  minPayoutThreshold: number;
  taxRate: number;
}

export interface PlatformInfoData {
  platformName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  emergencyHotline: string;
  officeAddress: string;
  currency: string;
  timezone: string;
  websiteUrl: string;
  portalVersion: string;
}

export function AdminSettingsView() {
  const [activeTab, setActiveTab] = React.useState<string>("commission");

  // ----------------------------------------------------
  // Tab 1: Commission Setup State
  // ----------------------------------------------------
  const [commissionSettings, setCommissionSettings] = React.useState<CommissionSettingsData>({
    commissionType: "percentage",
    commissionRate: 10,
    fixedAmount: 5.0,
    gatewayFeeRate: 2.9,
    gatewayFixedFee: 0.3,
    payoutSchedule: "weekly",
    minPayoutThreshold: 50.0,
    taxRate: 0.0
  });

  const [sampleBookingAmount, setSampleBookingAmount] = React.useState<number>(120.0);
  const [isSavingCommission, setIsSavingCommission] = React.useState(false);

  // Computed Live Calculations for Commission Preview
  const sampleGross = Number(sampleBookingAmount) || 0;
  const platformCommissionAmount =
    commissionSettings.commissionType === "percentage"
      ? (sampleGross * (commissionSettings.commissionRate || 0)) / 100
      : Math.min(sampleGross, commissionSettings.fixedAmount || 0);

  const gatewayProcessingFee =
    (sampleGross * (commissionSettings.gatewayFeeRate || 0)) / 100 +
    (commissionSettings.gatewayFixedFee || 0);

  const netProviderPayout = Math.max(0, sampleGross - platformCommissionAmount);
  const netPlatformProfit = Math.max(0, platformCommissionAmount - gatewayProcessingFee);

  const providerSharePercent =
    sampleGross > 0 ? ((netProviderPayout / sampleGross) * 100).toFixed(1) : "0.0";
  const platformSharePercent =
    sampleGross > 0 ? ((platformCommissionAmount / sampleGross) * 100).toFixed(1) : "0.0";

  const handleSaveCommission = () => {
    setIsSavingCommission(true);
    setTimeout(() => {
      setIsSavingCommission(false);
      toast.success("Commission policy updated successfully!", {
        description: `Default platform commission set to ${
          commissionSettings.commissionType === "percentage"
            ? `${commissionSettings.commissionRate}%`
            : `$${commissionSettings.fixedAmount.toFixed(2)} fixed`
        }.`
      });
    }, 450);
  };

  const handleResetCommission = () => {
    setCommissionSettings({
      commissionType: "percentage",
      commissionRate: 10,
      fixedAmount: 5.0,
      gatewayFeeRate: 2.9,
      gatewayFixedFee: 0.3,
      payoutSchedule: "weekly",
      minPayoutThreshold: 50.0,
      taxRate: 0.0
    });
    toast.info("Commission settings reset to default (10% rate).");
  };

  // ----------------------------------------------------
  // Tab 2: Platform Information State
  // ----------------------------------------------------
  const [platformInfo, setPlatformInfo] = React.useState<PlatformInfoData>({
    platformName: "FerryGo",
    tagline: "Inter-Island Ferry Reservation & Logistics Portal",
    supportEmail: "support@ferrygo.com",
    supportPhone: "+1 (800) 555-3377",
    emergencyHotline: "+1 (888) 999-FERRY",
    officeAddress: "Marine Harbor Terminal, Pier 4, Charlotte Amalie, VI 00802",
    currency: "USD ($)",
    timezone: "America/Port_of_Spain (UTC-04:00)",
    websiteUrl: "https://ferrygo.com",
    portalVersion: "v2.4.0 (Enterprise)"
  });

  const [isSavingPlatform, setIsSavingPlatform] = React.useState(false);

  const handleSavePlatformInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlatform(true);
    setTimeout(() => {
      setIsSavingPlatform(false);
      toast.success("Platform information updated successfully!", {
        description: `Changes to ${platformInfo.platformName} support contacts & details are now live.`
      });
    }, 450);
  };

  // ----------------------------------------------------
  // Tab 3: Admin Account State & Edit Modal
  // ----------------------------------------------------
  const [adminProfile, setAdminProfile] = React.useState<AdminProfileData>({
    firstName: "Shariar",
    lastName: "Fahim",
    email: "admin@ferrygo.com",
    phone: "+880 1812-345678",
    role: "Super Administrator",
    adminId: "ADM-90214",
    department: "Executive Operations",
    joinedDate: "January 15, 2024",
    lastLogin: "Today at 10:42 AM",
    twoFactorEnabled: true
  });

  const [isEditAccountOpen, setIsEditAccountOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState<AdminProfileData>(adminProfile);

  const handleOpenEditAccount = () => {
    setEditFormData(adminProfile);
    setIsEditAccountOpen(true);
  };

  const handleSaveAccountModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
      toast.error("First Name and Last Name cannot be empty.");
      return;
    }
    if (!editFormData.email.trim() || !editFormData.email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setAdminProfile(editFormData);
    setIsEditAccountOpen(false);
    toast.success("Admin account details updated successfully!", {
      description: `Updated profile for ${editFormData.firstName} ${editFormData.lastName}.`
    });
  };

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!", {
        description: "Your administrative login credentials have been securely updated."
      });
    }, 500);
  };

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings & Configurations
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage commission policies, platform organization details, and administrator account preferences.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/70 dark:bg-muted/40 grid w-full grid-cols-3 max-w-xl h-11 p-1 rounded-xl">
          <TabsTrigger
            value="commission"
            className="flex items-center justify-center gap-2 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none transition-all"
          >
            <BadgePercent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Commission Setup</span>
            <span className="sm:hidden">Commission</span>
          </TabsTrigger>

          <TabsTrigger
            value="platform"
            className="flex items-center justify-center gap-2 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none transition-all"
          >
            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Platform Information</span>
            <span className="sm:hidden">Platform</span>
          </TabsTrigger>

          <TabsTrigger
            value="account"
            className="flex items-center justify-center gap-2 rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none transition-all"
          >
            <UserCog className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Admin Account</span>
            <span className="sm:hidden">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: COMMISSION SETUP                                                   */}
        {/* ========================================================================= */}
        <TabsContent value="commission" className="space-y-6 outline-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Commission Configuration Form */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border/80 bg-card shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <BadgePercent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          Commission Structure & Fee Policy
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Configure how FerryGo earns platform fees on ferry reservations.
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 text-xs font-semibold">
                      Live Policy
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                  {/* Commission Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Commission Model Type
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCommissionSettings((prev) => ({ ...prev, commissionType: "percentage" }))
                        }
                        className={cn(
                          "flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative",
                          commissionSettings.commissionType === "percentage"
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-500 shadow-xs"
                            : "border-border/80 hover:border-border hover:bg-muted/30 bg-card"
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                            <Percent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            Percentage Rate
                          </div>
                          {commissionSettings.commissionType === "percentage" && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Deduct a fixed percentage (%) from each ticket booking price.
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          <span>Standard standard: 10%</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCommissionSettings((prev) => ({ ...prev, commissionType: "fixed" }))
                        }
                        className={cn(
                          "flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative",
                          commissionSettings.commissionType === "fixed"
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-500 shadow-xs"
                            : "border-border/80 hover:border-border hover:bg-muted/30 bg-card"
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Fixed Flat Fee
                          </div>
                          {commissionSettings.commissionType === "fixed" && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Deduct a flat dollar amount per completed reservation transaction.
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span>Flat rate per ticket</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Primary Commission Rate Input */}
                  {commissionSettings.commissionType === "percentage" ? (
                    <div className="space-y-2.5 rounded-xl border border-border/80 bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="commission-rate" className="text-xs font-bold text-foreground">
                          Platform Commission Rate (%)
                        </Label>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                          {commissionSettings.commissionRate}% Cut
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          id="commission-rate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={commissionSettings.commissionRate}
                          onChange={(e) =>
                            setCommissionSettings((prev) => ({
                              ...prev,
                              commissionRate: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="pr-10 font-mono text-sm font-semibold h-10 bg-background"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                          %
                        </span>
                      </div>

                      {/* Quick Preset Buttons */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[11px] font-medium text-muted-foreground mr-1">Quick Presets:</span>
                        {[5, 8, 10, 12, 15].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              setCommissionSettings((prev) => ({ ...prev, commissionRate: preset }))
                            }
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer",
                              commissionSettings.commissionRate === preset
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-card hover:bg-muted text-muted-foreground border-border/80"
                            )}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 rounded-xl border border-border/80 bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fixed-amount" className="text-xs font-bold text-foreground">
                          Fixed Fee Amount ($ per booking)
                        </Label>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          ${commissionSettings.fixedAmount.toFixed(2)} Flat
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                          $
                        </span>
                        <Input
                          id="fixed-amount"
                          type="number"
                          min="0"
                          step="0.5"
                          value={commissionSettings.fixedAmount}
                          onChange={(e) =>
                            setCommissionSettings((prev) => ({
                              ...prev,
                              fixedAmount: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="pl-8 font-mono text-sm font-semibold h-10 bg-background"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[11px] font-medium text-muted-foreground mr-1">Quick Presets:</span>
                        {[2.5, 5.0, 7.5, 10.0].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              setCommissionSettings((prev) => ({ ...prev, fixedAmount: preset }))
                            }
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer",
                              commissionSettings.fixedAmount === preset
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-card hover:bg-muted text-muted-foreground border-border/80"
                            )}
                          >
                            ${preset.toFixed(2)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary Parameters: Gateway Fee & Payout Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gateway-fee" className="text-xs font-semibold text-foreground">
                        Payment Gateway Fee (%)
                      </Label>
                      <div className="relative">
                        <Input
                          id="gateway-fee"
                          type="number"
                          step="0.1"
                          min="0"
                          value={commissionSettings.gatewayFeeRate}
                          onChange={(e) =>
                            setCommissionSettings((prev) => ({
                              ...prev,
                              gatewayFeeRate: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="font-mono text-sm h-10 pr-9 bg-background"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Standard Stripe / Gateway transaction fee.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gateway-fixed" className="text-xs font-semibold text-foreground">
                        Gateway Fixed Fee ($)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="gateway-fixed"
                          type="number"
                          step="0.05"
                          min="0"
                          value={commissionSettings.gatewayFixedFee}
                          onChange={(e) =>
                            setCommissionSettings((prev) => ({
                              ...prev,
                              gatewayFixedFee: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="font-mono text-sm h-10 pl-7 bg-background"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Per transaction fixed processing charge.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payout-schedule" className="text-xs font-semibold text-foreground">
                        Provider Payout Schedule
                      </Label>
                      <select
                        id="payout-schedule"
                        value={commissionSettings.payoutSchedule}
                        onChange={(e) =>
                          setCommissionSettings((prev) => ({
                            ...prev,
                            payoutSchedule: e.target.value as CommissionSettingsData["payoutSchedule"]
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="instant">Instant (Direct Payout on Booking)</option>
                        <option value="daily">Daily Batch Settlement (00:00 UTC)</option>
                        <option value="weekly">Weekly Settlement (Every Monday)</option>
                        <option value="biweekly">Bi-weekly (1st & 15th of Month)</option>
                      </select>
                      <p className="text-[11px] text-muted-foreground">
                        Automated provider payout cycle.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-payout" className="text-xs font-semibold text-foreground">
                        Min. Payout Threshold ($)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="min-payout"
                          type="number"
                          min="0"
                          value={commissionSettings.minPayoutThreshold}
                          onChange={(e) =>
                            setCommissionSettings((prev) => ({
                              ...prev,
                              minPayoutThreshold: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="font-mono text-sm h-10 pl-7 bg-background"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Minimum balance for automatic disbursement.
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/80 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetCommission}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Reset Defaults
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveCommission}
                    disabled={isSavingCommission}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs px-4"
                  >
                    {isSavingCommission ? (
                      <span className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Commission Policy"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column: Live Interactive Commission Preview */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
                <CardHeader className="bg-muted/40 pb-4 border-b border-border/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          Live Commission Preview
                        </CardTitle>
                        <CardDescription className="text-[11px]">
                          Real-time calculation breakdown for sample ticket bookings.
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 text-[10px] font-bold">
                      Interactive
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Sample Booking Amount Simulator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sample-amount" className="text-xs font-semibold text-foreground">
                        Simulated Booking Value ($)
                      </Label>
                      <span className="text-xs font-mono font-bold text-foreground">
                        ${sampleGross.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="sample-amount"
                        type="number"
                        min="1"
                        step="10"
                        value={sampleBookingAmount}
                        onChange={(e) => setSampleBookingAmount(parseFloat(e.target.value) || 0)}
                        className="pl-8 font-mono text-sm font-bold h-10 bg-background"
                      />
                    </div>

                    {/* Quick Simulators */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[50, 120, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSampleBookingAmount(amt)}
                          className={cn(
                            "text-[11px] px-2 py-0.5 rounded border font-mono font-medium transition-colors cursor-pointer",
                            sampleBookingAmount === amt
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground border-border/60"
                          )}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Split Meter Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                        Provider Share ({providerSharePercent}%)
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                        Platform Commission ({platformSharePercent}%)
                      </span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                      <div
                        style={{ width: `${Math.max(0, Math.min(100, parseFloat(providerSharePercent)))}%` }}
                        className="bg-emerald-500 dark:bg-emerald-600 transition-all duration-300"
                        title={`Provider: ${providerSharePercent}%`}
                      />
                      <div
                        style={{ width: `${Math.max(0, Math.min(100, parseFloat(platformSharePercent)))}%` }}
                        className="bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                        title={`Platform Commission: ${platformSharePercent}%`}
                      />
                    </div>
                  </div>

                  {/* Itemized Calculation Summary Box */}
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sample Ticket Gross Price:</span>
                      <span className="font-mono font-bold text-foreground">
                        ${sampleGross.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                        <BadgePercent className="h-3.5 w-3.5" />
                        Platform Commission ({commissionSettings.commissionType === "percentage" ? `${commissionSettings.commissionRate}%` : "Fixed"}):
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        +${platformCommissionAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5" />
                        Est. Payment Gateway Fee ({commissionSettings.gatewayFeeRate}% + ${commissionSettings.gatewayFixedFee}):
                      </span>
                      <span className="font-mono text-muted-foreground">
                        -${gatewayProcessingFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="h-px bg-border/80 my-1" />

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Net Provider Payout:
                      </span>
                      <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                        ${netProviderPayout.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Net Platform Margin:</span>
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        ${netPlatformProfit.toFixed(2)} / booking
                      </span>
                    </div>
                  </div>

                  {/* Informational Policy Note */}
                  <div className="rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-900/50 p-3 flex items-start gap-2.5">
                    <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Changes made to commission policies take effect immediately on all new ticket bookings. Existing bookings maintain their locked commission rates at checkout.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: PLATFORM INFORMATION                                               */}
        {/* ========================================================================= */}
        <TabsContent value="platform" className="space-y-6 outline-hidden">
          <form onSubmit={handleSavePlatformInfo} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Platform Details */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-border/80 bg-card shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Platform Organization & Support Contacts
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configure public-facing brand details, customer support hotlines, and regional preferences.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Platform Name */}
                    <div className="space-y-2">
                      <Label htmlFor="platform-name" className="text-xs font-semibold text-foreground">
                        Platform Brand Name *
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="platform-name"
                          value={platformInfo.platformName}
                          onChange={(e) =>
                            setPlatformInfo((prev) => ({ ...prev, platformName: e.target.value }))
                          }
                          required
                          className="pl-9 text-xs font-medium h-10 bg-background"
                          placeholder="FerryGo"
                        />
                      </div>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                      <Label htmlFor="platform-tagline" className="text-xs font-semibold text-foreground">
                        Platform Tagline / Slogan
                      </Label>
                      <Input
                        id="platform-tagline"
                        value={platformInfo.tagline}
                        onChange={(e) =>
                          setPlatformInfo((prev) => ({ ...prev, tagline: e.target.value }))
                        }
                        className="text-xs font-medium h-10 bg-background"
                        placeholder="Inter-Island Ferry Reservation"
                      />
                    </div>

                    {/* Support Email */}
                    <div className="space-y-2">
                      <Label htmlFor="support-email" className="text-xs font-semibold text-foreground">
                        Official Support Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="support-email"
                          type="email"
                          value={platformInfo.supportEmail}
                          onChange={(e) =>
                            setPlatformInfo((prev) => ({ ...prev, supportEmail: e.target.value }))
                          }
                          required
                          className="pl-9 text-xs font-medium h-10 bg-background font-mono"
                          placeholder="support@ferrygo.com"
                        />
                      </div>
                    </div>

                    {/* Support Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="support-phone" className="text-xs font-semibold text-foreground">
                        Support Hotline Phone *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="support-phone"
                          value={platformInfo.supportPhone}
                          onChange={(e) =>
                            setPlatformInfo((prev) => ({ ...prev, supportPhone: e.target.value }))
                          }
                          required
                          className="pl-9 text-xs font-medium h-10 bg-background font-mono"
                          placeholder="+1 (800) 555-3377"
                        />
                      </div>
                    </div>

                    {/* Headquarters Address */}
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="office-address" className="text-xs font-semibold text-foreground">
                        Port Headquarters / Business Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="office-address"
                          value={platformInfo.officeAddress}
                          onChange={(e) =>
                            setPlatformInfo((prev) => ({ ...prev, officeAddress: e.target.value }))
                          }
                          className="pl-9 text-xs font-medium h-10 bg-background"
                          placeholder="Port Terminal 4, Charlotte Amalie, VI"
                        />
                      </div>
                    </div>

                    {/* Website Portal URL */}
                    <div className="space-y-2">
                      <Label htmlFor="website-url" className="text-xs font-semibold text-foreground">
                        Public Portal URL
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website-url"
                          value={platformInfo.websiteUrl}
                          onChange={(e) =>
                            setPlatformInfo((prev) => ({ ...prev, websiteUrl: e.target.value }))
                          }
                          className="pl-9 text-xs font-medium h-10 bg-background font-mono"
                          placeholder="https://ferrygo.com"
                        />
                      </div>
                    </div>

                    {/* Operational Currency */}
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-xs font-semibold text-foreground">
                        Default Currency
                      </Label>
                      <select
                        id="currency"
                        value={platformInfo.currency}
                        onChange={(e) =>
                          setPlatformInfo((prev) => ({ ...prev, currency: e.target.value }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="USD ($)">USD ($) - US Dollar</option>
                        <option value="EUR (€)">EUR (€) - Euro</option>
                        <option value="BDT (৳)">BDT (৳) - Bangladeshi Taka</option>
                        <option value="GBP (£)">GBP (£) - British Pound</option>
                      </select>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-end border-t border-border/80 pt-4">
                  <Button
                    type="submit"
                    disabled={isSavingPlatform}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs px-4"
                  >
                    {isSavingPlatform ? (
                      <span className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Platform Information"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column: Platform Status & System Health */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/80 bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Server className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        System Health & Gateway
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        Operational environment status.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground font-medium">Core API Engine</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Operational
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground font-medium">Payment Gateway</span>
                    <span className="font-semibold text-foreground">Stripe & SSLCommerz</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground font-medium">Email Dispatcher</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Connected (SMTP)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground font-medium">App Release Version</span>
                    <span className="font-mono font-semibold text-foreground">v2.4.0-turbopack</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: ADMIN ACCOUNT                                                      */}
        {/* ========================================================================= */}
        <TabsContent value="account" className="space-y-6 outline-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Admin Profile Card */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
                {/* Decorative Banner Header */}
                <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 relative p-6">
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs border-white/30 text-xs font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                      {adminProfile.role}
                    </Badge>
                  </div>
                </div>

                <CardContent className="pt-0 relative px-6 pb-6 space-y-6">
                  {/* Profile Avatar & Primary Identification */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
                    <div className="flex items-end gap-4">
                      <Avatar className="h-24 w-24 rounded-2xl border-4 border-card shadow-md bg-card">
                        <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                          {adminProfile.firstName.charAt(0)}
                          {adminProfile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="mb-1">
                        <h2 className="text-xl font-bold text-foreground">
                          {adminProfile.firstName} {adminProfile.lastName}
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {adminProfile.email}
                        </p>
                      </div>
                    </div>

                    {/* Edit Account Button */}
                    <Button
                      type="button"
                      onClick={handleOpenEditAccount}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Profile
                    </Button>
                  </div>

                  {/* Account Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-blue-600" />
                        First Name
                      </div>
                      <p className="text-sm font-semibold text-foreground">{adminProfile.firstName}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-blue-600" />
                        Last Name
                      </div>
                      <p className="text-sm font-semibold text-foreground">{adminProfile.lastName}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-indigo-600" />
                        Email Address
                      </div>
                      <p className="text-sm font-mono font-semibold text-foreground truncate">
                        {adminProfile.email}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        Phone Number
                      </div>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {adminProfile.phone}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-violet-600" />
                        Admin ID
                      </div>
                      <p className="text-sm font-mono font-bold text-foreground">
                        {adminProfile.adminId}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-600" />
                        Account Created
                      </div>
                      <p className="text-sm font-semibold text-foreground">{adminProfile.joinedDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Security & Password Update Card */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border/80 bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        Change Password
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        Update administrator login credentials.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <form onSubmit={handleUpdatePassword}>
                  <CardContent className="space-y-4 pt-1">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-xs font-semibold text-foreground">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="••••••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-9 text-xs h-10 bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="At least 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-9 text-xs h-10 bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9 text-xs h-10 bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword || !currentPassword || !newPassword}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 shadow-xs"
                    >
                      {isUpdatingPassword ? (
                        <span className="flex items-center gap-2">
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating Password...
                        </span>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* EDIT ADMIN ACCOUNT MODAL                                                  */}
      {/* ========================================================================= */}
      <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Edit Admin Profile
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Modify personal administrator contact details and credentials.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveAccountModal} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name" className="text-xs font-semibold text-foreground">
                  First Name *
                </Label>
                <Input
                  id="edit-first-name"
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  required
                  className="text-xs h-9"
                  placeholder="Shariar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-last-name" className="text-xs font-semibold text-foreground">
                  Last Name *
                </Label>
                <Input
                  id="edit-last-name"
                  value={editFormData.lastName}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  required
                  className="text-xs h-9"
                  placeholder="Fahim"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="edit-email" className="text-xs font-semibold text-foreground">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                    className="pl-9 text-xs h-9 font-mono"
                    placeholder="admin@ferrygo.com"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="edit-phone" className="text-xs font-semibold text-foreground">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    required
                    className="pl-9 text-xs h-9 font-mono"
                    placeholder="+880 1812-345678"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditAccountOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                Save Profile Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
