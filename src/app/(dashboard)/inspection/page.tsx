import { StreamPage } from "@/components/shared/stream-page";
import { inspectionRepository } from "@/lib/db/repositories/inspection.repository";
import { InspectionListClient } from "@/components/inspection/inspection-list-client";

function getDefaultMonthValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export default function InspectionPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  return (
    <StreamPage>
      <InspectionPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function InspectionPageContent({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthValue = params.month ?? getDefaultMonthValue();
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const inspections =
    year && month
      ? await inspectionRepository.getInspectionsByMonth(month, year)
      : [];

  return <InspectionListClient inspections={inspections} monthValue={monthValue} />;
}