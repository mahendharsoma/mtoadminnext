import { StreamPage } from "@/components/shared/stream-page";
import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { VendorsClient } from "@/components/inventory/inventory-clients";

export default function VendorsPage() {
  return (
    <StreamPage>
      <VendorsPageContent />
    </StreamPage>
  );
}

async function VendorsPageContent() {
  const vendors = await inventoryRepository.getAllVendors();
  return <VendorsClient vendors={vendors} />;
}