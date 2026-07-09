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

export function InspectionListClient({
  inspections,
  monthValue,
}: {
  inspections: Inspection[];
  monthValue: string;
}) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(monthValue);

  const columns: ColumnDef<Inspection>[] = [
    { accessorKey: "inspection_id", header: "ID" },
    { accessorKey: "job_card_id", header: "Job Card" },
    {
      accessorKey: "registration_no",
      header: "Vehicle",
      cell: ({ row }) => row.original.registration_no || "—",
    },
    { accessorKey: "inspected_by", header: "Inspected By" },
    {
      accessorKey: "inspected_on",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.inspected_on),
    },
    { accessorKey: "general_number", header: "General No" },
    { accessorKey: "comment", header: "Comment" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-2 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedMonth) return;
            router.push(`/inspection?month=${selectedMonth}`);
          }}
        >
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label htmlFor="inspection-month">Select Month</Label>
            <input
              id="inspection-month"
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
          data={inspections}
          searchKey="registration_no"
          searchPlaceholder="Search:"
        />
      </CardContent>
    </Card>
  );
}
