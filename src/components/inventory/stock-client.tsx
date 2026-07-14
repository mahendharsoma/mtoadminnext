"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVariantsByMakeTypeAction } from "@/actions/vehicle.actions";
import type { ItemName, VehicleMakeType, VehicleVariant } from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";

interface StockRow extends RowDataPacket {
  inventory_id: number;
  is_common: number;
  make_type_name: string | null;
  variant_name: string | null;
  item_name: string;
  total_sanctioned_quantity: number;
  pending_quantity: number;
  master_total_quantity: number;
  available_quantity: number;
}

function makeTypeLabel(row: StockRow): string {
  if (Number(row.is_common) === 1) return "Common";
  return row.make_type_name || "NA";
}

function variantLabel(row: StockRow): string {
  if (Number(row.is_common) === 1) return "All Vehicles";
  return row.variant_name || "NA";
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
  const [makeType, setMakeType] = useState<string>(
    selectedMakeTypeId ? String(selectedMakeTypeId) : ""
  );
  const [variant, setVariant] = useState<string>(
    selectedVariantId ? String(selectedVariantId) : ""
  );
  const [itemName, setItemName] = useState<string>(
    selectedItemNameId ? String(selectedItemNameId) : ""
  );

  useEffect(() => {
    async function load() {
      if (!makeType) {
        setVariants([]);
        if (!selectedVariantId) setVariant("");
        return;
      }
      const result = await getVariantsByMakeTypeAction(Number(makeType));
      setVariants((result.data as VehicleVariant[]) ?? []);
    }
    load();
  }, [makeType, selectedVariantId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (makeType) q.set("make_type_id", makeType);
    if (variant) q.set("variant_id", variant);
    if (itemName) q.set("item_name_id", itemName);
    router.push(`/total-stock${q.toString() ? `?${q.toString()}` : ""}`);
  }

  const columns: ColumnDef<StockRow>[] = [
    {
      id: "s_no",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      id: "make_type",
      header: "Make Type",
      cell: ({ row }) => {
        const label = makeTypeLabel(row.original);
        if (Number(row.original.is_common) === 1) {
          return <Badge variant="secondary">{label}</Badge>;
        }
        return label;
      },
    },
    {
      id: "variant",
      header: "Variant",
      cell: ({ row }) => {
        const label = variantLabel(row.original);
        if (Number(row.original.is_common) === 1) {
          return <Badge variant="secondary">{label}</Badge>;
        }
        return label;
      },
    },
    { accessorKey: "item_name", header: "Item Name" },
    {
      accessorKey: "total_sanctioned_quantity",
      header: "Total Sanctioned Quantity",
      cell: ({ row }) => Number(row.original.total_sanctioned_quantity ?? 0),
    },
    {
      accessorKey: "pending_quantity",
      header: "Total Pending Quantity",
      cell: ({ row }) => Number(row.original.pending_quantity ?? 0),
    },
    {
      accessorKey: "master_total_quantity",
      header: "Total Received Quantity",
      cell: ({ row }) => Number(row.original.master_total_quantity ?? 0),
    },
    {
      accessorKey: "available_quantity",
      header: "Available Quantity",
      cell: ({ row }) => Number(row.original.available_quantity ?? 0),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Inventory" description="Check part availability and stock levels" />

      <Card>
        <CardHeader>
          <CardTitle>Filter Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="make_type_id">Select Make Type</Label>
                <select
                  id="make_type_id"
                  value={makeType}
                  onChange={(e) => {
                    setMakeType(e.target.value);
                    setVariant("");
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Make Type</option>
                  {makeTypes.map((m) => (
                    <option key={m.make_type_id} value={m.make_type_id}>
                      {m.make_type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant_id">Select Variant</Label>
                <select
                  id="variant_id"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!makeType}
                >
                  <option value="">Select Variant</option>
                  {variants.map((v) => (
                    <option key={v.variant_id} value={v.variant_id}>
                      {v.variant_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_name_id">Select Item</Label>
                <select
                  id="item_name_id"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Item</option>
                  {itemNames.map((i) => (
                    <option key={i.item_name_id} value={i.item_name_id}>
                      {i.item_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={stock}
            searchKey="item_name"
            searchPlaceholder="Search items..."
            exportTitle="Stock Inventory"
            exportFileName="total-stock"
          />
        </CardContent>
      </Card>
    </div>
  );
}
