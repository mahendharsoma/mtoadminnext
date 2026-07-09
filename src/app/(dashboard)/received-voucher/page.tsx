import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { ReceivedVoucherClient } from "@/components/inventory/inventory-clients";

export default async function ReceivedVoucherPage() {
  const [vouchers, vendors, vehicles] = await Promise.all([
    inventoryRepository.getAllVouchers(),
    inventoryRepository.getAllVendors(),
    vehicleRepository.getAllVehicles(),
  ]);
  return <ReceivedVoucherClient vouchers={vouchers} vendors={vendors} vehicles={vehicles} />;
}
