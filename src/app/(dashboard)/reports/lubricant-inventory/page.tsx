import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { ReportPageClient } from "@/components/reports/report-client";
import type { ColumnDef } from "@tanstack/react-table";
import type { RowDataPacket } from "mysql2/promise";

const columns: ColumnDef<RowDataPacket>[] = [
  { accessorKey: "lubricant_name", header: "Lubricant" },
  { accessorKey: "lubricant_type_name", header: "Type" },
  { accessorKey: "lubricant_grade_name", header: "Grade" },
  { accessorKey: "liters_available", header: "Available (L)" },
];

export default async function LubricantInventoryReportPage() {
  const data = await reportsRepository.getLubricantInventoryReport();
  return (
    <ReportPageClient
      title="Lubricant Inventory Report"
      description="Lubricant stock in liters"
      columns={columns}
      data={data}
      searchKey="lubricant_name"
    />
  );
}
