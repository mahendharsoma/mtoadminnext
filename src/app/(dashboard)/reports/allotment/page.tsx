import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { AllotmentReportClient } from "@/components/reports/allotment-report-client";

export default async function AllotmentReportPage() {
  const data = await reportsRepository.getOfficerVehicleAllotmentReport();
  return <AllotmentReportClient data={data} />;
}
