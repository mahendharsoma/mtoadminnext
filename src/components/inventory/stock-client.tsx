"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getVariantsByMakeTypeAction } from "@/actions/vehicle.actions";
import type { ItemName, VehicleMakeType, VehicleVariant } from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";

interface StockRow extends RowDataPacket {
  make_type_name: string | null;
  variant_name: string | null;
  item_name: string;
  total_sanctioned_quantity: number;
  total_pending_quantity: number;
  total_received_quantity: number;
  available_quantity: number;
}

export function StockClient({
  stock,
  makeTypes,
  itemNames,
  selectedMakeTypeId,
  selectedVariantId,
  selectedItemNameId,
}: {
  stock: StockRow[];
  makeTypes: VehicleMakeType[];
  itemNames: ItemName[];
  selectedMakeTypeId?: number | null;
  selectedVariantId?: number | null;
  selectedItemNameId?: number | null;
}) {
  const router = useRouter();
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [makeType, setMakeType] = useState<string>(selectedMakeTypeId ? String(selectedMakeTypeId) : "");
  const [variant, setVariant] = useState<string>(selectedVariantId ? String(selectedVariantId) : "");
  const [itemName, setItemName] = useState<string>(selectedItemNameId ? String(selectedItemNameId) : "");

  useEffect(() => {
    async function load() {
      if (!makeType) {
        setVariants([]);
        setVariant("");
        return;
      }
      const result = await getVariantsByMakeTypeAction(Number(makeType));
      setVariants((result.data as VehicleVariant[]) ?? []);
    }
    load();
  }, [makeType]);

  function applyFilters() {
    const q = new URLSearchParams();
    if (makeType) q.set("make_type_id", makeType);
    if (variant) q.set("variant_id", variant);
    if (itemName) q.set("item_name_id", itemName);
    router.push(`/total-stock${q.toString() ? `?${q.toString()}` : ""}`);
  }

  function clearFilters() {
    setMakeType("");
    setVariant("");
    setItemName("");
    router.push("/total-stock");
  }

  const columns: ColumnDef<StockRow>[] = [
    { id: "s_no", header: "S.No", cell: ({ row }) => row.index + 1 },
    { accessorKey: "make_type_name", header: "Make Type", cell: ({ row }) => row.original.make_type_name ?? "Common" },
    { accessorKey: "variant_name", header: "Variant", cell: ({ row }) => row.original.variant_name ?? "—" },
    { accessorKey: "item_name", header: "Item Name" },
    { accessorKey: "total_sanctioned_quantity", header: "Total Sanctioned Quantity" },
    { accessorKey: "total_pending_quantity", header: "Total Pending Quantity" },
    { accessorKey: "total_received_quantity", header: "Total Received Quantity" },
    { accessorKey: "available_quantity", header: "Available Quantity" },
  ];

  return (
    <div>
      <PageHeader title="Total Stock" description="Current inventory stock levels" />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <Label>Make Type</Label>
          <select
            value={makeType}
            onChange={(e) => {
              setMakeType(e.target.value);
              setVariant("");
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {makeTypes.map((m) => (
              <option key={m.make_type_id} value={m.make_type_id}>
                {m.make_type_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Variant</Label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!makeType}
          >
            <option value="">All</option>
            {variants.map((v) => (
              <option key={v.variant_id} value={v.variant_id}>
                {v.variant_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Item Name</Label>
          <select
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {itemNames.map((i) => (
              <option key={i.item_name_id} value={i.item_name_id}>
                {i.item_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={applyFilters}>Apply</Button>
          <Button variant="outline" onClick={clearFilters}>Clear</Button>
        </div>
      </div>
      <DataTable columns={columns} data={stock} searchKey="item_name" searchPlaceholder="Search items..." />
    </div>
  );
}
