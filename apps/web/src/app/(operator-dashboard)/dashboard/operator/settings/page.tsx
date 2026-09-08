"use client";

import * as React from "react";
import {
  Building2,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { PROVIDER_MOCK_DATA } from "@/data";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/ui";

export default function OperatorSettingsPage() {
  const { profile } = PROVIDER_MOCK_DATA;

  const [companyProfile, setCompanyProfile] = React.useState({
    companyName: profile.companyName,
    tradingName: profile.tradingName,
    contactPerson: profile.contactPerson,
    email: profile.email,
    phone: profile.phone,
    hubPort: profile.hubPort,
    licenseNumber: profile.licenseNumber
  });

  const [payoutDetails, setPayoutDetails] = React.useState({
    bankName: "First Hawaiian Bank",
    accountHolder: "Island Ferry Co. LLC",
    accountNumber: "•••• •••• •••• 4921",
    routingNumber: "121301028",
    payoutSchedule: "weekly"
  });

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Operator company profile updated successfully!");
    }, 450);
  };

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Payout banking credentials updated!");
    }, 450);
  };

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Operator Settings
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Manage your maritime operator profile, banking payout details, and contact points.
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full space-y-6">
        <TabsList className="bg-muted/70 max-w-md h-10 p-1 rounded-xl">
          <TabsTrigger value="company" className="text-xs font-semibold">
            Company Profile
          </TabsTrigger>
          <TabsTrigger value="payout" className="text-xs font-semibold">
            Payout & Banking
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-6 outline-hidden">
          <form onSubmit={handleSaveCompany}>
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Maritime Business Profile
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Public organization details and regulatory licensing.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comp-name" className="text-xs font-semibold text-foreground">
                      Company Name *
                    </Label>
                    <Input
                      id="comp-name"
                      value={companyProfile.companyName}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trading-name" className="text-xs font-semibold text-foreground">
                      Trading Name / DBA
                    </Label>
                    <Input
                      id="trading-name"
                      value={companyProfile.tradingName}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({ ...prev, tradingName: e.target.value }))
                      }
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-person" className="text-xs font-semibold text-foreground">
                      Primary Contact Person *
                    </Label>
                    <Input
                      id="contact-person"
                      value={companyProfile.contactPerson}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({ ...prev, contactPerson: e.target.value }))
                      }
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license" className="text-xs font-semibold text-foreground">
                      Maritime License # *
                    </Label>
                    <Input
                      id="license"
                      value={companyProfile.licenseNumber}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({ ...prev, licenseNumber: e.target.value }))
                      }
                      required
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                      Official Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyProfile.email}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                      Support Hotline Phone *
                    </Label>
                    <Input
                      id="phone"
                      value={companyProfile.phone}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      required
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="hub" className="text-xs font-semibold text-foreground">
                      Primary Port Terminal Hub
                    </Label>
                    <Input
                      id="hub"
                      value={companyProfile.hubPort}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({ ...prev, hubPort: e.target.value }))
                      }
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-end border-t border-border/80 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 h-9 shadow-xs"
                >
                  Save Company Details
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Payout & Banking Tab */}
        <TabsContent value="payout" className="space-y-6 outline-hidden">
          <form onSubmit={handleSavePayout}>
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Bank Account & Net Payouts
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Direct deposit details for 90% net ticket revenue disbursements.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank-name" className="text-xs font-semibold text-foreground">
                      Bank Name
                    </Label>
                    <Input
                      id="bank-name"
                      value={payoutDetails.bankName}
                      onChange={(e) =>
                        setPayoutDetails((prev) => ({ ...prev, bankName: e.target.value }))
                      }
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acc-holder" className="text-xs font-semibold text-foreground">
                      Account Beneficiary Name
                    </Label>
                    <Input
                      id="acc-holder"
                      value={payoutDetails.accountHolder}
                      onChange={(e) =>
                        setPayoutDetails((prev) => ({ ...prev, accountHolder: e.target.value }))
                      }
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acc-num" className="text-xs font-semibold text-foreground">
                      Account Number (IBAN / Local)
                    </Label>
                    <Input
                      id="acc-num"
                      value={payoutDetails.accountNumber}
                      onChange={(e) =>
                        setPayoutDetails((prev) => ({ ...prev, accountNumber: e.target.value }))
                      }
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routing-num" className="text-xs font-semibold text-foreground">
                      Routing / Sort Code
                    </Label>
                    <Input
                      id="routing-num"
                      value={payoutDetails.routingNumber}
                      onChange={(e) =>
                        setPayoutDetails((prev) => ({ ...prev, routingNumber: e.target.value }))
                      }
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-end border-t border-border/80 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 shadow-xs"
                >
                  Update Banking Information
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
