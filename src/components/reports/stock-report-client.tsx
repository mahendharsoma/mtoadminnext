"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockReportRow } from "@/lib/types";

function getMakeLabel(row: StockReportRow): string {
  return Number(row.is_common) === 1 ? "Common" : row.make_type || "NA";
}

function getVariantLabel(row: StockReportRow): string {
  return Number(row.is_common) === 1 ? "All Vehicles" : row.variant_name || "NA";
}

const columns: ColumnDef<StockReportRow>[] = [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "make_type",
    header: "Make Type",
    cell: ({ row }) => getMakeLabel(row.original),
  },
  {
    accessorKey: "variant_name",
    header: "Variant",
    cell: ({ row }) => getVariantLabel(row.original),
  },
  {
    accessorKey: "item_name",
    header: "Item Name",
    cell: ({ row }) => row.original.item_name || "—",
  },
  {
    // CI4 view has this header, but the cell content is commented out.
    id: "total_sanctioned_quantity",
    header: "Total Sanctioned Quantity",
    cell: () => "",
  },
  {
    accessorKey: "pending_quantity",
    header: "Total Pending Quantity",
    cell: ({ row }) => row.original.pending_quantity ?? "",
  },
  {
    accessorKey: "received_quantity",
    header: "Total Received Quantity",
    cell: ({ row }) => row.original.received_quantity ?? "",
  },
  {
    accessorKey: "available_quantity",
    header: "Available Quantity",
    cell: ({ row }) => row.original.available_quantity ?? "",
  },
];

export function StockReportClient({ rows }: { rows: StockReportRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Report</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={rows}
          searchKey="item_name"
          searchPlaceholder="Search:"
        />
      </CardContent>
    </Card>
  );
}
