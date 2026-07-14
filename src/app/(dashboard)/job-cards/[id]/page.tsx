import { StreamPage } from "@/components/shared/stream-page";
import { jobCardRepository } from "@/lib/db/repositories/job-card.repository";
import { lubricantRepository } from "@/lib/db/repositories/inspection.repository";
import { JobCardDetailClient } from "@/components/job-cards/job-card-detail-client";
import { notFound } from "next/navigation";

export default function JobCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <StreamPage>
      <JobCardDetailPageContent params={params} />
    </StreamPage>
  );
}

async function JobCardDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobCardId = Number(id);
  const jobCard = await jobCardRepository.getById(jobCardId);
  if (!jobCard) notFound();

  const [
    spareParts,
    assignedItems,
    mechanics,
    allMechanics,
    inspection,
    oils,
    lubricants,
  ] = await Promise.all([
    jobCardRepository.getSparePartsForJobCard(jobCardId),
    jobCardRepository.getAssignedItems(jobCardId),
    jobCardRepository.getJobCardMechanics(jobCardId),
    jobCardRepository.getActiveMechanics(),
    jobCardRepository.getInspectionByJobCardId(jobCardId),
    jobCardRepository.getJobCardOils(jobCardId),
    lubricantRepository.getAllLubricants(),
  ]);

  const assignedMechanicIds = jobCard.mechanic_ids
    ? jobCard.mechanic_ids.split(",").map((v) => Number(v.trim())).filter(Boolean)
    : mechanics.map((m) => Number(m.mechanic_id));

  return (
    <JobCardDetailClient
      jobCard={jobCard}
      spareParts={spareParts}
      assignedItems={assignedItems}
      allMechanics={allMechanics}
      assignedMechanicIds={assignedMechanicIds}
      inspection={inspection}
      oils={oils}
      lubricants={lubricants}
    />
  );
}