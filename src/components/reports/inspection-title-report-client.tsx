"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { InspectionTitleReportRow } from "@/lib/types";

function formatMonthLabel(monthValue: string): string {
  const [year, month] = monthValue.split("-").map(Number);
  if (!year || !month) return monthValue;
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function InspectionTitleReportClient({
  rows,
  monthValue,
}: {
  rows: InspectionTitleReportRow[];
  monthValue: string;
}) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(monthValue);

  const columns: ColumnDef<InspectionTitleReportRow>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    { accessorKey: "inspection_id", header: "Inspection ID" },
    { accessorKey: "job_card_id", header: "Job Card" },
    {
      accessorKey: "registration_no",
      header: "Vehicle",
      cell: ({ row }) => row.original.registration_no || "—",
    },
    {
      accessorKey: "vehicle_type_name",
      header: "Vehicle Type",
      cell: ({ row }) => row.original.vehicle_type_name || "—",
    },
    { accessorKey: "inspection_title", header: "Inspection Title" },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => row.original.remark || "—",
    },
    { accessorKey: "inspected_by", header: "Inspected By" },
    {
      accessorKey: "inspected_on",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.inspected_on),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Title Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-2 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedMonth) return;
            router.push(`/reports/inspection-title?month=${selectedMonth}`);
          }}
        >
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label htmlFor="report-month">Select Month</Label>
            <input
              id="report-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-sm text-muted-foreground">{formatMonthLabel(selectedMonth)}</p>
          </div>
          <Button type="submit">Search</Button>
        </form>

        <DataTable
          columns={columns}
          data={rows}
          searchKey="registration_no"
          searchPlaceholder="Search:"
         exportTitle="Inspection Title Report" exportFileName="inspection-title-report"/>
      </CardContent>
    </Card>
  );
}
