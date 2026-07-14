"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@/lib/types";

function formatMonthLabel(monthValue: string): string {
  const [year, month] = monthValue.split("-").map(Number);
  if (!year || !month) return monthValue;
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function InspectionReportClient({
  rows,
  monthValue,
}: {
  rows: Inspection[];
  monthValue: string;
}) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(monthValue);

  const columns: ColumnDef<Inspection>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      accessorKey: "registration_no",
      header: "Vehicle",
      cell: ({ row }) => row.original.registration_no || "—",
    },
    {
      accessorKey: "job_card_id",
      header: "Job Card",
      cell: ({ row }) => row.original.job_card_id || "—",
    },
    {
      accessorKey: "inspected_by",
      header: "Inspected By",
      cell: ({ row }) => row.original.inspected_by || "—",
    },
    {
      accessorKey: "inspected_on",
      header: "Inspected On",
      cell: ({ row }) => formatDate(row.original.inspected_on),
    },
    {
      accessorKey: "general_number",
      header: "General Number",
      cell: ({ row }) => row.original.general_number || "—",
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => row.original.comment || "—",
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => formatDate(row.original.created_on),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-2 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedMonth) return;
            router.push(`/reports/inspection?month=${selectedMonth}`);
          }}
        >
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label htmlFor="inspection-report-month">Month Year*</Label>
            <input
              id="inspection-report-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-sm text-muted-foreground">
              {formatMonthLabel(selectedMonth)}
            </p>
          </div>
          <Button type="submit">Submit</Button>
        </form>

        <DataTable
          columns={columns}
          data={rows}
          searchKey="registration_no"
          searchPlaceholder="Search vehicle..."
          exportTitle="Inspection Report"
          exportFileName="inspection-report"
        />
      </CardContent>
    </Card>
  );
}
