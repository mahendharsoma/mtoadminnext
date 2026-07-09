import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { VendorsClient } from "@/components/inventory/inventory-clients";

export default async function VendorsPage() {
  const vendors = await inventoryRepository.getAllVendors();
  return <VendorsClient vendors={vendors} />;
}
