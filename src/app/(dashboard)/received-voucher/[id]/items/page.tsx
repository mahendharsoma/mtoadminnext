import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { VoucherItemsClient } from "@/components/inventory/voucher-items-client";
import { notFound } from "next/navigation";

export default async function VoucherItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voucherId = Number(id);
  if (!voucherId) notFound();

  const [bulkItems, itemNames, makeTypes] = await Promise.all([
    inventoryRepository.getBulkItemsByVoucher(voucherId),
    inventoryRepository.getAllItemNames(),
    vehicleRepository.getAllMakeTypes(),
  ]);

  return (
    <VoucherItemsClient
      voucherId={voucherId}
      bulkItems={bulkItems}
      itemNames={itemNames}
      makeTypes={makeTypes}
    />
  );
}
