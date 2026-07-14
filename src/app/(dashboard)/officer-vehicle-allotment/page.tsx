import { StreamPage } from "@/components/shared/stream-page";
import { psRepository } from "@/lib/db/repositories/ps.repository";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { allotmentRepository } from "@/lib/db/repositories/allotment.repository";
import { OfficerAllotmentClient } from "@/components/ps/officer-allotment-client";

export default function OfficerVehicleAllotmentPage({
  searchParams,
}: {
  searchParams: Promise<{ ps_id?: string; vehicle_id?: string }>;
}) {
  return (
    <StreamPage>
      <OfficerVehicleAllotmentPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function OfficerVehicleAllotmentPageContent({
  searchParams,
}: {
  searchParams: Promise<{ ps_id?: string; vehicle_id?: string }>;
}) {
  const params = await searchParams;
  const selectedPsId = params.ps_id ? Number(params.ps_id) : undefined;
  const selectedVehicleId = params.vehicle_id ? Number(params.vehicle_id) : undefined;

  const psList = await psRepository.getAllPs();

  const [vehicles, allocatedOfficer, officers] = await Promise.all([
    selectedPsId ? vehicleRepository.getVehiclesByPsId(selectedPsId) : Promise.resolve([]),
    selectedVehicleId
      ? allotmentRepository.getVehicleAllocatedOfficer(selectedVehicleId)
      : Promise.resolve(null),
    selectedVehicleId ? allotmentRepository.getActiveOfficers() : Promise.resolve([]),
  ]);

  return (
    <OfficerAllotmentClient
      psList={psList}
      selectedPsId={selectedPsId}
      vehicles={vehicles}
      selectedVehicleId={selectedVehicleId}
      allocatedOfficer={allocatedOfficer}
      officers={officers}
    />
  );
}