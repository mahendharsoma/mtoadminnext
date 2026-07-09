"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createVehicleAllotmentAction,
  reassignOfficerAllotmentAction,
} from "@/actions/allotment.actions";
import type { PoliceStation, Officer, Vehicle } from "@/lib/types";
import type { OfficerVehicleMapping } from "@/lib/db/repositories/allotment.repository";

export function OfficerAllotmentClient({
  psList,
  selectedPsId,
  vehicles,
  selectedVehicleId,
  allocatedOfficer,
  officers,
}: {
  psList: PoliceStation[];
  selectedPsId?: number;
  vehicles: Vehicle[];
  selectedVehicleId?: number;
  allocatedOfficer: OfficerVehicleMapping | null;
  officers: Officer[];
}) {
  const router = useRouter();
  const [reassignOpen, setReassignOpen] = useState(false);

  function onPsChange(psId: string) {
    if (!psId) {
      router.push("/officer-vehicle-allotment");
      return;
    }
    router.push(`/officer-vehicle-allotment?ps_id=${psId}`);
  }

  function onVehicleSelect(vehicleId: number) {
    if (!selectedPsId) return;
    router.push(`/officer-vehicle-allotment?ps_id=${selectedPsId}&vehicle_id=${vehicleId}`);
  }

  const selectedVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId);

  return (
    <div className="space-y-6">
      <PageHeader title="Officer Vehicle Allotment" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Police Station</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedPsId ?? ""}
            onChange={(e) => onPsChange(e.target.value)}
            className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Select PS --</option>
            {psList.map((ps) => (
              <option key={ps.ps_id} value={ps.ps_id}>
                {ps.ps_name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedPsId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length ? (
              <div className="flex flex-wrap gap-2">
                {vehicles.map((vehicle) => (
                  <Button
                    key={vehicle.vehicle_id}
                    type="button"
                    variant={selectedVehicleId === vehicle.vehicle_id ? "default" : "outline"}
                    onClick={() => onVehicleSelect(vehicle.vehicle_id)}
                  >
                    {vehicle.registration_no}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vehicles found for this PS.</p>
            )}
          </CardContent>
        </Card>
      )}

      {selectedPsId && selectedVehicleId && selectedVehicle && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Vehicle: {selectedVehicle.registration_no}
            </CardTitle>
            <Link
              href={`/officer-vehicle-allotment/drivers?ps_id=${selectedPsId}&vehicle_id=${selectedVehicleId}`}
            >
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4" />
                Manage Drivers
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {allocatedOfficer ? (
              <div className="rounded border p-4 space-y-2">
                <h4 className="font-medium">Allocated Officer</h4>
                <p>Name: {allocatedOfficer.officer_name}</p>
                <p>Mobile: {allocatedOfficer.officer_mobile}</p>
                <p>Employee Id: {allocatedOfficer.officer_rank}</p>
                <p>From Date: {allocatedOfficer.from_date}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setReassignOpen(true)}>
                  <Pencil className="h-4 w-4" />
                  Re-assign Officer
                </Button>
              </div>
            ) : (
              <CrudDialog title="Allocate Vehicle" onSubmit={createVehicleAllotmentAction} triggerLabel="Allocate Officer">
                <input type="hidden" name="vehicle_id" value={selectedVehicleId} />
                <input type="hidden" name="ps_id" value={selectedPsId} />
                <div className="space-y-2">
                  <Label>Select Officer *</Label>
                  <select
                    name="officer_id"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">-- Select Officer --</option>
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
            )}
          </CardContent>
        </Card>
      )}

      {allocatedOfficer && reassignOpen && (
        <CrudDialog
          title="Re-assign Officer"
          onSubmit={reassignOfficerAllotmentAction}
          open={reassignOpen}
          onOpenChange={setReassignOpen}
          hideTrigger
        >
          <input type="hidden" name="officer_vehicle_mapping_id" value={allocatedOfficer.officer_vehicle_mapping_id} />
          <input type="hidden" name="vehicle_id" value={selectedVehicleId} />
          <input type="hidden" name="ps_id" value={selectedPsId} />
          <div className="space-y-2">
            <Label>Select Officer *</Label>
            <select
              name="officer_id"
              defaultValue={allocatedOfficer.officer_id}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">-- Select Officer --</option>
              {officers.map((officer) => (
                <option key={officer.officer_id} value={officer.officer_id}>
                  {officer.officer_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Allocated Date *</Label>
            <Input name="from_date" type="date" defaultValue={allocatedOfficer.from_date} required />
          </div>
        </CrudDialog>
      )}
    </div>
  );
}
