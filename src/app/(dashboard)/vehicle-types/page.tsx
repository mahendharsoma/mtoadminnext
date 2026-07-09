import { inspectionRepository } from "@/lib/db/repositories/inspection.repository";
import { VehicleTypesClient } from "@/components/misc/misc-clients";

export default async function VehicleTypesPage() {
  const types = await inspectionRepository.getAllVehicleTypes();
  return <VehicleTypesClient types={types} />;
}
