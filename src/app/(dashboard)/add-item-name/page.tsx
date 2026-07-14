import { StreamPage } from "@/components/shared/stream-page";
import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { ItemNamesClient } from "@/components/inventory/inventory-clients";

export default function AddItemNamePage() {
  return (
    <StreamPage>
      <AddItemNamePageContent />
    </StreamPage>
  );
}

async function AddItemNamePageContent() {
  const items = await inventoryRepository.getAllItemNames();
  return <ItemNamesClient items={items} />;
}