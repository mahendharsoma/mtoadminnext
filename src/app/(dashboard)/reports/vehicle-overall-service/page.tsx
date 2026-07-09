import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { VehicleOverallServiceReportClient } from "@/components/reports/vehicle-overall-service-report-client";

async function loadReport(selectedVehicleId?: number) {
  const vehicles = await vehicleRepository.getAllVehicles();
  const rows =
    selectedVehicleId && !Number.isNaN(selectedVehicleId)
      ? await reportsRepository.getJobCardsByVehicleId(selectedVehicleId)
      : [];

  return (
    <VehicleOverallServiceReportClient
      vehicles={vehicles}
      rows={rows}
      selectedVehicleId={
        selectedVehicleId && !Number.isNaN(selectedVehicleId)
          ? selectedVehicleId
          : undefined
      }
    />
  );
}

export default async function VehicleOverallServiceReportPage() {
  return loadReport();
}

export { loadReport };
