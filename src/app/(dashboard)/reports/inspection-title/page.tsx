import { StreamPage } from "@/components/shared/stream-page";
import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { InspectionTitleReportClient } from "@/components/reports/inspection-title-report-client";
import type { InspectionTitleReportRow } from "@/lib/types";

function getDefaultMonthValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export default function InspectionTitleReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  return (
    <StreamPage>
      <InspectionTitleReportPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function InspectionTitleReportPageContent({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthValue = params.month ?? getDefaultMonthValue();
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const rows =
    year && month
      ? ((await reportsRepository.getInspectionTitleReport(
          month,
          year
        )) as InspectionTitleReportRow[])
      : [];

  return <InspectionTitleReportClient rows={rows} monthValue={monthValue} />;
}