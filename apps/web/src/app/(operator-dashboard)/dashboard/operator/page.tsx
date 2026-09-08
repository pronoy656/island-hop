"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  DollarSign,
  MapPin,
  Ship,
  Ticket,
  TrendingUp,
  Users
} from "lucide-react";
import {
  PROVIDER_MOCK_DATA,
  type ProviderScheduleItem,
  type ProviderBookingItem
} from "@/data";
import { Badge, Button, Card, CardContent } from "@/ui";
import { DashboardTableCard, StatusBadge, type TableColumn } from "@/widgets";

export default function OperatorOverviewPage() {
  const { profile, summaryStats, schedules, upcomingTrips, bookings } = PROVIDER_MOCK_DATA;

  // Streamlined columns for Today's Departures & Live Queue
  const scheduleColumns: TableColumn<ProviderScheduleItem>[] = [
    {
      header: "FERRY",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Ship className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">{item.vesselName}</div>
            <div className="text-[11px] text-muted-foreground">{item.captain}</div>
          </div>
        </div>
      )
    },
    {
      header: "ROUTE",
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-medium text-foreground text-xs">
          <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{item.routeName}</span>
        </div>
      )
    },
    {
      header: "DEPARTURE",
      cell: (item) => (
        <div>
          <div className="font-mono font-bold text-foreground text-xs">{item.departureTime}</div>
          <div className="text-[11px] text-muted-foreground">{item.gatePier}</div>
        </div>
      )
    },
    {
      header: "CAPACITY",
      className: "text-xs",
      cell: (item) => {
        const pct = Math.round((item.bookedSeats / item.capacity) * 100);
        return (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="font-semibold text-foreground">{item.bookedSeats}/{item.capacity}</span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: "ACTION",
      align: "right",
      headerClassName: "text-right",
      cell: () => (
        <Button
          variant="outline"
          size="sm"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold text-xs h-8 px-3"
          asChild
        >
          <Link href="/dashboard/operator/manifest">
            Manifest
          </Link>
        </Button>
      )
    }
  ];

  // Streamlined columns for Recent Bookings
  const bookingColumns: TableColumn<ProviderBookingItem>[] = [
    {
      header: "REFERENCE",
      accessorKey: "bookingReference",
      className: "font-mono font-medium text-slate-700 dark:text-slate-300 text-[11px]"
    },
    {
      header: "PASSENGER",
      accessorKey: "passenger",
      className: "font-semibold text-foreground"
    },
    {
      header: "ROUTE",
      accessorKey: "route",
      className: "text-muted-foreground text-xs font-medium"
    },
    {
      header: "DEPARTURE",
      accessorKey: "departureTime",
      className: "font-mono text-muted-foreground text-[11px]"
    },
    {
      header: "PAX",
      accessorKey: "pax",
      className: "text-center text-foreground font-semibold",
      align: "center"
    },
    {
      header: "AMOUNT",
      className: "font-bold text-foreground",
      cell: (item) => `$${item.amount.toFixed(2)}`
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Provider Hero / Welcome Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-transparent p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {profile.companyName}
              </h1>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                {profile.verifiedStatus}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>{profile.hubPort}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="font-mono text-xs">License: {profile.licenseNumber}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 Provider Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Passengers */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Today&apos;s Passengers
              </p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {summaryStats.todayPassengers.value}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                <span>+{summaryStats.todayPassengers.changePercent}% {summaryStats.todayPassengers.comparisonText}</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Active Fleet */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Active Fleet
              </p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {summaryStats.activeFleet.value}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {summaryStats.activeFleet.comparisonText}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Ship className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Bookings */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Today&apos;s Bookings
              </p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {summaryStats.todayBookings.value}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                <span>+{summaryStats.todayBookings.changePercent}% {summaryStats.todayBookings.comparisonText}</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Ticket className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Today&apos;s Net Revenue
              </p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {summaryStats.todayRevenue.formattedValue}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                <span>+{summaryStats.todayRevenue.changePercent}% {summaryStats.todayRevenue.comparisonText}</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Active Departures */}
      <DashboardTableCard
        title="Today's Departures & Live Queue"
        viewAllHref="/dashboard/operator/schedules"
        columns={scheduleColumns}
        data={schedules}
        keyExtractor={(item) => item.id}
      />

      {/* Upcoming Trips (Card Grid View) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-foreground">
            Upcoming Trips
          </h3>
          <Link
            href="/dashboard/operator/schedules"
            className="text-primary hover:text-primary/80 hover:underline text-xs font-semibold transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingTrips.map((item) => {
            const availableSeats = Math.max(0, item.capacity - item.bookedSeats);
            const dateLabel = item.date.includes(",") ? item.date.split(",")[0].trim() : item.date;

            return (
              <div
                key={item.id}
                className="bg-card text-card-foreground border-border/80 rounded-xl border p-5 shadow-xs flex flex-col justify-between hover:border-border/90 hover:shadow-sm transition-all"
              >
                <div className="space-y-4">
                  {/* Top Row: Vessel & Route on left, Date & Time on right */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-base text-foreground tracking-tight truncate">
                        {item.vesselName}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {item.routeName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground">
                        {dateLabel}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {item.departureTime}
                      </p>
                    </div>
                  </div>

                  {/* Middle Row: Seats Booked & Available with vertical divider */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium mb-1">
                        Seats Booked
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="font-bold">{item.bookedSeats}</span>
                        <span className="text-muted-foreground font-normal"> / {item.capacity}</span>
                      </p>
                    </div>

                    <div className="border-l border-border/70 pl-4">
                      <p className="text-[11px] text-muted-foreground font-medium mb-1">
                        Available
                      </p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {availableSeats}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: View Trip Button */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold h-9 rounded-lg border-border/80 hover:bg-muted/60 text-foreground transition-colors"
                    asChild
                  >
                    <Link href="/dashboard/operator/schedules">
                      View Trip
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Passenger Bookings */}
      <DashboardTableCard
        title="Recent Ticket Reservations"
        viewAllHref="/dashboard/operator/bookings"
        columns={bookingColumns}
        data={bookings}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
