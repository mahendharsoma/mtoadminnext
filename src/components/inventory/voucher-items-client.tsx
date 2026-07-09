"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBulkItemsBatchAction, addBulkItemQuantityAction } from "@/actions/inventory.actions";
import { getVariantsByMakeTypeAction } from "@/actions/vehicle.actions";
import type { ItemName, VehicleMakeType, VehicleVariant } from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";

interface BulkItem extends RowDataPacket {
  bulk_items_id: number;
  make_type_name?: string;
  variant_name?: string;
  item_name?: string;
  total_quantity: string;
  item_price: string;
  received_from: string;
  received_quantity?: number;
}

export function VoucherItemsClient({
  voucherId,
  bulkItems,
  itemNames,
  makeTypes,
}: {
  voucherId: number;
  bulkItems: BulkItem[];
  itemNames: ItemName[];
  makeTypes: VehicleMakeType[];
}) {
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [isCommon, setIsCommon] = useState(false);
  const [rows, setRows] = useState<Array<{ row_id: string; item_name_id: string; total_quantity: string; item_price: string; received_from: string }>>([
    // Stable row_id avoids index-based keys and keeps row identity predictable.
    { row_id: crypto.randomUUID(), item_name_id: "", total_quantity: "", item_price: "0", received_from: "N/A" },
  ]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      { row_id: crypto.randomUUID(), item_name_id: "", total_quantity: "", item_price: "0", received_from: "N/A" },
    ]);
  }

  function updateRow(idx: number, key: "item_name_id" | "total_quantity" | "item_price" | "received_from", value: string) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  }

  async function onMakeChange(makeTypeId: string) {
    if (!makeTypeId) { setVariants([]); return; }
    const result = await getVariantsByMakeTypeAction(Number(makeTypeId));
    if (result.data) setVariants(result.data as VehicleVariant[]);
  }

  const columns: ColumnDef<BulkItem>[] = [
    { accessorKey: "make_type_name", header: "Make", cell: ({ row }) => row.original.make_type_name ?? "Common" },
    { accessorKey: "variant_name", header: "Variant", cell: ({ row }) => row.original.variant_name ?? "—" },
    { accessorKey: "item_name", header: "Item" },
    { accessorKey: "total_quantity", header: "Qty" },
    {
      id: "received_quantity",
      header: "Received Qty",
      cell: ({ row }) => row.original.received_quantity ?? 0,
    },
    { accessorKey: "item_price", header: "Price" },
    { accessorKey: "received_from", header: "Received From" },
    {
      id: "add_quantity",
      header: "Add Quantity",
      cell: ({ row }) => {
        const pending = Number(row.original.total_quantity || 0) - Number(row.original.received_quantity || 0);
        return (
          <CrudDialog title="Add Item Quantity" onSubmit={addBulkItemQuantityAction} triggerLabel="Add Quantity">
            <input type="hidden" name="bulk_items_id" value={row.original.bulk_items_id} />
            <div className="space-y-2"><Label>Total Quantity</Label><Input value={row.original.total_quantity} readOnly /></div>
            <div className="space-y-2"><Label>Received Quantity</Label><Input value={String(row.original.received_quantity ?? 0)} readOnly /></div>
            <div className="space-y-2"><Label>Pending Quantity</Label><Input value={String(pending)} readOnly /></div>
            <div className="space-y-2"><Label>Add Item Quantity</Label><Input name="add_item_quantity" type="number" min={1} max={pending} required /></div>
            <div className="space-y-2"><Label>Item Price</Label><Input name="item_price" type="number" step="0.01" defaultValue={row.original.item_price ?? "0"} required /></div>
            <div className="space-y-2"><Label>Received Date</Label><Input name="received_date" type="date" required /></div>
          </CrudDialog>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link href="/received-voucher">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back to Vouchers</Button>
        </Link>
      </div>
      <PageHeader title={`Voucher #${voucherId} — Bulk Items`} description="Add items to received voucher">
        <CrudDialog title="Add Bulk Item(s)" onSubmit={createBulkItemsBatchAction}>
          <input type="hidden" name="received_voucher_id" value={voucherId} />
          <div className="rounded border p-3">
            <p className="mb-2 font-semibold">Section 1</p>
            <div className="flex items-center gap-2">
            <input type="checkbox" id="is_common" checked={isCommon} onChange={(e) => setIsCommon(e.target.checked)} />
            <Label htmlFor="is_common">Is Common Part?</Label>
            <input type="hidden" name="is_common" value={isCommon ? "1" : "0"} />
            </div>
            {!isCommon && (
            <>
              <div className="space-y-2">
                <Label>Select Make Type</Label>
                <select name="make_type_id" onChange={(e) => onMakeChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select Make Type</option>
                  {makeTypes.map((m) => <option key={m.make_type_id} value={m.make_type_id}>{m.make_type_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Select Variant</Label>
                <select name="variant_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select Variant</option>
                  {variants.map((v) => <option key={v.variant_id} value={v.variant_id}>{v.variant_name}</option>)}
                </select>
              </div>
            </>
            )}
          </div>
          {rows.map((row, idx) => (
            <div key={row.row_id} className="grid gap-2 rounded border p-3">
              <p className="font-medium">Item {idx + 1}</p>
              <div className="space-y-2">
                <Label>Item Name</Label>
                <select
                  value={row.item_name_id}
                  onChange={(e) => updateRow(idx, "item_name_id", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="" disabled>Select Item</option>
                  {itemNames.map((i) => <option key={i.item_name_id} value={i.item_name_id}>{i.item_name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={row.total_quantity} onChange={(e) => updateRow(idx, "total_quantity", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Item Price</Label><Input type="number" step="0.01" value={row.item_price} onChange={(e) => updateRow(idx, "item_price", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Total Price</Label>
                <Input
                  value={String(
                    (Number(row.total_quantity || 0) * Number(row.item_price || 0)).toFixed(2)
                  )}
                  readOnly
                />
              </div>
              <div className="space-y-2"><Label>Received From *</Label><Input value={row.received_from} onChange={(e) => updateRow(idx, "received_from", e.target.value)} required /></div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addRow}>+ Add Item</Button>
          <input
            type="hidden"
            name="items_json"
            value={JSON.stringify(
              rows
                .filter((r) => r.item_name_id && r.total_quantity)
                .map((r) => ({
                  item_name_id: Number(r.item_name_id),
                  total_quantity: Number(r.total_quantity),
                  item_price: Number(r.item_price || "0"),
                  received_from: r.received_from || "N/A",
                }))
            )}
          />
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={bulkItems} searchKey="item_name" />
    </div>
  );
}
