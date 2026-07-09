import { inspectionRepository } from "@/lib/db/repositories/inspection.repository";
import { InspectionTitlesClient } from "@/components/misc/misc-clients";

export default async function InspectionTitlesPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle_type_id?: string }>;
}) {
  const params = await searchParams;
  const selectedVehicleTypeId = params.vehicle_type_id
    ? Number(params.vehicle_type_id)
    : undefined;

  const types = await inspectionRepository.getAllVehicleTypes();
  const titles =
    selectedVehicleTypeId &&
    types.some((t) => t.vehicle_type_id === selectedVehicleTypeId)
      ? await inspectionRepository.getInspectionTitles(selectedVehicleTypeId)
      : [];

  return (
    <InspectionTitlesClient
      titles={titles}
      types={types}
      selectedVehicleTypeId={
        selectedVehicleTypeId &&
        types.some((t) => t.vehicle_type_id === selectedVehicleTypeId)
          ? selectedVehicleTypeId
          : undefined
      }
    />
  );
}
