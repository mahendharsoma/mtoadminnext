import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { MakeTypeClient } from "@/components/vehicles/vehicle-clients";

export default async function VehicleMakeTypePage() {
  const items = await vehicleRepository.getAllMakeTypes();
  return <MakeTypeClient items={items} />;
}
