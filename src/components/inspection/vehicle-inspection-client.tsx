"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Vehicle, Inspection } from "@/lib/types";

export function VehicleInspectionClient({
  vehicle,
  inspections,
}: {
  vehicle: Vehicle;
  inspections: Inspection[];
}) {
  const columns: ColumnDef<Inspection>[] = [
    { accessorKey: "inspection_id", header: "ID" },
    { accessorKey: "job_card_id", header: "Job Card" },
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
    <div>
      <div className="mb-4">
        <Link href="/inspection/by-vehicle">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
      <PageHeader
        title={`Inspections — ${vehicle.registration_no}`}
        description={`${vehicle.make_type_name ?? ""} ${vehicle.variant_name ?? ""}`.trim()}
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vehicle Info</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>Engine: {vehicle.engine_no || "—"}</p>
          <p>Chassis: {vehicle.chassis_no || "—"}</p>
          <p>PS: {vehicle.ps_name || "—"}</p>
        </CardContent>
      </Card>
      <DataTable columns={columns} data={inspections} searchKey="general_number" exportTitle="Vehicle Inspections" exportFileName="vehicle-inspections" />
    </div>
  );
}
