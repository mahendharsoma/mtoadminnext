"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ReportPageClient } from "@/components/reports/report-client";
import type { RowDataPacket } from "mysql2/promise";

const columns: ColumnDef<RowDataPacket>[] = [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  { accessorKey: "ps_name", header: "PS Name" },
  { accessorKey: "registration_no", header: "Registration No" },
  { accessorKey: "make_type", header: "Make Type" },
  { accessorKey: "variant_name", header: "Variant" },
  { accessorKey: "model_year", header: "Model Year" },
  { accessorKey: "officer_name", header: "Officer Name" },
  { accessorKey: "driver_names", header: "Driver Names" },
];

export function AllotmentReportClient({ data }: { data: RowDataPacket[] }) {
  return (
    <ReportPageClient
      title="Officer Vehicle Allotment Report"
      description="Vehicle-wise officer and driver allotment details"
      columns={columns}
      data={data}
      searchKey="registration_no"
      searchPlaceholder="Search:"
    />
  );
}
