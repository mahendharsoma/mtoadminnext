import { StreamPage } from "@/components/shared/stream-page";
import { reportsRepository } from "@/lib/db/repositories/dashboard.repository";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { IssuedStockReportClient } from "@/components/reports/issued-stock-report-client";

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

export default function IssuedStockReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    variant_id?: string;
    item_name_id?: string;
  }>;
}) {
  return (
    <StreamPage>
      <IssuedStockReportPageContent searchParams={searchParams} />
    </StreamPage>
  );
}

async function IssuedStockReportPageContent({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    variant_id?: string;
    item_name_id?: string;
  }>;
}) {
  const params = await searchParams;
  const from = params.from ?? getDefaultFromDate();
  const to = params.to ?? formatDateInput(new Date());
  const variantId = params.variant_id ? Number(params.variant_id) : undefined;
  const itemNameId = params.item_name_id ? Number(params.item_name_id) : undefined;

  const [rows, variants, itemNames] = await Promise.all([
    reportsRepository.getIssuedStockReport(from, to, variantId, itemNameId),
    vehicleRepository.getAllVariants(),
    inventoryRepository.getAllItemNames(),
  ]);

  return (
    <IssuedStockReportClient
      rows={rows}
      variants={variants}
      itemNames={itemNames}
      fromDate={from}
      toDate={to}
      selectedVariantId={variantId}
      selectedItemNameId={itemNameId}
    />
  );
}