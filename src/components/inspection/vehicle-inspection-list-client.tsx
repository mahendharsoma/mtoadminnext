"use client";

import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import type { Inspection, Vehicle } from "@/lib/types";

export function VehicleInspectionListClient({
  vehicles,
  inspections,
  selectedVehicleId,
}: {
  vehicles: Vehicle[];
  inspections: Inspection[];
  selectedVehicleId?: number;
}) {
  const router = useRouter();
  const selectedVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId);

  function onVehicleChange(vehicleId: string) {
    if (!vehicleId) {
      router.push("/inspection/by-vehicle");
      return;
    }
    router.push(`/inspection/by-vehicle?vehicle_id=${vehicleId}`);
  }

  const columns: ColumnDef<Inspection>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
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
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Inspection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-select">Select Vehicle :</Label>
          <select
            id="vehicle-select"
            value={selectedVehicleId ?? ""}
            onChange={(e) => onVehicleChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">--Select Vehicle--</option>
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.registration_no || `Vehicle #${v.vehicle_id}`}
                {v.make_type_name ? ` — ${v.make_type_name}` : ""}
                {v.variant_name ? ` ${v.variant_name}` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicleId && selectedVehicle ? (
          <>
            <p className="text-sm text-muted-foreground">
              Showing inspections for{" "}
              <span className="font-medium text-foreground">
                {selectedVehicle.registration_no || `Vehicle #${selectedVehicle.vehicle_id}`}
              </span>
              {selectedVehicle.ps_name ? ` (${selectedVehicle.ps_name})` : ""}
            </p>
            {inspections.length > 0 ? (
              <DataTable
                columns={columns}
                data={inspections}
                searchKey="general_number"
                searchPlaceholder="Search:"
              />
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No inspection records found for this vehicle.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Please select a vehicle to view inspection records.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
