"use client";

import { useMemo, useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, Plus, Printer, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addLubricantReceiveVoucherItemsAction,
  deleteLubricantReceiveVoucherItemAction,
  receivePartialLubricantQuantityAction,
} from "@/actions/misc.actions";
import type {
  Lubricant,
  LubricantReceiveVoucher,
  LubricantVoucherItem,
  LubricantVoucherContainer,
} from "@/lib/types";

type ItemRow = {
  id: number;
  lubricant_id: string;
  quantity_liters: string;
  price_per_liter: string;
  cgst_percent: string;
  sgst_percent: string;
  igst_percent: string;
};

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function calcRowTotals(row: ItemRow) {
  const qty = parseFloat(row.quantity_liters) || 0;
  const price = parseFloat(row.price_per_liter) || 0;
  const cgstPct = parseFloat(row.cgst_percent) || 0;
  const sgstPct = parseFloat(row.sgst_percent) || 0;
  const igstPct = parseFloat(row.igst_percent) || 0;
  const amount = round2(qty * price);
  const cgstAmount = round2((amount * cgstPct) / 100);
  const sgstAmount = round2((amount * sgstPct) / 100);
  const igstAmount = round2((amount * igstPct) / 100);
  const total = round2(amount + cgstAmount + sgstAmount + igstAmount);
  return { amount, cgstAmount, sgstAmount, igstAmount, total };
}

function lubricantLabel(l: Lubricant): string {
  const type = l.lubricant_type_name ?? "";
  const grade = l.lubricant_grade_name ?? "";
  return `${l.lubricant_name} (${type} | ${grade})`;
}

export function LubricantVoucherItemsClient({
  voucher,
  items,
  lubricants,
  containers,
}: {
  voucher: LubricantReceiveVoucher;
  items: LubricantVoucherItem[];
  lubricants: Lubricant[];
  containers: LubricantVoucherContainer[];
}) {
  const router = useRouter();
  const voucherId = voucher.lubricant_receive_voucher_id;
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextRowId, setNextRowId] = useState(1);
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveItem, setReceiveItem] = useState<LubricantVoucherItem | null>(null);
  const [receiveQty, setReceiveQty] = useState("");
  const [litersPerContainer, setLitersPerContainer] = useState("");

  function addRow() {
    const id = nextRowId;
    setNextRowId((n) => n + 1);
    setRows((prev) => [
      ...prev,
      {
        id,
        lubricant_id: "",
        quantity_liters: "",
        price_per_liter: "",
        cgst_percent: "0",
        sgst_percent: "0",
        igst_percent: "0",
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(id: number, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function handleSubmitItems(e: React.FormEvent) {
    e.preventDefault();
    const payload = rows
      .filter((r) => r.lubricant_id && r.quantity_liters)
      .map((r) => {
        const totals = calcRowTotals(r);
        return {
          lubricant_id: Number(r.lubricant_id),
          quantity_liters: Number(r.quantity_liters),
          price_per_liter: Number(r.price_per_liter || 0),
          cgst_percent: Number(r.cgst_percent || 0),
          sgst_percent: Number(r.sgst_percent || 0),
          igst_percent: Number(r.igst_percent || 0),
          amount: totals.amount,
          cgst_amount: totals.cgstAmount,
          sgst_amount: totals.sgstAmount,
          igst_amount: totals.igstAmount,
          total_amount: totals.total,
        };
      });
    if (!payload.length) {
      toast.error("No items found, please add at least one item");
      return;
    }
    setIsSubmitting(true);
    const fd = new FormData();
    fd.set("voucher_id", String(voucherId));
    fd.set("items_json", JSON.stringify(payload));
    const result = await addLubricantReceiveVoucherItemsAction(fd);
    setIsSubmitting(false);
    if (result.statusCode === 200) {
      toast.success(result.statusMessage);
      setRows([]);
      router.refresh();
    } else {
      toast.error(result.statusMessage);
    }
  }

  function openReceiveModal(item: LubricantVoucherItem) {
    setReceiveItem(item);
    setReceiveQty("");
    setLitersPerContainer("");
    setReceiveOpen(true);
  }

  async function saveReceiveQuantity() {
    if (!receiveItem) return;
    const quantity = parseFloat(receiveQty);
    const perContainer = parseFloat(litersPerContainer);
    const balance = Number(receiveItem.balance_liters ?? 0);
    if (Number.isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid receive quantity");
      return;
    }
    if (quantity > balance) {
      toast.error(`Receive quantity cannot exceed balance: ${balance} L`);
      return;
    }
    if (Number.isNaN(perContainer) || perContainer <= 0) {
      toast.error("Please enter valid liters per container");
      return;
    }
    const fd = new FormData();
    fd.set("parent_receive_item_id", String(receiveItem.receive_item_id));
    fd.set("voucher_id", String(voucherId));
    fd.set("receive_quantity", String(quantity));
    fd.set("liters_per_container", String(perContainer));
    const result = await receivePartialLubricantQuantityAction(fd);
    if (result.statusCode === 200) {
      toast.success(result.statusMessage);
      setReceiveOpen(false);
      router.refresh();
    } else {
      toast.error(result.statusMessage);
    }
  }

  function printAllBarcodes() {
    if (!containers.length) {
      toast.error("No containers to print.");
      return;
    }
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const columnsPerRow = 3;
    let html =
      "<html><head><title>Print Lubricant Barcodes</title>" +
      "<style>" +
      "table{width:100%;border-collapse:collapse}" +
      "td{padding:20px;text-align:center;vertical-align:middle}" +
      "img{display:block;margin:0 auto}" +
      ".barcode-number{font-size:14px;margin-top:10px;font-weight:bold}" +
      ".location-name{font-size:16px;font-weight:bold;margin-bottom:10px}" +
      ".lubricant-name{font-size:14px;margin-bottom:5px}" +
      ".capacity{font-size:12px;color:#666}" +
      "@media print{body{margin:0}}" +
      "</style></head><body><table><tr>";

    containers.forEach((c, index) => {
      const imgSrc = c.barcode_image_path ? `/${c.barcode_image_path}` : "";
      html += "<td>";
      html += "<div class=\"location-name\">MALKAJGIRI</div>";
      html += `<div class="lubricant-name">${c.lubricant_name}</div>`;
      html += `<div class="capacity">Capacity: ${c.container_capacity}L</div>`;
      if (imgSrc) {
        html += `<img src="${imgSrc}" width="200" height="50" alt="${c.barcode}">`;
      }
      html += `<div class="barcode-number">${c.barcode}</div>`;
      html += "</td>";
      if ((index + 1) % columnsPerRow === 0) html += "</tr><tr>";
    });
    html += "</tr></table></body></html>";
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }

  const itemColumns: ColumnDef<LubricantVoucherItem>[] = useMemo(
    () => [
      {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      { accessorKey: "lubricant_name", header: "Lubricant" },
      {
        accessorKey: "ordered_quantity",
        header: "Ordered (L)",
        cell: ({ row }) => Number(row.original.ordered_quantity ?? 0).toFixed(2),
      },
      {
        accessorKey: "total_received_liters",
        header: "Received (L)",
        cell: ({ row }) => Number(row.original.total_received_liters ?? 0).toFixed(2),
      },
      {
        accessorKey: "balance_liters",
        header: "Balance (L)",
        cell: ({ row }) => Number(row.original.balance_liters ?? 0).toFixed(2),
      },
      {
        accessorKey: "price_per_liter",
        header: "Price/L",
        cell: ({ row }) => Number(row.original.price_per_liter ?? 0).toFixed(2),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => Number(row.original.amount ?? 0).toFixed(2),
      },
      {
        accessorKey: "cgst_amount",
        header: "CGST",
        cell: ({ row }) => Number(row.original.cgst_amount ?? 0).toFixed(2),
      },
      {
        accessorKey: "sgst_amount",
        header: "SGST",
        cell: ({ row }) => Number(row.original.sgst_amount ?? 0).toFixed(2),
      },
      {
        accessorKey: "igst_amount",
        header: "IGST",
        cell: ({ row }) => Number(row.original.igst_amount ?? 0).toFixed(2),
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => Number(row.original.total_amount ?? 0).toFixed(2),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {Number(row.original.balance_liters ?? 0) > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openReceiveModal(row.original)}
              >
                <Download className="h-4 w-4" />
                Receive
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => {
                if (
                  !confirm(
                    "Are you sure? This will delete the item, all its receives, containers, and reverse inventory!"
                  )
                ) {
                  return;
                }
                startTransition(async () => {
                  const result = await deleteLubricantReceiveVoucherItemAction(
                    row.original.receive_item_id,
                    voucherId
                  );
                  toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
                  router.refresh();
                });
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [isPending, router, voucherId]
  );

  const containerColumns: ColumnDef<LubricantVoucherContainer>[] = useMemo(
    () => [
      {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ row }) => <strong>{row.original.barcode}</strong>,
      },
      {
        accessorKey: "barcode_image_path",
        header: "Barcode Image",
        cell: ({ row }) => {
          const imagePath = row.original.barcode_image_path;
          if (!imagePath) return <span className="text-muted-foreground">No image</span>;
          return (
            <Image
              src={`/${imagePath}`}
              alt={row.original.barcode}
              width={120}
              height={60}
              className="mx-auto h-[60px] w-auto object-contain"
              unoptimized
            />
          );
        },
      },
      { accessorKey: "lubricant_name", header: "Lubricant" },
      {
        accessorKey: "container_capacity",
        header: "Capacity (L)",
        cell: ({ row }) => Number(row.original.container_capacity ?? 0).toFixed(2),
      },
      {
        accessorKey: "available_liters",
        header: "Available (L)",
        cell: ({ row }) => Number(row.original.available_liters ?? 0).toFixed(2),
      },
      { accessorKey: "status", header: "Status" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="rounded bg-green-600 px-3 py-2 text-base font-medium text-white">
            Voucher: {voucher.voucher_no}
            &nbsp;|&nbsp; Date: {voucher.voucher_date}
            &nbsp;|&nbsp; Note File: {voucher.note_file_no}
            {voucher.vendor_name ? (
              <>
                &nbsp;|&nbsp; Vendor: {voucher.vendor_name}
              </>
            ) : null}
          </CardTitle>
          <Link href="/lubricant-receive-voucher">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Vouchers
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitItems} className="space-y-4">
            <div id="itemForm" className="space-y-3">
              {rows.map((row, index) => {
                const totals = calcRowTotals(row);
                return (
                  <div key={row.id} className="rounded border p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="font-medium">Item {index + 1}</h5>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeRow(row.id)}>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                      <div className="space-y-1 md:col-span-2">
                        <Label>
                          Lubricant <span className="text-destructive">*</span>
                        </Label>
                        <select
                          value={row.lubricant_id}
                          onChange={(e) => updateRow(row.id, { lubricant_id: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">-- Select Lubricant --</option>
                          {lubricants.map((lubricant) => (
                            <option key={lubricant.lubricant_id} value={lubricant.lubricant_id}>
                              {lubricantLabel(lubricant)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label>
                          Ordered Qty (L) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0.01}
                          value={row.quantity_liters}
                          onChange={(e) => updateRow(row.id, { quantity_liters: e.target.value })}
                          placeholder="Ordered Liters"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>
                          Price/L <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={row.price_per_liter}
                          onChange={(e) => updateRow(row.id, { price_per_liter: e.target.value })}
                          placeholder="Price/L"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Amount</Label>
                        <Input value={totals.amount.toFixed(2)} readOnly />
                      </div>
                      <div className="space-y-1">
                        <Label>CGST%</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={row.cgst_percent}
                          onChange={(e) => updateRow(row.id, { cgst_percent: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>CGST Amt</Label>
                        <Input value={totals.cgstAmount.toFixed(2)} readOnly />
                      </div>
                      <div className="space-y-1">
                        <Label>SGST%</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={row.sgst_percent}
                          onChange={(e) => updateRow(row.id, { sgst_percent: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>SGST Amt</Label>
                        <Input value={totals.sgstAmount.toFixed(2)} readOnly />
                      </div>
                      <div className="space-y-1">
                        <Label>IGST%</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={row.igst_percent}
                          onChange={(e) => updateRow(row.id, { igst_percent: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>IGST Amt</Label>
                        <Input value={totals.igstAmount.toFixed(2)} readOnly />
                      </div>
                      <div className="space-y-1">
                        <Label>Total</Label>
                        <Input value={totals.total.toFixed(2)} readOnly />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button type="button" variant="outline" onClick={addRow}>
              <Plus className="h-4 w-4" />
              Add Oil
            </Button>
            <div>
              <Button type="submit" disabled={isSubmitting || !rows.length}>
                {isSubmitting ? "Saving..." : "Submit Items"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voucher Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={itemColumns} data={items} searchKey="lubricant_name" exportTitle="Lubricant Voucher Items" exportFileName="lubricant-voucher-items" />
        </CardContent>
      </Card>

      {containers.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Generated Containers</CardTitle>
            <Button type="button" onClick={printAllBarcodes}>
              <Printer className="h-4 w-4" />
              Print All Barcodes
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={containerColumns} data={containers} searchKey="barcode" exportTitle="Lubricant Containers" exportFileName="lubricant-containers" />
          </CardContent>
        </Card>
      )}

      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Lubricant Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receive_lubricant_name">Lubricant</Label>
              <Input id="receive_lubricant_name" value={receiveItem?.lubricant_name ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receive_balance_liters">Balance (L)</Label>
              <Input
                id="receive_balance_liters"
                value={Number(receiveItem?.balance_liters ?? 0).toFixed(2)}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receive_quantity">
                Receive Quantity (L) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="receive_quantity"
                type="number"
                step="0.01"
                value={receiveQty}
                onChange={(e) => setReceiveQty(e.target.value)}
                placeholder="Quantity to receive"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receive_liters_per_container">
                Liters Per Container <span className="text-destructive">*</span>
              </Label>
              <Input
                id="receive_liters_per_container"
                type="number"
                step="0.01"
                value={litersPerContainer}
                onChange={(e) => setLitersPerContainer(e.target.value)}
                placeholder="Liters per container"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReceiveOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={saveReceiveQuantity}>
              Receive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
