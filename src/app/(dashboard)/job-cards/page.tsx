import { StreamPage } from "@/components/shared/stream-page";
import { jobCardRepository } from "@/lib/db/repositories/job-card.repository";
import { JobCardsClient } from "@/components/job-cards/job-cards-client";

export default function JobCardsPage() {
  return (
    <StreamPage>
      <JobCardsPageContent />
    </StreamPage>
  );
}

async function JobCardsPageContent() {
  const jobCards = await jobCardRepository.getAllJobCards();
  return <JobCardsClient jobCards={jobCards} />;
}