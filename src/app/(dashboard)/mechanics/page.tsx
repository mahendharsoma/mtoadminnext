import { mechanicsRepository } from "@/lib/db/repositories/mechanics.repository";
import { MechanicsClient } from "@/components/mechanics/mechanics-client";

export default async function MechanicsPage() {
  const mechanics = await mechanicsRepository.findAll();
  return <MechanicsClient mechanics={mechanics} />;
}
