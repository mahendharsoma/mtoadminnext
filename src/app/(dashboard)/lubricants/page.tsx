import { lubricantRepository } from "@/lib/db/repositories/inspection.repository";
import { LubricantsClient } from "@/components/misc/misc-clients";

export default async function LubricantsPage() {
  const [lubricants, types, grades] = await Promise.all([
    lubricantRepository.getAllLubricants(),
    lubricantRepository.getAllTypes(),
    lubricantRepository.getAllGrades(),
  ]);
  return <LubricantsClient lubricants={lubricants} types={types} grades={grades} />;
}
