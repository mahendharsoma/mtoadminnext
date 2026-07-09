import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { VariantClient } from "@/components/vehicles/vehicle-clients";

export default async function VehicleVariantPage() {
  const [items, makeTypes] = await Promise.all([
    vehicleRepository.getAllVariants(),
    vehicleRepository.getAllMakeTypes(),
  ]);
  return <VariantClient items={items} makeTypes={makeTypes} />;
}
