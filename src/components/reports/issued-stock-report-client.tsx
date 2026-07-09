"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDateDdMmYyyy } from "@/lib/utils";
import type { IssuedStockReportRow, ItemName, VehicleVariant } from "@/lib/types";

function getMakeLabel(row: IssuedStockReportRow): string {
  return Number(row.is_common) === 1 ? "Common" : row.make_type || "NA";
}

function getVariantLabel(row: IssuedStockReportRow): string {
  return Number(row.is_common) === 1 ? "All Vehicles" : row.variant_name || "NA";
}

const columns: ColumnDef<IssuedStockReportRow>[] = [
  {
    id: "serial",
    header: "S.NO",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "issued_date",
    header: "DATE (DD/MM/YYYY)",
    cell: ({ row }) => formatDateDdMmYyyy(row.original.issued_date || row.original.created_on),
  },
  {
    accessorKey: "registration_no",
    header: "VEHICLE NO",
    cell: ({ row }) => row.original.registration_no || "—",
  },
  {
    accessorKey: "make_type",
    header: "MAKE",
    cell: ({ row }) => getMakeLabel(row.original),
  },
  {
    accessorKey: "variant_name",
    header: "VARIANT",
    cell: ({ row }) => getVariantLabel(row.original),
  },
  {
    accessorKey: "item_name",
    header: "ITEM NAME",
    cell: ({ row }) => row.original.item_name || "—",
  },
  {
    accessorKey: "total_issued_stock",
    header: "TOTAL Issued Stock",
    cell: ({ row }) => row.original.total_issued_stock ?? 0,
  },
];

export function IssuedStockReportClient({
  rows,
  variants,
  itemNames,
  fromDate,
  toDate,
  selectedVariantId,
  selectedItemNameId,
}: {
  rows: IssuedStockReportRow[];
  variants: VehicleVariant[];
  itemNames: ItemName[];
  fromDate: string;
  toDate: string;
  selectedVariantId?: number;
  selectedItemNameId?: number;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [variantId, setVariantId] = useState(
    selectedVariantId ? String(selectedVariantId) : ""
  );
  const [itemNameId, setItemNameId] = useState(
    selectedItemNameId ? String(selectedItemNameId) : ""
  );

  function buildUrl(
    nextFrom: string,
    nextTo: string,
    nextVariantId: string,
    nextItemNameId: string
  ) {
    const params = new URLSearchParams({ from: nextFrom, to: nextTo });
    if (nextVariantId) params.set("variant_id", nextVariantId);
    if (nextItemNameId) params.set("item_name_id", nextItemNameId);
    return `/reports/issued-stock?${params.toString()}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issued Stock Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!from || !to) return;
            router.push(buildUrl(from, to, variantId, itemNameId));
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="from-date">From date*</Label>
            <Input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to-date">To date*</Label>
            <Input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 min-w-[180px]">
            <Label htmlFor="variant">Select Variant</Label>
            <select
              id="variant"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Variant</option>
              {variants.map((variant) => (
                <option key={variant.variant_id} value={variant.variant_id}>
                  {variant.variant_name}
                  {variant.make_type_name ? ` (${variant.make_type_name})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 min-w-[180px]">
            <Label htmlFor="item-name">Select Item Name</Label>
            <select
              id="item-name"
              value={itemNameId}
              onChange={(e) => setItemNameId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Item Name</option>
              {itemNames.map((item) => (
                <option key={item.item_name_id} value={item.item_name_id}>
                  {item.item_name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Search</Button>
        </form>

        <DataTable
          columns={columns}
          data={rows}
          searchKey="item_name"
          searchPlaceholder="Search:"
        />
      </CardContent>
    </Card>
  );
}
