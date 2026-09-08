"use client";

import * as React from "react";
import {
  CircleDollarSign,
  CreditCard,
  DollarSign
} from "lucide-react";
import { ADMIN_DASHBOARD_DATA, type RecentPaymentItem } from "@/data";
import {
  DashboardTableCard,
  PaymentDetailsModal,
  StatCard,
  StatusBadge,
  type TableColumn
} from "@/widgets";

export default function AdminPaymentsPage() {
  const { paymentOverview, recentPayments } = ADMIN_DASHBOARD_DATA;
  const [selectedPayment, setSelectedPayment] = React.useState<RecentPaymentItem | null>(null);

  const paymentColumns: TableColumn<RecentPaymentItem>[] = [
    {
      header: "BOOKING REFERENCE",
      accessorKey: "bookingReference",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300"
    },
    {
      header: "PROVIDER",
      accessorKey: "provider",
      className: "text-muted-foreground"
    },
    {
      header: "BOOKING AMOUNT",
      className: "font-bold text-foreground",
      cell: (item) => `$${item.bookingAmount.toFixed(2)}`
    },
    {
      header: "COMMISSION",
      className: "font-semibold text-blue-600 dark:text-blue-400",
      cell: (item) => `$${item.commission.toFixed(2)}`
    },
    {
      header: "PROVIDER AMOUNT",
      className: "font-medium text-foreground",
      cell: (item) => `$${item.providerAmount.toFixed(2)}`
    },
    {
      header: "PAYMENT STATUS",
      cell: (item) => <StatusBadge status={item.paymentStatus} />
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: (item) => (
        <button
          type="button"
          onClick={() => setSelectedPayment(item)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-colors cursor-pointer"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Payments & Commissions
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Platform revenue splits, provider payouts, and commission processing.
        </p>
      </div>

      {/* 3 Separate Individual Stat Cards for Revenue Breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Total Booking Value */}
        <StatCard
          label="Total Booking Value"
          value={`$${paymentOverview.totalBookingValue.toFixed(2)}`}
          icon={DollarSign}
          changePercent={15.3}
          trend="up"
          comparisonText="vs last month"
          showWave={true}
        />

        {/* Card 2: FerryGo Commission */}
        <StatCard
          label="FerryGo Commission (10%)"
          value={`$${paymentOverview.commission.toFixed(2)}`}
          icon={CircleDollarSign}
          changePercent={15.3}
          trend="up"
          comparisonText="10% platform fee"
          valueClassName="text-blue-600 dark:text-blue-500"
          showWave={true}
        />

        {/* Card 3: Provider Amount */}
        <StatCard
          label="Provider Amount (90%)"
          value={`$${paymentOverview.providerAmount.toFixed(2)}`}
          icon={CreditCard}
          changePercent={15.3}
          trend="up"
          comparisonText="90% net payout"
          showWave={true}
        />
      </div>

      {/* Transaction Records Table */}
      <DashboardTableCard
        title="Transaction Records"
        columns={paymentColumns}
        data={recentPayments}
        keyExtractor={(item) => item.id}
      />

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        payment={selectedPayment}
        open={!!selectedPayment}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
        }}
      />
    </div>
  );
}
