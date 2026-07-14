import { StreamPage } from "@/components/shared/stream-page";
import { lubricantRepository } from "@/lib/db/repositories/inspection.repository";
import { LubricantVoucherClient } from "@/components/misc/lubricant-voucher-client";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

export default function LubricantReceiveVoucherPage({
  searchParams,
}: {
  searchParams: Promise<{ from_date?: string; to_date?: string }>;
}) {
  return (
    <StreamPage>
      <LubricantReceiveVoucherPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function LubricantReceiveVoucherPageContent({
  searchParams,
}: {
  searchParams: Promise<{ from_date?: string; to_date?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const defaultToDate = formatDate(now);
  const from = new Date(now);
  from.setDate(now.getDate() - 30);
  const defaultFromDate = formatDate(from);

  const fromDate = params.from_date?.trim() || defaultFromDate;
  const toDate = params.to_date?.trim() || defaultToDate;

  const vouchers = await lubricantRepository.getLubricantVouchersByDateRange(fromDate, toDate);
  return <LubricantVoucherClient vouchers={vouchers} fromDate={fromDate} toDate={toDate} />;
}