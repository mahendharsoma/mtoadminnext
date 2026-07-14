import { StreamPage } from "@/components/shared/stream-page";
import { jobCardRepository } from "@/lib/db/repositories/job-card.repository";
import { PrintGatePassButton } from "@/components/job-cards/print-gate-pass-button";
import { notFound } from "next/navigation";

export default function JobCardGatePassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <StreamPage>
      <JobCardGatePassPageContent params={params} />
    </StreamPage>
  );
}

async function JobCardGatePassPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobCard = await jobCardRepository.getById(Number(id));
  if (!jobCard) notFound();

  const gatePass = jobCard.gate_pass || `${jobCard.it_no}/OUT`;

  return (
    <div className="max-w-3xl mx-auto p-10 text-foreground print:p-6">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold">MTO, Malkajgiri</h2>
        <h3 className="text-lg">Gate Pass</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-4"><span className="font-semibold">Gate Pass No:</span><span>{gatePass}</span></div>
        <div className="flex justify-between gap-4"><span className="font-semibold">Job Card No:</span><span>{jobCard.it_no}</span></div>
        <div className="flex justify-between gap-4"><span className="font-semibold">Vehicle No:</span><span>{jobCard.registration_no}</span></div>
        <div className="flex justify-between gap-4"><span className="font-semibold">Officer:</span><span>{jobCard.officer_name}</span></div>
        <div className="flex justify-between gap-4"><span className="font-semibold">Driver:</span><span>{jobCard.driver_name}</span></div>
        <div className="flex justify-between gap-4"><span className="font-semibold">Make / Variant:</span><span>{jobCard.make_type} / {jobCard.variant_name}</span></div>
        <div className="flex justify-between gap-4"><span className="font-semibold">Outside Workshop:</span><span>{jobCard.outside_work_shop ?? "—"}</span></div>
        <div className="flex justify-between gap-4"><span className="font-semibold">Date In:</span><span>{jobCard.date_time_in}</span></div>
      </div>
      <p className="mt-10">Authorized Signature: ______________________</p>
      <PrintGatePassButton />
    </div>
  );
}