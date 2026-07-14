import { StreamPage } from "@/components/shared/stream-page";
import { inspectionRepository } from "@/lib/db/repositories/inspection.repository";
import { InspectionReportClient } from "@/components/reports/inspection-report-client";

function getDefaultMonthValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export default function InspectionReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  return (
    <StreamPage>
      <InspectionReportPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function InspectionReportPageContent({
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
      ? await inspectionRepository.getInspectionReportByMonthYear(month, year)
      : [];

  return <InspectionReportClient rows={rows} monthValue={monthValue} />;
}
