"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockReportRow } from "@/lib/types";

function getMakeLabel(row: StockReportRow): string {
  if (Number(row.is_common) === 1 || Number(row.make_type_id) === 0) {
    return "Common";
  }
  return row.make_type || "NA";
}

function getVariantLabel(row: StockReportRow): string {
  if (Number(row.is_common) === 1 || Number(row.variant_id) === 0) {
    return "All Vehicles";
  }
  return row.variant_name || "NA";
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
    accessorKey: "total_quantity",
    header: "Total Quantity",
    cell: ({ row }) => Number(row.original.total_quantity ?? 0),
  },
  {
    accessorKey: "available_quantity",
    header: "Available Quantity",
    cell: ({ row }) => Number(row.original.available_quantity ?? 0),
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
          exportTitle="Stock Report"
          exportFileName="stock-report"
        />
      </CardContent>
    </Card>
  );
}
