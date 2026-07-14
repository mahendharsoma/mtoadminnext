"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
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

function formatMileageDisplay(previous: number, current: number, liters: string): string {
  const litersNum = Number(liters);
  const distance = current - previous;
  if (!litersNum || litersNum <= 0 || distance <= 0) return "—";
  return `${(distance / litersNum).toFixed(2)} km/L`;
}

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  return trimmed.split("T")[0].split(" ")[0];
}

function FuelCalcPreview({
  previousReading,
  currentReading,
  liters,
}: {
  previousReading: number;
  currentReading: string;
  liters: string;
}) {
  const current = Number(currentReading);
  const distance =
    Number.isFinite(current) && current > previousReading
      ? current - previousReading
      : 0;
  const mileage = formatMileageDisplay(previousReading, current, liters);

  return (
    <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm space-y-1">
      <p>
        <span className="text-muted-foreground">KM Travelled: </span>
        <strong>{distance > 0 ? distance : "—"}</strong>
      </p>
      <p>
        <span className="text-muted-foreground">Mileage (auto): </span>
        <strong>{mileage}</strong>
      </p>
      <p className="text-xs text-muted-foreground">
        Mileage = (Current − Previous) ÷ Liters
      </p>
    </div>
  );
}

function AddFuelForm({
  vehicleId,
  previousReading,
  lastFillingDate,
  isFirstFill,
}: {
  vehicleId: number;
  previousReading: number;
  lastFillingDate: string;
  isFirstFill: boolean;
}) {
  const [currentReading, setCurrentReading] = useState("");
  const [liters, setLiters] = useState("");

  return (
    <>
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="previous_reading" value={previousReading} />

      <div className="space-y-2">
        <Label>Filling Date</Label>
        <Input
          type="date"
          name="filling_date"
          min={lastFillingDate || undefined}
          required
        />
        {lastFillingDate ? (
          <p className="text-xs text-muted-foreground">
            Must be on or after last filled date: {formatDateDdMmYyyy(lastFillingDate)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Previous Meter Reading</Label>
        <Input
          type="number"
          value={previousReading}
          readOnly
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          {isFirstFill
            ? "First entry — previous reading starts at 0"
            : "Taken automatically from last fill’s current reading"}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Current Meter Reading*</Label>
        <Input
          type="number"
          name="current_reading"
          min={previousReading + 0.0001}
          step="any"
          value={currentReading}
          onChange={(e) => setCurrentReading(e.target.value)}
          placeholder="Enter current meter reading"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Fuel Quantity (Liters)*</Label>
        <Input
          type="number"
          name="liters"
          min={0.01}
          step="any"
          value={liters}
          onChange={(e) => setLiters(e.target.value)}
          placeholder="Enter liters filled"
          required
        />
      </div>

      <FuelCalcPreview
        previousReading={previousReading}
        currentReading={currentReading}
        liters={liters}
      />
    </>
  );
}

function EditFuelForm({
  vehicleId,
  item,
  fuelEntries,
}: {
  vehicleId: number;
  item: VehicleFuelEntry;
  fuelEntries: VehicleFuelEntry[];
}) {
  const sortedAsc = useMemo(
    () => [...fuelEntries].sort((a, b) => a.vehicle_fuel_id - b.vehicle_fuel_id),
    [fuelEntries]
  );
  const idx = sortedAsc.findIndex((e) => e.vehicle_fuel_id === item.vehicle_fuel_id);
  const prev = idx > 0 ? sortedAsc[idx - 1] : null;
  const next = idx >= 0 && idx < sortedAsc.length - 1 ? sortedAsc[idx + 1] : null;
  const minDate = toDateInputValue(prev?.filling_date);
  const maxDate = toDateInputValue(next?.filling_date);
  const previousReading = Number(item.previous_reading ?? 0);

  const [currentReading, setCurrentReading] = useState(String(item.current_reading ?? ""));
  const [liters, setLiters] = useState(String(item.liters ?? ""));

  return (
    <>
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="vehicle_fuel_id" value={item.vehicle_fuel_id} />
      <input type="hidden" name="previous_reading" value={previousReading} />

      <div className="space-y-2">
        <Label>Filling Date</Label>
        <Input
          type="date"
          name="filling_date"
          defaultValue={toDateInputValue(item.filling_date)}
          min={minDate || undefined}
          max={maxDate || undefined}
          required
        />
        {(minDate || maxDate) && (
          <p className="text-xs text-muted-foreground">
            {minDate
              ? `On or after previous: ${formatDateDdMmYyyy(minDate)}`
              : null}
            {minDate && maxDate ? " · " : null}
            {maxDate ? `On or before next: ${formatDateDdMmYyyy(maxDate)}` : null}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Previous Meter Reading</Label>
        <Input
          type="number"
          value={previousReading}
          readOnly
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label>Current Meter Reading*</Label>
        <Input
          type="number"
          name="current_reading"
          min={previousReading + 0.0001}
          step="any"
          value={currentReading}
          onChange={(e) => setCurrentReading(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Fuel Quantity (Liters)*</Label>
        <Input
          type="number"
          name="liters"
          min={0.01}
          step="any"
          value={liters}
          onChange={(e) => setLiters(e.target.value)}
          required
        />
      </div>

      <FuelCalcPreview
        previousReading={previousReading}
        currentReading={currentReading}
        liters={liters}
      />
    </>
  );
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

  const defaultPreviousReading = Number(vehicleFuelLast?.current_reading ?? 0);
  const lastFillingDate = toDateInputValue(vehicleFuelLast?.filling_date);
  const isFirstFill = !vehicleFuelLast;

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
      header: "Mileage (km/L)",
      cell: ({ row }) => {
        const m = row.original.mileage;
        if (m == null || m === "") return "—";
        const num = Number(m);
        return Number.isFinite(num) ? num.toFixed(2) : String(m);
      },
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
        description={
          `${vehicle.make_type_name ?? ""} ${vehicle.variant_name ?? ""}`.trim() ||
          "Fuel records · Mileage = (Current − Previous) ÷ Liters"
        }
      >
        <CrudDialog title="Add Fuel Record" onSubmit={createVehicleFuelAction}>
          <AddFuelForm
            vehicleId={vehicle.vehicle_id}
            previousReading={defaultPreviousReading}
            lastFillingDate={lastFillingDate}
            isFirstFill={isFirstFill}
          />
        </CrudDialog>
      </PageHeader>

      <DataTable
        columns={columns}
        data={fuelEntries}
        searchKey="filling_date"
        exportTitle={`Vehicle Fuel - ${vehicle.registration_no}`}
        exportFileName="vehicle-fuel"
      />

      {editItem && (
        <CrudDialog
          title="Edit Fuel Record"
          onSubmit={updateVehicleFuelAction}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          hideTrigger
        >
          <EditFuelForm
            vehicleId={vehicle.vehicle_id}
            item={editItem}
            fuelEntries={fuelEntries}
          />
        </CrudDialog>
      )}
    </div>
  );
}
