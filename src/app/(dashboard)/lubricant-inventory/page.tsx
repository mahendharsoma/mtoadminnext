import { lubricantRepository } from "@/lib/db/repositories/inspection.repository";
import { LubricantInventoryClient } from "@/components/misc/misc-clients";

export default async function LubricantInventoryPage() {
  const inventory = await lubricantRepository.getLubricantInventory();
  return <LubricantInventoryClient inventory={inventory} />;
}
