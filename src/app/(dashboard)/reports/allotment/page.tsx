import { StreamPage } from "@/components/shared/stream-page";
import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { AllotmentReportClient } from "@/components/reports/allotment-report-client";

export default function AllotmentReportPage() {
  return (
    <StreamPage>
      <AllotmentReportPageContent />
    </StreamPage>
  );
}

async function AllotmentReportPageContent() {
  const data = await reportsRepository.getOfficerVehicleAllotmentReport();
  return <AllotmentReportClient data={data} />;
}