import { StreamPage } from "@/components/shared/stream-page";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { inspectionRepository } from "@/lib/db/repositories/inspection.repository";
import { VehicleInspectionListClient } from "@/components/inspection/vehicle-inspection-list-client";

export default function VehicleInspectionPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle_id?: string }>;
}) {
  return (
    <StreamPage>
      <VehicleInspectionPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function VehicleInspectionPageContent({
  searchParams,
}: {
  searchParams: Promise<{ vehicle_id?: string }>;
}) {
  const params = await searchParams;
  const selectedVehicleId = params.vehicle_id ? Number(params.vehicle_id) : undefined;

  const vehicles = await vehicleRepository.getAllVehicles();
  const vehicleExists =
    selectedVehicleId &&
    vehicles.some((v) => v.vehicle_id === selectedVehicleId);

  const inspections = vehicleExists
    ? await inspectionRepository.getInspectionsByVehicle(selectedVehicleId)
    : [];

  return (
    <VehicleInspectionListClient
      vehicles={vehicles}
      inspections={inspections}
      selectedVehicleId={vehicleExists ? selectedVehicleId : undefined}
    />
  );
}