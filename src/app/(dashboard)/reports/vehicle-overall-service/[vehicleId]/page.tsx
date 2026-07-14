import { StreamPage } from "@/components/shared/stream-page";
import { loadReport } from "../page";

export default function VehicleOverallServiceReportByVehiclePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  return (
    <StreamPage>
      <VehicleOverallServiceReportByVehiclePageContent params={params} />
    </StreamPage>
  );
}

async function VehicleOverallServiceReportByVehiclePageContent({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return loadReport(Number(vehicleId));
}