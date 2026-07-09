import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { StockReportClient } from "@/components/reports/stock-report-client";

export default async function StockReportPage() {
  const rows = await reportsRepository.getStockReport();
  return <StockReportClient rows={rows} />;
}
