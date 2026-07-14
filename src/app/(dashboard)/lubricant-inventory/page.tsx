import { StreamPage } from "@/components/shared/stream-page";
import { lubricantRepository } from "@/lib/db/repositories/inspection.repository";
import { LubricantInventoryClient } from "@/components/misc/misc-clients";

export default function LubricantInventoryPage() {
  return (
    <StreamPage>
      <LubricantInventoryPageContent />
    </StreamPage>
  );
}

async function LubricantInventoryPageContent() {
  const inventory = await lubricantRepository.getLubricantInventory();
  return <LubricantInventoryClient inventory={inventory} />;
}