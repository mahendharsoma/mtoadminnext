"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDriverAllotmentAction,
  reassignDriverAllotmentAction,
  deleteDriverVehicleMapAction,
} from "@/actions/allotment.actions";
import type { Officer, Vehicle } from "@/lib/types";
import type { DriverVehicleMapping } from "@/lib/db/repositories/allotment.repository";

export function DriverAllotmentClient({
  psId,
  vehicleId,
  vehicle,
  drivers,
  officers,
}: {
  psId: number;
  vehicleId: number;
  vehicle: Vehicle;
  drivers: DriverVehicleMapping[];
  officers: Officer[];
}) {
  const router = useRouter();
  const [reassign, setReassign] = useState<DriverVehicleMapping | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<DriverVehicleMapping>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    { accessorKey: "driver_name", header: "Driver Name" },
    { accessorKey: "officer_mobile", header: "Mobile Number" },
    { accessorKey: "from_date", header: "Allocated Date" },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setReassign(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!confirm("Remove this driver allocation?")) return;
              startTransition(async () => {
                const result = await deleteDriverVehicleMapAction(
                  row.original.driver_vehicle_mapping_id,
                  psId,
                  vehicleId
                );
                toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
                router.refresh();
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
    <div className="space-y-6">
      <div>
        <Link href={`/officer-vehicle-allotment?ps_id=${psId}&vehicle_id=${vehicleId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Officer Allotment
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Driver Vehicle Allotment"
        description={`Vehicle: ${vehicle.registration_no}`}
      >
        <CrudDialog title="Allocate Driver" onSubmit={createDriverAllotmentAction} triggerLabel="Allocate Driver">
          <input type="hidden" name="vehicle_id" value={vehicleId} />
          <input type="hidden" name="ps_id" value={psId} />
          <div className="space-y-2">
            <Label>Driver Officer *</Label>
            <select
              name="driver_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">-- Select Driver --</option>
              {officers.map((officer) => (
                <option key={officer.officer_id} value={officer.officer_id}>
                  {officer.officer_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Allocated Date *</Label>
            <Input name="from_date" type="date" required />
          </div>
        </CrudDialog>
      </PageHeader>

      <DataTable columns={columns} data={drivers} searchKey="driver_name" searchPlaceholder="Search:" />

      {reassign && (
        <CrudDialog
          title="Re-assign Driver"
          onSubmit={reassignDriverAllotmentAction}
          open={!!reassign}
          onOpenChange={(open) => !open && setReassign(null)}
          hideTrigger
        >
          <input type="hidden" name="driver_vehicle_mapping_id" value={reassign.driver_vehicle_mapping_id} />
          <input type="hidden" name="vehicle_id" value={vehicleId} />
          <input type="hidden" name="ps_id" value={psId} />
          <div className="space-y-2">
            <Label>Select Driver *</Label>
            <select
              name="driver_id"
              defaultValue={reassign.driver_id}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">-- Select Driver --</option>
              {officers.map((officer) => (
                <option key={officer.officer_id} value={officer.officer_id}>
                  {officer.officer_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Allocated Date *</Label>
            <Input name="from_date" type="date" defaultValue={reassign.from_date} required />
          </div>
        </CrudDialog>
      )}
    </div>
  );
}
