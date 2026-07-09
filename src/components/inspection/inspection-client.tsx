"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/types";

export function InspectionVehiclesClient({ vehicles }: { vehicles: Vehicle[] }) {
  const columns: ColumnDef<Vehicle>[] = [
    { accessorKey: "registration_no", header: "Registration" },
    { accessorKey: "make_type_name", header: "Make" },
    { accessorKey: "variant_name", header: "Variant" },
    { accessorKey: "ps_name", header: "PS" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/inspection/${row.original.vehicle_id}`}>
          <Button variant="outline" size="sm"><Eye className="h-4 w-4" /> Inspect</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Inspections by Vehicle" description="Select a vehicle to run inspection" />
      <DataTable columns={columns} data={vehicles} searchKey="registration_no" />
    </div>
  );
}
