"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableExportButtons } from "@/components/shared/table-export-buttons";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { formatDateDdMmYyyy } from "@/lib/utils";
import type { IssuedStockReportRow, ItemName, VehicleVariant } from "@/lib/types";

type DisplayRow = {
  key: string;
  serial: number;
  date: string;
  registration_no: string;
  make_label: string;
  variant_label: string;
  item_name: string;
  total_issued: number | null;
  is_common: number;
};

function buildGroupedDisplayRows(rows: IssuedStockReportRow[]): DisplayRow[] {
  const grouped = new Map<string, IssuedStockReportRow[]>();

  for (const row of rows) {
    const key = `${row.item_name ?? ""}|${row.variant_name ?? ""}|${Number(row.is_common ?? 0)}`;
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }

  const display: DisplayRow[] = [];
  let serial = 1;

  for (const [groupKey, groupRows] of grouped) {
    const [itemName, variantName, isCommonStr] = groupKey.split("|");
    const isCommon = Number(isCommonStr) === 1;
    const totalIssued = groupRows.length;
    const makeLabel = isCommon ? "Common" : groupRows[0]?.make_type || "NA";
    const variantLabel = isCommon ? "All Vehicles" : variantName || "NA";

    groupRows.forEach((row, index) => {
      display.push({
        key: `${groupKey}-${row.vehicle_allocated_items_id ?? index}`,
        serial: serial++,
        date: formatDateDdMmYyyy(row.issued_date || row.created_on),
        registration_no: row.registration_no || "NA",
        make_label: makeLabel,
        variant_label: variantLabel,
        item_name: itemName || "—",
        total_issued: index === 0 ? totalIssued : null,
        is_common: Number(row.is_common ?? 0),
      });
    });
  }

  return display;
}

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

  const variantOptions = useMemo(
    () =>
      variants.map((v) => ({
        value: String(v.variant_id),
        label: v.make_type_name
          ? `${v.variant_name} (${v.make_type_name})`
          : v.variant_name,
      })),
    [variants]
  );

  const itemOptions = useMemo(
    () =>
      itemNames.map((i) => ({
        value: String(i.item_name_id),
        label: i.item_name,
      })),
    [itemNames]
  );

  const displayRows = useMemo(() => buildGroupedDisplayRows(rows), [rows]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) return;
    const params = new URLSearchParams({ from, to });
    if (variantId) params.set("variant_id", variantId);
    if (itemNameId) params.set("item_name_id", itemNameId);
    router.push(`/reports/issued-stock?${params.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issued Stock Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from_date">From date*</Label>
              <Input
                id="from_date"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_date">To date*</Label>
              <Input
                id="to_date"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Select Variant</Label>
              <SearchableSelect
                options={variantOptions}
                value={variantId}
                onChange={setVariantId}
                placeholder="Select Variant"
                searchPlaceholder="Search variant..."
              />
            </div>
            <div className="space-y-2">
              <Label>Select Item Name</Label>
              <SearchableSelect
                options={itemOptions}
                value={itemNameId}
                onChange={setItemNameId}
                placeholder="Select Item Name"
                searchPlaceholder="Search item..."
              />
            </div>
          </div>
          <Button type="submit" variant="outline">
            Submit
          </Button>
        </form>

        <div className="space-y-3">
          <TableExportButtons
            title="Issued Stock Report"
            fileName="issued-stock-report"
            columns={[
              { header: "DATE (DD/MM/YYYY)", getValue: (r) => r.date },
              { header: "VEHICLE NO", getValue: (r) => r.registration_no },
              { header: "MAKE", getValue: (r) => r.make_label },
              { header: "VARIANT", getValue: (r) => r.variant_label },
              { header: "ITEM NAME", getValue: (r) => r.item_name },
              {
                header: "TOTAL Issued Stock",
                getValue: (r) => (r.total_issued != null ? String(r.total_issued) : ""),
              },
            ]}
            rows={displayRows}
          />

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-center font-medium">S.NO</th>
                  <th className="p-3 text-center font-medium">DATE (DD/MM/YYYY)</th>
                  <th className="p-3 text-center font-medium">VEHICLE NO</th>
                  <th className="p-3 text-center font-medium">MAKE</th>
                  <th className="p-3 text-center font-medium">VARIANT</th>
                  <th className="p-3 text-center font-medium">ITEM NAME</th>
                  <th className="p-3 text-center font-medium">TOTAL Issued Stock</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No issued stock found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => (
                    <tr key={row.key} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-center">{row.serial}</td>
                      <td className="p-3 text-center">{row.date}</td>
                      <td className="p-3 text-center">{row.registration_no}</td>
                      <td className="p-3 text-center">{row.make_label}</td>
                      <td className="p-3 text-center">{row.variant_label}</td>
                      <td className="p-3 text-center">{row.item_name}</td>
                      <td className="p-3 text-center">
                        {row.total_issued != null ? (
                          <strong>{row.total_issued}</strong>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
