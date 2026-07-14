import { StreamPage } from "@/components/shared/stream-page";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { MakeTypeClient } from "@/components/vehicles/vehicle-clients";

export default function VehicleMakeTypePage() {
  return (
    <StreamPage>
      <VehicleMakeTypePageContent />
    </StreamPage>
  );
}

async function VehicleMakeTypePageContent() {
  const items = await vehicleRepository.getAllMakeTypes();
  return <MakeTypeClient items={items} />;
}