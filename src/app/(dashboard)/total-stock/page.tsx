import { inventoryRepository } from "@/lib/db/repositories/inventory.repository";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { StockClient } from "@/components/inventory/stock-client";
import { getSession } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { unlockTotalStockQrAction } from "@/actions/inventory.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function TotalStockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const isQr = params.qr === "1";
  const session = await getSession();
  const qrAccess = (await cookies()).get("mto_qr_stock_access")?.value === "1";

  if (isQr && !session && !qrAccess) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6">
        <h1 className="text-xl font-semibold">Total Stock Access</h1>
        <form action={unlockTotalStockQrAction} className="space-y-3">
          <div className="space-y-1">
            <Label>Inventory QR Password</Label>
            <Input name="inventory_qr_password" type="password" required />
          </div>
          <Button type="submit">Unlock</Button>
        </form>
      </div>
    );
  }

  const makeTypeId = params.make_type_id ? Number(params.make_type_id) : null;
  const variantId = params.variant_id ? Number(params.variant_id) : null;
  const itemNameId = params.item_name_id ? Number(params.item_name_id) : null;

  const [stock, makeTypes, itemNames] = await Promise.all([
    inventoryRepository.getTotalStock(makeTypeId, variantId, itemNameId),
    vehicleRepository.getAllMakeTypes(),
    inventoryRepository.getAllItemNames(),
  ]);

  return (
    <StockClient
      stock={stock}
      makeTypes={makeTypes}
      itemNames={itemNames}
      selectedMakeTypeId={makeTypeId}
      selectedVariantId={variantId}
      selectedItemNameId={itemNameId}
    />
  );
}
