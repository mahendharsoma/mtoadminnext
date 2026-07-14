import { StreamPage } from "@/components/shared/stream-page";
import { inspectionRepository } from "@/lib/db/repositories/inspection.repository";
import { VehicleTypesClient } from "@/components/misc/misc-clients";

export default function VehicleTypesPage() {
  return (
    <StreamPage>
      <VehicleTypesPageContent />
    </StreamPage>
  );
}

async function VehicleTypesPageContent() {
  const types = await inspectionRepository.getAllVehicleTypes();
  return <VehicleTypesClient types={types} />;
}