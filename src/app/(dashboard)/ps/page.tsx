import { psRepository } from "@/lib/db/repositories/ps.repository";
import { PsClient } from "@/components/ps/ps-clients";

export default async function PsPage() {
  const stations = await psRepository.getAllPs();
  return <PsClient stations={stations} />;
}
