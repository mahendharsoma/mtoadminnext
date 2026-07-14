import { StreamPage } from "@/components/shared/stream-page";
import { psRepository } from "@/lib/db/repositories/ps.repository";
import { PsClient } from "@/components/ps/ps-clients";

export default function PsPage() {
  return (
    <StreamPage>
      <PsPageContent />
    </StreamPage>
  );
}

async function PsPageContent() {
  const stations = await psRepository.getAllPs();
  return <PsClient stations={stations} />;
}