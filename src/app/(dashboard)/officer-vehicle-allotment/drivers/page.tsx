import { StreamPage } from "@/components/shared/stream-page";
import { notFound, redirect } from "next/navigation";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { allotmentRepository } from "@/lib/db/repositories/allotment.repository";
import { DriverAllotmentClient } from "@/components/ps/driver-allotment-client";

export default function DriverAllotmentPage({
  searchParams,
}: {
  searchParams: Promise<{ ps_id?: string; vehicle_id?: string }>;
}) {
  return (
    <StreamPage>
      <DriverAllotmentPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function DriverAllotmentPageContent({
  searchParams,
}: {
  searchParams: Promise<{ ps_id?: string; vehicle_id?: string }>;
}) {
  const params = await searchParams;
  const psId = Number(params.ps_id);
  const vehicleId = Number(params.vehicle_id);

  if (!psId || !vehicleId) {
    redirect("/officer-vehicle-allotment");
  }

  const [vehicle, drivers, officers] = await Promise.all([
    vehicleRepository.getVehicleById(vehicleId),
    allotmentRepository.getVehicleAllotedDrivers(vehicleId),
    allotmentRepository.getActiveOfficers(),
  ]);

  if (!vehicle) notFound();

  return (
    <DriverAllotmentClient
      psId={psId}
      vehicleId={vehicleId}
      vehicle={vehicle}
      drivers={drivers}
      officers={officers}
    />
  );
}