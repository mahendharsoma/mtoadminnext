"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatDateDdMmYyyy } from "@/lib/utils";
import type { VehicleFuelReportRow } from "@/lib/types";

function getKmTravelled(row: VehicleFuelReportRow): number {
  const previous = Number(row.previous_reading ?? 0);
  const current = Number(row.current_reading ?? 0);
  return current - previous;
}

const columns: ColumnDef<VehicleFuelReportRow>[] = [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "registration_no",
    header: "Vehicle No",
    cell: ({ row }) => row.original.registration_no || "—",
  },
  {
    accessorKey: "filling_date",
    header: "Filling Date",
    cell: ({ row }) => formatDateDdMmYyyy(row.original.filling_date),
  },
  {
    accessorKey: "previous_reading",
    header: "Previous Reading",
    cell: ({ row }) => row.original.previous_reading ?? 0,
  },
  {
    accessorKey: "current_reading",
    header: "Current Reading",
    cell: ({ row }) => row.original.current_reading ?? 0,
  },
  {
    id: "km_travelled",
    header: "KM Travelled",
    cell: ({ row }) => getKmTravelled(row.original),
  },
  {
    accessorKey: "liters",
    header: "Liters",
    cell: ({ row }) => row.original.liters || "—",
  },
  {
    accessorKey: "mileage",
    header: "Mileage",
    cell: ({ row }) => row.original.mileage || "—",
  },
];

export function VehicleFuelReportClient({
  rows,
  monthValue,
}: {
  rows: VehicleFuelReportRow[];
  monthValue: string;
}) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(monthValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Fuel Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedMonth) return;
            router.push(`/reports/vehicle-fuel?month=${selectedMonth}`);
          }}
        >
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label htmlFor="month-year">Select Month</Label>
            <input
              id="month-year"
              type="month"
              name="month_year"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <DataTable
          columns={columns}
          data={rows}
          searchKey="registration_no"
          searchPlaceholder="Search:"
         exportTitle="Vehicle Fuel Report" exportFileName="vehicle-fuel-report"/>
      </CardContent>
    </Card>
  );
}
