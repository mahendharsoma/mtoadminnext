import { StreamPage } from "@/components/shared/stream-page";
import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { DailyJobCardReportClient } from "@/components/reports/daily-job-card-report-client";
import type { DailyJobCardReportRow } from "@/lib/types";

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultFromDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return formatDateInput(date);
}

export default function DailyJobCardReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; service_type_id?: string }>;
}) {
  return (
    <StreamPage>
      <DailyJobCardReportPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function DailyJobCardReportPageContent({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; service_type_id?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ?? getDefaultFromDate();
  const to = params.to ?? formatDateInput(new Date());
  const serviceTypeId = params.service_type_id ? Number(params.service_type_id) : undefined;

  const rows = (await reportsRepository.getDailyJobCardReport(
    from,
    to,
    serviceTypeId
  )) as DailyJobCardReportRow[];

  return (
    <DailyJobCardReportClient
      rows={rows}
      fromDate={from}
      toDate={to}
      serviceTypeId={serviceTypeId}
    />
  );
}