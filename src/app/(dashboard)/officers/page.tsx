import { StreamPage } from "@/components/shared/stream-page";
import { psRepository } from "@/lib/db/repositories/ps.repository";
import { OfficersClient } from "@/components/ps/ps-clients";

export default function OfficersPage() {
  return (
    <StreamPage>
      <OfficersPageContent />
    </StreamPage>
  );
}

async function OfficersPageContent() {
  const officers = await psRepository.getAllOfficers();
  return <OfficersClient officers={officers} />;
}