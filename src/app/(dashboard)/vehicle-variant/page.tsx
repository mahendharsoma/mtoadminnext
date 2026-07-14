import { StreamPage } from "@/components/shared/stream-page";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { VariantClient } from "@/components/vehicles/vehicle-clients";

export default function VehicleVariantPage() {
  return (
    <StreamPage>
      <VehicleVariantPageContent />
    </StreamPage>
  );
}

async function VehicleVariantPageContent() {
  const [items, makeTypes] = await Promise.all([
    vehicleRepository.getAllVariants(),
    vehicleRepository.getAllMakeTypes(),
  ]);
  return <VariantClient items={items} makeTypes={makeTypes} />;
}