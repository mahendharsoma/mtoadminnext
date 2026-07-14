"use client";

import Link from "next/link";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addBulkItemQuantityAction,
  deleteSingleBarcodeItemAction,
} from "@/actions/inventory.actions";
import { getBarcodeImageSrc } from "@/lib/barcode-utils";
import type { RowDataPacket } from "mysql2/promise";

type BulkItemDetails = RowDataPacket & {
  bulk_items_id: number;
  received_voucher_id: number;
  make_type_id: number | null;
  variant_id: number | null;
  item_name_id: number;
  is_common?: number;
  total_quantity: string | number;
  item_price: string | number;
  received_quantity?: number;
  make_type_name?: string;
  variant_name?: string;
  item_name?: string;
};

type UnitItem = RowDataPacket & {
  item_inventory_id: number;
  bulk_items_id: number;
  is_common?: number;
  make_type_name?: string | null;
  variant_name?: string | null;
  item_name?: string | null;
  barcode_number?: string | null;
  barcode_image?: string | null;
  item_price?: string | number;
  status?: string;
  created_on?: string;
};

function formatReceivedDate(createdOn?: string): string {
  if (!createdOn) return "—";
  const d = new Date(createdOn);
  if (Number.isNaN(d.getTime())) return createdOn.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function MakeTypeCell({ item }: { item: UnitItem }) {
  if (Number(item.is_common) === 1) {
    return <Badge variant="secondary">Common</Badge>;
  }
  if (!item.make_type_name) return "NA";
  return item.make_type_name;
}

function VariantCell({ item }: { item: UnitItem }) {
  if (Number(item.is_common) === 1) {
    return <Badge variant="secondary">All Vehicles</Badge>;
  }
  if (!item.variant_name) return "NA";
  return item.variant_name;
}

function ItemNameCell({ item }: { item: UnitItem }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-1">
      {item.item_name ?? "—"}
      {Number(item.is_common) === 1 ? (
        <Badge variant="secondary" className="ml-1">
          Common
        </Badge>
      ) : null}
    </span>
  );
}

export function AddItemsQuantityClient({
  bulk,
  unitItems,
}: {
  bulk: BulkItemDetails;
  unitItems: UnitItem[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const totalQty = Number(bulk.total_quantity || 0);
  const receivedQty = Number(bulk.received_quantity || 0);
  const pending = Math.max(0, totalQty - receivedQty);
  const voucherHref = `/received-voucher/${bulk.received_voucher_id}/items`;
  const defaultPrice = String(bulk.item_price ?? "0").replace(/,/g, "");
  const today = new Date().toISOString().slice(0, 10);

  function handleAddQuantity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSubmitTransition(async () => {
      const result = await addBulkItemQuantityAction(fd);
      if (result.statusCode === 200) {
        toast.success(result.statusMessage);
        formRef.current?.reset();
        router.refresh();
      } else {
        toast.error(result.statusMessage);
      }
    });
  }

  function handleDelete(itemInventoryId: number) {
    if (!confirm("Are you sure want to Remove Item?")) return;
    const fd = new FormData();
    fd.set("item_inventory_id", String(itemInventoryId));
    fd.set("bulk_items_id", String(bulk.bulk_items_id));
    startDeleteTransition(async () => {
      const result = await deleteSingleBarcodeItemAction(fd);
      if (result.statusCode === 200) {
        toast.success(result.statusMessage);
        router.refresh();
      } else {
        toast.error(result.statusMessage);
      }
    });
  }

  function printBarcodes() {
    if (!unitItems.length) {
      toast.error("No barcodes to print.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const columnsPerRow = 3;
    let html =
      "<html><head><title>Print Barcodes</title>" +
      "<style>" +
      "table{width:100%;border-collapse:collapse}" +
      "td{padding:20px;text-align:center;vertical-align:middle}" +
      "img{display:block;margin:0 auto}" +
      ".barcode-number{font-size:14px;margin-top:10px;font-weight:bold}" +
      ".location-name{font-size:16px;font-weight:bold;margin-bottom:10px}" +
      ".variant-name{margin-bottom:10px;font-size:14px}" +
      ".item-name{margin-bottom:10px;font-size:14px}" +
      "@media print{body{margin:0}}" +
      "</style></head><body><table><tr>";

    unitItems.forEach((item, index) => {
      const imgSrc = getBarcodeImageSrc(item.barcode_image);
      const variantLabel =
        Number(item.is_common) === 1
          ? "All Vehicles"
          : item.variant_name || "N/A";
      const itemLabel = item.item_name || "N/A";

      html += "<td>";
      html += "<div class=\"location-name\">MALKAJGIRI</div>";
      html += `<div class="variant-name">${variantLabel}</div>`;
      html += `<div class="item-name">${itemLabel}</div>`;
      if (imgSrc) {
        html += `<img src="${imgSrc}" width="200" height="35" alt="${item.barcode_number ?? ""}">`;
      }
      html += `<div class="barcode-number">${item.barcode_number ?? ""}</div>`;
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

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={voucherHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Voucher Items
        </Link>
      </Button>

      <PageHeader
        title="Add Item Quantity"
        description={`${bulk.item_name ?? "Item"} · ${
          Number(bulk.is_common) === 1
            ? "Common Part"
            : `${bulk.make_type_name ?? "—"} / ${bulk.variant_name ?? "—"}`
        }`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Add Item Quantity</CardTitle>
        </CardHeader>
        <CardContent>
          {pending > 0 ? (
            <form ref={formRef} onSubmit={handleAddQuantity} className="space-y-4">
              <input type="hidden" name="bulk_items_id" value={bulk.bulk_items_id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="total_quantity">Total Quantity*</Label>
                  <Input
                    id="total_quantity"
                    name="total_quantity"
                    type="number"
                    value={String(totalQty)}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="received_quantity">Received Quantity*</Label>
                  <Input
                    id="received_quantity"
                    name="received_quantity"
                    type="number"
                    value={String(receivedQty)}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_item_quantity">Add Item Quantity*</Label>
                  <Input
                    id="add_item_quantity"
                    name="add_item_quantity"
                    type="number"
                    min={1}
                    max={pending}
                    placeholder="Add Item Quantity"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item_price">Item Price*</Label>
                  <Input
                    id="item_price"
                    name="item_price"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={defaultPrice}
                    placeholder="Item Price"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="received_date">Received Date*</Label>
                  <Input
                    id="received_date"
                    name="received_date"
                    type="date"
                    defaultValue={today}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              All ordered quantity has been received.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          {unitItems.length > 0 ? (
            <Button type="button" variant="default" size="sm" onClick={printBarcodes}>
              <Printer className="mr-2 h-4 w-4" />
              Print Barcodes
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-3 text-center align-middle font-medium">S.No</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Vehicle Make Type</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Vehicle Variant</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Item Name</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Item Price</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Received Date</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Barcode Number</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Barcode</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Status</th>
                  <th className="h-10 px-3 text-center align-middle font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {unitItems.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      No items added yet. Submit the form above to generate barcodes.
                    </td>
                  </tr>
                ) : (
                  unitItems.map((item, index) => {
                    const imgSrc = getBarcodeImageSrc(item.barcode_image);
                    return (
                      <tr key={item.item_inventory_id} className="border-b">
                        <td className="p-3 text-center align-middle">{index + 1}</td>
                        <td className="p-3 text-center align-middle">
                          <MakeTypeCell item={item} />
                        </td>
                        <td className="p-3 text-center align-middle">
                          <VariantCell item={item} />
                        </td>
                        <td className="p-3 text-center align-middle">
                          <ItemNameCell item={item} />
                        </td>
                        <td className="p-3 text-center align-middle">{item.item_price ?? "—"}</td>
                        <td className="p-3 text-center align-middle">
                          {formatReceivedDate(item.created_on)}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {item.barcode_number ?? "—"}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {imgSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgSrc}
                              alt={item.barcode_number || "barcode"}
                              width={100}
                              className="mx-auto h-auto bg-white"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3 text-center align-middle">{item.status ?? "—"}</td>
                        <td className="p-3 text-center align-middle">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting}
                            onClick={() => handleDelete(item.item_inventory_id)}
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {unitItems.length > 0 ? (
            <Button type="button" className="mt-4" onClick={printBarcodes}>
              <Printer className="mr-2 h-4 w-4" />
              Print Barcodes
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
