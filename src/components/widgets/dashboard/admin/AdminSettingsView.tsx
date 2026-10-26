"use client";

import * as React from "react";
import {
  Building2,
  Edit3,
  Globe,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
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


export interface PlatformInfoData {
  platformName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  emergencyHotline: string;
  officeAddress: string;
  timezone: string;
  portalVersion: string;
}

export function AdminSettingsView() {
  const [activeTab, setActiveTab] = React.useState<string>("platform");

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
    timezone: "America/Port_of_Spain (UTC-04:00)",
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
    role: "Platform Admin",
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
            Manage platform organization details and administrator account preferences.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/70 dark:bg-muted/40 grid w-full grid-cols-2 max-w-md h-11 p-1 rounded-xl">
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
        {/* TAB 2: PLATFORM INFORMATION                                               */}
        {/* ========================================================================= */}
        <TabsContent value="platform" className="space-y-6 outline-hidden">
          <form onSubmit={handleSavePlatformInfo} className="max-w-4xl space-y-6">
            {/* Left Form: Platform Details */}
            <div className="space-y-6">
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
