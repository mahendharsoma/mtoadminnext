import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { VehicleFuelReportClient } from "@/components/reports/vehicle-fuel-report-client";
import { PageHeader } from "@/components/shared/page-header";
import type { VehicleFuelReportRow } from "@/lib/types";

function getDefaultMonthValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export default async function VehicleFuelReportPage({
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
      ? ((await reportsRepository.getVehicleFuelReport(month, year)) as VehicleFuelReportRow[])
      : [];

  return (
    <div>
      <PageHeader title="Vehicle Fuel Report" description="Month-wise vehicle fuel filling records" />
      <VehicleFuelReportClient rows={rows} monthValue={monthValue} />
    </div>
  );
}
