"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createVehicleFuelAction,
  updateVehicleFuelAction,
  deleteVehicleFuelAction,
} from "@/actions/vehicle.actions";
import { formatDateDdMmYyyy } from "@/lib/utils";
import type { Vehicle, VehicleFuelEntry } from "@/lib/types";

function getKmTravelled(row: VehicleFuelEntry): number {
  return Number(row.current_reading ?? 0) - Number(row.previous_reading ?? 0);
}

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  return value.split("T")[0];
}

export function VehicleFuelClient({
  vehicle,
  fuelEntries,
  vehicleFuelLast,
}: {
  vehicle: Vehicle;
  fuelEntries: VehicleFuelEntry[];
  vehicleFuelLast: VehicleFuelEntry | null;
}) {
  const router = useRouter();
  const [editItem, setEditItem] = useState<VehicleFuelEntry | null>(null);
  const [, startTransition] = useTransition();

  const defaultPreviousReading = vehicleFuelLast?.current_reading ?? 0;
  const defaultPreviousFillingDate = toDateInputValue(vehicleFuelLast?.filling_date);

  const columns: ColumnDef<VehicleFuelEntry>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
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
    },
    {
      id: "km_travelled",
      header: "KM Travelled",
      cell: ({ row }) => getKmTravelled(row.original),
    },
    {
      accessorKey: "liters",
      header: "Liters",
    },
    {
      accessorKey: "mileage",
      header: "Mileage",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditItem(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              startTransition(async () => {
                const result = await deleteVehicleFuelAction(
                  row.original.vehicle_fuel_id,
                  vehicle.vehicle_id
                );
                toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
                if (result.statusCode === 200) router.refresh();
              });
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const AddFuelForm = () => (
    <>
      <input type="hidden" name="vehicle_id" value={vehicle.vehicle_id} />
      {defaultPreviousFillingDate ? (
        <input type="hidden" name="previous_filling_date" value={defaultPreviousFillingDate} />
      ) : null}
      <div className="space-y-2">
        <Label>Filling Date</Label>
        <Input type="date" name="filling_date" required />
      </div>
      <div className="space-y-2">
        <Label>Previous Reading</Label>
        <input type="hidden" name="previous_reading" value={defaultPreviousReading} />
        <Input
          type="number"
          defaultValue={defaultPreviousReading}
          readOnly
          className="bg-muted"
        />
      </div>
      <div className="space-y-2">
        <Label>Current Reading</Label>
        <Input type="number" name="current_reading" min={0} required />
      </div>
      <div className="space-y-2">
        <Label>Liters</Label>
        <Input name="liters" required />
      </div>
    </>
  );

  const EditFuelForm = ({ item }: { item: VehicleFuelEntry }) => (
    <>
      <input type="hidden" name="vehicle_id" value={vehicle.vehicle_id} />
      <input type="hidden" name="vehicle_fuel_id" value={item.vehicle_fuel_id} />
      <div className="space-y-2">
        <Label>Filling Date</Label>
        <Input
          type="date"
          name="filling_date"
          defaultValue={toDateInputValue(item.filling_date)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Previous Reading</Label>
        <input type="hidden" name="previous_reading" value={item.previous_reading ?? 0} />
        <Input
          type="number"
          defaultValue={item.previous_reading ?? 0}
          readOnly
          className="bg-muted"
        />
      </div>
      <div className="space-y-2">
        <Label>Current Reading</Label>
        <Input
          type="number"
          name="current_reading"
          min={0}
          defaultValue={item.current_reading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Liters</Label>
        <Input name="liters" defaultValue={item.liters} required />
      </div>
    </>
  );

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vehicles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Vehicle Fuel - ${vehicle.registration_no}`}
        description={`${vehicle.make_type_name ?? ""} ${vehicle.variant_name ?? ""}`.trim() || "Fuel records"}
      >
        <CrudDialog title="Add Fuel Record" onSubmit={createVehicleFuelAction}>
          <AddFuelForm />
        </CrudDialog>
      </PageHeader>

      <DataTable columns={columns} data={fuelEntries} searchKey="filling_date" />

      {editItem && (
        <CrudDialog
          title="Edit Fuel Record"
          onSubmit={updateVehicleFuelAction}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          hideTrigger
        >
          <EditFuelForm item={editItem} />
        </CrudDialog>
      )}
    </div>
  );
}
