import { StreamPage } from "@/components/shared/stream-page";
import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { StockReportClient } from "@/components/reports/stock-report-client";

export default function StockReportPage() {
  return (
    <StreamPage>
      <StockReportPageContent />
    </StreamPage>
  );
}

async function StockReportPageContent() {
  const rows = await reportsRepository.getStockReport();
  return <StockReportClient rows={rows} />;
}