import { notFound } from "next/navigation";
import { lubricantRepository } from "@/lib/db/repositories/inspection.repository";
import { LubricantVoucherItemsClient } from "@/components/misc/lubricant-voucher-items-client";

export default async function LubricantVoucherItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voucherId = Number(id);
  if (!voucherId) notFound();

  const [voucher, items, lubricants, containers] = await Promise.all([
    lubricantRepository.getLubricantVoucherById(voucherId),
    lubricantRepository.getParentVoucherItemsWithTotals(voucherId),
    lubricantRepository.getAllLubricants(),
    lubricantRepository.getContainersByVoucherId(voucherId),
  ]);

  if (!voucher) notFound();

  return (
    <LubricantVoucherItemsClient
      voucher={voucher}
      items={items}
      lubricants={lubricants}
      containers={containers}
    />
  );
}
