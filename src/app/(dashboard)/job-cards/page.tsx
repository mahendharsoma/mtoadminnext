import { jobCardRepository } from "@/lib/db/repositories/job-card.repository";
import { JobCardsClient } from "@/components/job-cards/job-cards-client";

export default async function JobCardsPage() {
  const jobCards = await jobCardRepository.getAllJobCards();
  return <JobCardsClient jobCards={jobCards} />;
}
