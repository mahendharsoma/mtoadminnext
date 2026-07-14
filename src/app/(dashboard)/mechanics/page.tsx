import { StreamPage } from "@/components/shared/stream-page";
import { mechanicsRepository } from "@/lib/db/repositories/mechanics.repository";
import { MechanicsClient } from "@/components/mechanics/mechanics-client";

export default function MechanicsPage() {
  return (
    <StreamPage>
      <MechanicsPageContent />
    </StreamPage>
  );
}

async function MechanicsPageContent() {
  const mechanics = await mechanicsRepository.findAll();
  return <MechanicsClient mechanics={mechanics} />;
}