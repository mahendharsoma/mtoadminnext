"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { JOB_TYPES, SERVICE_TYPES } from "@/lib/constants";
import { formatDateDdMmYyyy } from "@/lib/utils";
import type { Vehicle, VehicleOverallServiceReportRow } from "@/lib/types";

function getWorkshopName(row: VehicleOverallServiceReportRow): string {
  if (row.job_type_id === 1) return "In Side";
  return row.outside_work_shop?.trim() || "Not Given";
}

const columns: ColumnDef<VehicleOverallServiceReportRow>[] = [
  {
    id: "serial",
    header: "S.NO",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "date_in",
    header: "DATE (DD/MM/YYYY)",
    cell: ({ row }) => formatDateDdMmYyyy(row.original.date_in || row.original.created_on),
  },
  {
    accessorKey: "it_no",
    header: "IT.NO",
    cell: ({ row }) => row.original.it_no || "—",
  },
  {
    accessorKey: "job_type_id",
    header: "JOB TYPE",
    cell: ({ row }) => JOB_TYPES[row.original.job_type_id ?? 0] ?? "—",
  },
  {
    accessorKey: "service_type_id",
    header: "Service Type",
    cell: ({ row }) => SERVICE_TYPES[row.original.service_type_id ?? 0] ?? "—",
  },
  {
    id: "workshop_name",
    header: "WORK SHOP NAME",
    cell: ({ row }) => getWorkshopName(row.original),
  },
  {
    accessorKey: "outside_parts",
    header: "Outside Parts",
    cell: ({ row }) => row.original.outside_parts?.trim() || "—",
  },
  {
    accessorKey: "registration_no",
    header: "VEHICLE NO",
    cell: ({ row }) => row.original.registration_no || "—",
  },
  {
    accessorKey: "make_type",
    header: "MAKE",
    cell: ({ row }) => row.original.make_type || "—",
  },
  {
    accessorKey: "variant_name",
    header: "VARIANT",
    cell: ({ row }) => row.original.variant_name || "—",
  },
  {
    accessorKey: "ps_name",
    header: "PS",
    cell: ({ row }) => row.original.ps_name || "—",
  },
  {
    accessorKey: "kmr",
    header: "Odo Reading",
    cell: ({ row }) => row.original.kmr || "—",
  },
  {
    accessorKey: "issued_items",
    header: "Issued Items",
    cell: ({ row }) => (
      <div className="whitespace-pre-wrap text-xs max-w-sm">
        {row.original.issued_items || "—"}
      </div>
    ),
  },
  {
    accessorKey: "job_card_status",
    header: "Status",
    cell: ({ row }) => row.original.job_card_status || "—",
  },
];

export function VehicleOverallServiceReportClient({
  vehicles,
  rows,
  selectedVehicleId,
}: {
  vehicles: Vehicle[];
  rows: VehicleOverallServiceReportRow[];
  selectedVehicleId?: number;
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(
    selectedVehicleId ? String(selectedVehicleId) : ""
  );

  const selectedVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Overall Service Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!vehicleId) {
              router.push("/reports/vehicle-overall-service");
              return;
            }
            // CI4 equivalent: vehicle_overall_service_report/(:any)
            router.push(`/reports/vehicle-overall-service/${vehicleId}`);
          }}
        >
          <div className="space-y-1 min-w-[280px]">
            <Label htmlFor="vehicle">Select Vehicle</Label>
            <select
              id="vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {vehicle.registration_no}
                  {vehicle.make_type_name || vehicle.variant_name
                    ? ` — ${vehicle.make_type_name ?? ""} ${vehicle.variant_name ?? ""}`.trim()
                    : ""}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Search</Button>
        </form>

        {selectedVehicle && (
          <p className="text-sm text-muted-foreground">
            Showing closed job cards for{" "}
            <span className="font-medium text-foreground">
              {selectedVehicle.registration_no}
            </span>
            {selectedVehicle.make_type_name || selectedVehicle.variant_name
              ? ` (${[selectedVehicle.make_type_name, selectedVehicle.variant_name]
                  .filter(Boolean)
                  .join(" / ")})`
              : ""}
          </p>
        )}

        {selectedVehicleId ? (
          <DataTable
            columns={columns}
            data={rows}
            searchKey="it_no"
            searchPlaceholder="Search:"
           exportTitle="Vehicle Overall Service Report" exportFileName="vehicle-overall-service-report"/>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a vehicle and click Search to view overall service history.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
