import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { CondemnationReportClient } from "@/components/reports/condemnation-report-client";
import type { CondemnationReportRow } from "@/lib/types";

export default async function CondemnationReportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const selectedStatus = params.status?.trim() || "Received";

  const rows = (await reportsRepository.getCondemnationReport(
    selectedStatus
  )) as CondemnationReportRow[];

  return <CondemnationReportClient rows={rows} selectedStatus={selectedStatus} />;
}
