import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/ui";

export type StatusType =
  | "Confirmed"
  | "Cancelled"
  | "Active"
  | "Suspended"
  | "Completed"
  | "Pending"
  | "Failed"
  | (string & {});

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  let colorClasses =
    "bg-muted text-muted-foreground border-border/80";

  if (
    normalizedStatus === "confirmed" ||
    normalizedStatus === "active" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "success" ||
    normalizedStatus === "on schedule" ||
    normalizedStatus === "on time" ||
    normalizedStatus === "scheduled" ||
    normalizedStatus === "in service" ||
    normalizedStatus === "boarded"
  ) {
    colorClasses =
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60";
  } else if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "failed" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "delayed"
  ) {
    colorClasses =
      "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60";
  } else if (
    normalizedStatus === "suspended" ||
    normalizedStatus === "pending" ||
    normalizedStatus === "warning" ||
    normalizedStatus === "almost full" ||
    normalizedStatus === "filling fast" ||
    normalizedStatus === "tentative" ||
    normalizedStatus === "maintenance"
  ) {
    colorClasses =
      "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60";
  } else if (
    normalizedStatus === "boarding" ||
    normalizedStatus === "preparing" ||
    normalizedStatus === "open" ||
    normalizedStatus === "checked in"
  ) {
    colorClasses =
      "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold leading-tight transition-colors whitespace-nowrap",
        colorClasses,
        className
      )}
      {...props}
    >
      {status}
    </span>
  );
}

export interface TableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  headerClassName?: string;
  className?: string;
  align?: "left" | "center" | "right";
  cell?: (item: T, index: number) => React.ReactNode;
}

export interface DashboardTableCardProps<T> {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function DashboardTableCard<T>({
  title,
  viewAllHref,
  viewAllLabel = "View all",
  onViewAll,
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data available.",
  className
}: DashboardTableCardProps<T>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border/80 rounded-xl border shadow-xs transition-all overflow-hidden flex flex-col justify-between",
        className
      )}
    >
      {/* Header inside the Card with uniform height */}
      <div className="flex items-center justify-between px-5 py-4 md:px-6 h-[58px] border-b border-border/40">
        <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-primary hover:text-primary/80 hover:underline text-xs font-semibold transition-colors"
          >
            {viewAllLabel}
          </Link>
        ) : onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-primary hover:text-primary/80 hover:underline cursor-pointer text-xs font-semibold transition-colors"
          >
            {viewAllLabel}
          </button>
        ) : null}
      </div>

      {/* Table with Header and Rows */}
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/80">
            <TableRow className="hover:bg-transparent border-none h-10">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={cn(
                    "text-muted-foreground h-10 px-4 md:px-6 text-[10px] md:text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center text-xs font-medium"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIdx) => {
                const key = keyExtractor ? keyExtractor(item, rowIdx) : rowIdx;

                return (
                  <TableRow
                    key={key}
                    className="border-border/60 hover:bg-muted/30 transition-colors h-[54px]"
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={cn(
                          "px-4 py-3 md:px-6 text-xs text-foreground align-middle font-normal whitespace-nowrap",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className
                        )}
                      >
                        {col.cell
                          ? col.cell(item, rowIdx)
                          : col.accessorKey
                            ? (item[col.accessorKey] as React.ReactNode)
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
