import { StreamPage } from "@/components/shared/stream-page";
import { lubricantRepository } from "@/lib/db/repositories/inspection.repository";
import { LubricantsClient } from "@/components/misc/misc-clients";

export default function LubricantsPage() {
  return (
    <StreamPage>
      <LubricantsPageContent />
    </StreamPage>
  );
}

async function LubricantsPageContent() {
  const [lubricants, types, grades] = await Promise.all([
    lubricantRepository.getAllLubricants(),
    lubricantRepository.getAllTypes(),
    lubricantRepository.getAllGrades(),
  ]);
  return <LubricantsClient lubricants={lubricants} types={types} grades={grades} />;
}