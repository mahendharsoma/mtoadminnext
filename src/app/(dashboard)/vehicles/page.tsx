import { StreamPage } from "@/components/shared/stream-page";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { psRepository } from "@/lib/db/repositories/ps.repository";
import { VehiclesClient } from "@/components/vehicles/vehicle-clients";

export default function VehiclesPage() {
  return (
    <StreamPage>
      <VehiclesPageContent />
    </StreamPage>
  );
}

async function VehiclesPageContent() {
  const [vehicles, makeTypes, policeStations] = await Promise.all([
    vehicleRepository.getAllVehicles(),
    vehicleRepository.getAllMakeTypes(),
    psRepository.getAllPs(),
  ]);
  return <VehiclesClient vehicles={vehicles} makeTypes={makeTypes} policeStations={policeStations} />;
}