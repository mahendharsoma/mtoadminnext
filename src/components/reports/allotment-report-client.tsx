"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfficerVehicleAllotmentReportRow } from "@/lib/types";

const columns: ColumnDef<OfficerVehicleAllotmentReportRow>[] = [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "ps_name",
    header: "PS Name",
    cell: ({ row }) => row.original.ps_name || "NA",
  },
  {
    accessorKey: "registration_no",
    header: "Registration No",
    cell: ({ row }) => row.original.registration_no || "NA",
  },
  {
    accessorKey: "make_type",
    header: "Make Type",
    cell: ({ row }) => row.original.make_type || "NA",
  },
  {
    accessorKey: "variant_name",
    header: "Variant",
    cell: ({ row }) => row.original.variant_name || "NA",
  },
  {
    accessorKey: "model_year",
    header: "Model Year",
    cell: ({ row }) => row.original.model_year || "NA",
  },
  {
    accessorKey: "officer_name",
    header: "Officer Name",
    cell: ({ row }) => row.original.officer_name || "NA",
  },
  {
    accessorKey: "driver_names",
    header: "Driver Names",
    cell: ({ row }) => row.original.driver_names || "NA",
  },
];

export function AllotmentReportClient({
  data,
}: {
  data: OfficerVehicleAllotmentReportRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Officer Vehicle Allotment Report</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          searchKey="registration_no"
          searchPlaceholder="Search vehicle / officer..."
          exportTitle="Officer Vehicle Allotment Report"
          exportFileName="officer-vehicle-allotment-report"
        />
      </CardContent>
    </Card>
  );
}
