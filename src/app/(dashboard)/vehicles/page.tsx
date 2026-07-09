import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { psRepository } from "@/lib/db/repositories/ps.repository";
import { VehiclesClient } from "@/components/vehicles/vehicle-clients";

export default async function VehiclesPage() {
  const [vehicles, makeTypes, policeStations] = await Promise.all([
    vehicleRepository.getAllVehicles(),
    vehicleRepository.getAllMakeTypes(),
    psRepository.getAllPs(),
  ]);
  return <VehiclesClient vehicles={vehicles} makeTypes={makeTypes} policeStations={policeStations} />;
}
