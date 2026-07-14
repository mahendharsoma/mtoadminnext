import { StreamPage } from "@/components/shared/stream-page";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { inspectionRepository } from "@/lib/db/repositories/inspection.repository";
import { VehicleInspectionClient } from "@/components/inspection/vehicle-inspection-client";
import { notFound } from "next/navigation";

export default function VehicleInspectionPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  return (
    <StreamPage>
      <VehicleInspectionPageContent params={params} />
    </StreamPage>
  );
}

async function VehicleInspectionPageContent({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const id = Number(vehicleId);
  const vehicle = await vehicleRepository.getVehicleById(id);
  if (!vehicle) notFound();

  const inspections = await inspectionRepository.getInspectionsByVehicle(id);
  return <VehicleInspectionClient vehicle={vehicle} inspections={inspections} />;
}