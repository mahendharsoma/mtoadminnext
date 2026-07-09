import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { ItemNamesClient } from "@/components/inventory/inventory-clients";

export default async function AddItemNamePage() {
  const items = await inventoryRepository.getAllItemNames();
  return <ItemNamesClient items={items} />;
}
