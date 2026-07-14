"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateDdMmYyyy } from "@/lib/utils";
import { JOB_TYPES, SERVICE_TYPES } from "@/lib/constants";
import type { DailyJobCardReportRow } from "@/lib/types";

function renderMultiline(value: string | null | undefined) {
  if (!value) return "—";
  return (
    <div className="whitespace-pre-line text-xs max-w-md">
      {value.split(",<br>").join("\n")}
    </div>
  );
}

function getWorkshopName(row: DailyJobCardReportRow): string {
  if (row.job_type_id === 2) {
    return row.outside_work_shop?.trim() || "—";
  }
  return JOB_TYPES[row.job_type_id ?? 0] ?? "—";
}

const columns: ColumnDef<DailyJobCardReportRow>[] = [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "date_in",
    header: "Date (DD/MM/YYYY)",
    cell: ({ row }) => formatDateDdMmYyyy(row.original.date_in),
  },
  {
    accessorKey: "it_no",
    header: "IT.No",
    cell: ({ row }) => row.original.it_no || "—",
  },
  {
    accessorKey: "job_type_id",
    header: "Job Type",
    cell: ({ row }) => JOB_TYPES[row.original.job_type_id ?? 0] ?? "—",
  },
  {
    accessorKey: "service_type_id",
    header: "Service Type",
    cell: ({ row }) => SERVICE_TYPES[row.original.service_type_id ?? 0] ?? "—",
  },
  {
    id: "workshop_name",
    header: "Work Shop Name",
    cell: ({ row }) => getWorkshopName(row.original),
  },
  {
    accessorKey: "outside_parts",
    header: "Outside Parts",
    cell: ({ row }) => row.original.outside_parts?.trim() || "—",
  },
  {
    accessorKey: "registration_no",
    header: "Vehicle No",
    cell: ({ row }) => row.original.registration_no || "—",
  },
  {
    accessorKey: "make_type_name",
    header: "Make",
    cell: ({ row }) => row.original.make_type_name || "—",
  },
  {
    accessorKey: "variant_name",
    header: "Variant",
    cell: ({ row }) => row.original.variant_name || "—",
  },
  {
    accessorKey: "kmr",
    header: "Odo Reading",
    cell: ({ row }) => row.original.kmr || "—",
  },
  {
    accessorKey: "ps_name",
    header: "Posting",
    cell: ({ row }) => row.original.ps_name || "—",
  },
  {
    accessorKey: "officer_name",
    header: "Officer Name",
    cell: ({ row }) => row.original.officer_name || "—",
  },
  {
    accessorKey: "driver_name",
    header: "Driver Name",
    cell: ({ row }) => row.original.driver_name || "—",
  },
  {
    accessorKey: "mechanic_names",
    header: "Mechanic Name",
    cell: ({ row }) => renderMultiline(row.original.mechanic_names),
  },
  {
    accessorKey: "allocated_items_details",
    header: "Issued Item Name(Qty)",
    cell: ({ row }) => renderMultiline(row.original.allocated_items_details),
  },
  { accessorKey: "job_card_status", header: "Status" },
];

export function DailyJobCardReportClient({
  rows,
  fromDate,
  toDate,
  serviceTypeId,
}: {
  rows: DailyJobCardReportRow[];
  fromDate: string;
  toDate: string;
  serviceTypeId?: number;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [serviceType, setServiceType] = useState(serviceTypeId ? String(serviceTypeId) : "");

  function buildUrl(nextFrom: string, nextTo: string, nextServiceType: string) {
    const params = new URLSearchParams({ from: nextFrom, to: nextTo });
    if (nextServiceType) params.set("service_type_id", nextServiceType);
    return `/reports/daily-job-card?${params.toString()}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Job Card Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!from || !to) return;
            router.push(buildUrl(from, to, serviceType));
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="from-date">From Date *</Label>
            <Input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to-date">To Date *</Label>
            <Input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 min-w-[180px]">
            <Label htmlFor="service-type">Service Type</Label>
            <select
              id="service-type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Service Types</option>
              {Object.entries(SERVICE_TYPES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Search</Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Showing job cards from {formatDate(fromDate)} to {formatDate(toDate)}
          {serviceTypeId ? ` · ${SERVICE_TYPES[serviceTypeId]}` : ""}
        </p>

        <DataTable
          columns={columns}
          data={rows}
          searchKey="registration_no"
          searchPlaceholder="Search:"
         exportTitle="Daily Job Card Report" exportFileName="daily-job-card-report"/>
      </CardContent>
    </Card>
  );
}
