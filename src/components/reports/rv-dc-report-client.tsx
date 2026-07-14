"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { RvDcReportRow } from "@/lib/types";

const columns: ColumnDef<RvDcReportRow>[] = [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "report_date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.report_date),
  },
  { accessorKey: "note_file_no", header: "Note File No" },
  { accessorKey: "rv_dc_number", header: "RV / DC Number" },
  { accessorKey: "received_from", header: "Received From" },
  {
    accessorKey: "make_name",
    header: "Make",
    cell: ({ row }) => row.original.make_name || "—",
  },
  {
    accessorKey: "variant_name",
    header: "Variant",
    cell: ({ row }) => row.original.variant_name || "—",
  },
  { accessorKey: "item_name", header: "Item Name" },
  { accessorKey: "sanctioned_qty", header: "Sanctioned Qty" },
  { accessorKey: "received_qty", header: "Received Qty" },
  {
    accessorKey: "received_date_qty",
    header: "Received Date(Qty)",
    cell: ({ row }) => row.original.received_date_qty || "—",
  },
  { accessorKey: "pending_qty", header: "Pending Qty" },
  { accessorKey: "item_status", header: "Status" },
];

export function RvDcReportClient({ data }: { data: RvDcReportRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>RV-DC Report</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          searchKey="rv_dc_number"
          searchPlaceholder="Search:"
         exportTitle="RV-DC Report" exportFileName="rv-dc-report"/>
      </CardContent>
    </Card>
  );
}
