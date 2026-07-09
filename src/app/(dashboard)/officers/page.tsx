import { psRepository } from "@/lib/db/repositories/ps.repository";
import { OfficersClient } from "@/components/ps/ps-clients";

export default async function OfficersPage() {
  const officers = await psRepository.getAllOfficers();
  return <OfficersClient officers={officers} />;
}
