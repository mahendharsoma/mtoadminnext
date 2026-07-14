import { StreamPage } from "@/components/shared/stream-page";
import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { RvDcReportClient } from "@/components/reports/rv-dc-report-client";
import type { RvDcReportRow } from "@/lib/types";

export default function RvDcReportPage() {
  return (
    <StreamPage>
      <RvDcReportPageContent />
    </StreamPage>
  );
}

async function RvDcReportPageContent() {
  const data = (await reportsRepository.getRvDcReport()) as RvDcReportRow[];
  return <RvDcReportClient data={data} />;
}