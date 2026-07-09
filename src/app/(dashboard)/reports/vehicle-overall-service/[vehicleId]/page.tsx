import { loadReport } from "../page";

export default async function VehicleOverallServiceReportByVehiclePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return loadReport(Number(vehicleId));
}
