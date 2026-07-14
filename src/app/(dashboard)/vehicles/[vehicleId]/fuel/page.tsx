import { StreamPage } from "@/components/shared/stream-page";
import { notFound } from "next/navigation";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { VehicleFuelClient } from "@/components/vehicles/vehicle-fuel-client";

export default function VehicleFuelPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  return (
    <StreamPage>
      <VehicleFuelPageContent params={params} />
    </StreamPage>
  );
}

async function VehicleFuelPageContent({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const id = Number(vehicleId);
  if (!id) notFound();

  const [vehicle, fuelEntries, vehicleFuelLast] = await Promise.all([
    vehicleRepository.getVehicleById(id),
    vehicleRepository.getVehicleFuelByVehicleId(id),
    vehicleRepository.getLastVehicleFuelByVehicleId(id),
  ]);

  if (!vehicle) notFound();

  return (
    <VehicleFuelClient
      vehicle={vehicle}
      fuelEntries={fuelEntries}
      vehicleFuelLast={vehicleFuelLast}
    />
  );
}