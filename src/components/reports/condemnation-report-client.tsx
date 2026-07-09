"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { JOB_TYPES, SERVICE_TYPES } from "@/lib/constants";
import { formatDateDdMmYyyy } from "@/lib/utils";
import type { CondemnationReportRow } from "@/lib/types";

const CONDEMNATION_STATUSES = ["Received", "Pending"] as const;

function getWorkshopName(row: CondemnationReportRow): string {
  if (row.job_type_id === 1) {
    return "In Side";
  }
  return row.outside_work_shop?.trim() || "Not Given";
}

function getMakeLabel(row: CondemnationReportRow): string {
  if (Number((row as { is_common?: number | string }).is_common ?? 0) === 1) {
    return "Common";
  }
  return row.make_type || "NA";
}

function getVariantLabel(row: CondemnationReportRow): string {
  if (Number((row as { is_common?: number | string }).is_common ?? 0) === 1) {
    return "All Vehicles";
  }
  return row.variant_name || "NA";
}

const columns: ColumnDef<CondemnationReportRow>[] = [
  {
    id: "serial",
    header: "S.NO",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  { accessorKey: "received_voucher", header: "RV", cell: ({ row }) => row.original.received_voucher || "—" },
  {
    accessorKey: "created_on",
    header: "DATE (DD/MM/YYYY)",
    cell: ({ row }) => formatDateDdMmYyyy((row.original as { created_on?: string }).created_on),
  },
  { accessorKey: "it_no", header: "IT.NO", cell: ({ row }) => row.original.it_no || "—" },
  {
    accessorKey: "job_type_id",
    header: "JOB TYPE",
    cell: ({ row }) => JOB_TYPES[row.original.job_type_id ?? 0] ?? "—",
  },
  { accessorKey: "outside_parts", header: "Outside Parts", cell: ({ row }) => row.original.outside_parts?.trim() || "" },
  {
    accessorKey: "service_type_id",
    header: "Service Type",
    cell: ({ row }) => SERVICE_TYPES[row.original.service_type_id ?? 0] ?? "",
  },
  { id: "workshop_name", header: "WORK SHOP NAME", cell: ({ row }) => getWorkshopName(row.original) },
  { accessorKey: "registration_no", header: "VEHICLE NO", cell: ({ row }) => row.original.registration_no || "—" },
  { accessorKey: "make_type", header: "MAKE", cell: ({ row }) => getMakeLabel(row.original) },
  { accessorKey: "variant_name", header: "VARIANT", cell: ({ row }) => getVariantLabel(row.original) },
  { accessorKey: "item_name", header: "ITEM NAME", cell: ({ row }) => row.original.item_name || "NA" },
  { accessorKey: "item_quantity", header: "QTY" },
  { accessorKey: "status", header: "Status" },
];

export function CondemnationReportClient({
  rows,
  selectedStatus,
}: {
  rows: CondemnationReportRow[];
  selectedStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(selectedStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condemnation Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams();
            params.set("status", status || "Received");
            router.push(`/reports/condemnation?${params.toString()}`);
          }}
        >
          <div className="space-y-1 min-w-[220px]">
            <Label htmlFor="condemnation-status">Condemnation Status</Label>
            <select
              id="condemnation-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CONDEMNATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Search</Button>
        </form>

        <DataTable
          columns={columns}
          data={rows}
          searchKey="registration_no"
          searchPlaceholder="Search:"
        />
      </CardContent>
    </Card>
  );
}
