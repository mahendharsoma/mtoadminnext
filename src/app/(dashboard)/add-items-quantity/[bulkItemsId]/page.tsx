import { notFound } from "next/navigation";
import { StreamPage } from "@/components/shared/stream-page";
import { SkeletonTable } from "@/components/ui/skeleton";
import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { AddItemsQuantityClient } from "@/components/inventory/add-items-quantity-client";

export default function AddItemsQuantityPage({
  params,
}: {
  params: Promise<{ bulkItemsId: string }>;
}) {
  return (
    <StreamPage fallback={<SkeletonTable rows={6} />}>
      <AddItemsQuantityPageContent params={params} />
    </StreamPage>
  );
}

async function AddItemsQuantityPageContent({
  params,
}: {
  params: Promise<{ bulkItemsId: string }>;
}) {
  const { bulkItemsId: rawId } = await params;
  const bulkItemsId = Number(rawId);
  if (!bulkItemsId) notFound();

  const bulk = await inventoryRepository.getBulkItemDetails(bulkItemsId);
  if (!bulk) notFound();

  const unitItems = await inventoryRepository.getItemsByBulkItemId(bulkItemsId);

  return (
    <AddItemsQuantityClient
      bulk={bulk}
      unitItems={unitItems as Parameters<typeof AddItemsQuantityClient>[0]["unitItems"]}
    />
  );
}
