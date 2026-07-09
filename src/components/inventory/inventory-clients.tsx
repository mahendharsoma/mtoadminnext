"use client";

import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createItemNameAction,
  updateItemNameAction,
  deleteItemNameAction,
  createVendorAction,
  updateVendorAction,
  deleteVendorAction,
  createReceivedVoucherAction,
  updateReceivedVoucherAction,
} from "@/actions/inventory.actions";
import type { ItemName, Vendor, ReceivedVoucher, Vehicle } from "@/lib/types";

export function ItemNamesClient({ items }: { items: ItemName[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<ItemName | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<ItemName>[] = [
    { accessorKey: "item_name", header: "Item Name" },
    { accessorKey: "status", header: "Status" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) startTransition(async () => { const r = await deleteItemNameAction(row.original.item_name_id); toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage); router.refresh(); }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Item Names" description="Spare parts master data">
        <CrudDialog title="Add Item Name" onSubmit={createItemNameAction}>
          <div className="space-y-2"><Label>Item Name</Label><Input name="item_name" required /></div>
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={items} searchKey="item_name" />
      {edit && (
        <CrudDialog title="Edit Item" onSubmit={updateItemNameAction} open={!!edit} onOpenChange={(o) => !o && setEdit(null)} hideTrigger>
          <input type="hidden" name="item_name_id" value={edit.item_name_id} />
          <div className="space-y-2"><Label>Item Name</Label><Input name="item_name" defaultValue={edit.item_name} required /></div>
        </CrudDialog>
      )}
    </div>
  );
}

export function VendorsClient({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Vendor | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<Vendor>[] = [
    { accessorKey: "vendor_name", header: "Vendor" },
    { accessorKey: "vendor_phone", header: "Phone" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) startTransition(async () => { const r = await deleteVendorAction(row.original.vendor_id); toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage); router.refresh(); }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const VendorForm = ({ item }: { item?: Vendor }) => (
    <>
      {item && <input type="hidden" name="vendor_id" value={item.vendor_id} />}
      <div className="space-y-2"><Label>Vendor Name</Label><Input name="vendor_name" defaultValue={item?.vendor_name} required /></div>
      <div className="space-y-2"><Label>Phone</Label><Input name="vendor_phone" defaultValue={item?.vendor_phone} required /></div>
    </>
  );

  return (
    <div>
      <PageHeader title="Vendors" description="Supplier management">
        <CrudDialog title="Add Vendor" onSubmit={createVendorAction}><VendorForm /></CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={vendors} searchKey="vendor_name" />
      {edit && (
        <CrudDialog title="Edit Vendor" onSubmit={updateVendorAction} open={!!edit} onOpenChange={(o) => !o && setEdit(null)} hideTrigger>
          <VendorForm item={edit} />
        </CrudDialog>
      )}
    </div>
  );
}

export function ReceivedVoucherClient({
  vouchers,
  vendors,
  vehicles,
}: {
  vouchers: ReceivedVoucher[];
  vendors: Vendor[];
  vehicles: Vehicle[];
}) {
  const router = useRouter();
  const [edit, setEdit] = useState<ReceivedVoucher | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<ReceivedVoucher>[] = [
    { accessorKey: "note_file_no", header: "Note File No" },
    { accessorKey: "received_voucher", header: "Received Voucher" },
    { accessorKey: "held_date", header: "Held Date" },
    { accessorKey: "vendor_name", header: "Vendor" },
    { accessorKey: "registration_no", header: "Vehicle" },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => (
        <Link href={`/received-voucher/${row.original.received_voucher_id}/items`}>
          <Button variant="outline" size="sm"><Package className="h-4 w-4" /> Add Items</Button>
        </Link>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
      ),
    },
  ];

  const VoucherForm = ({ item }: { item?: ReceivedVoucher }) => (
    <>
      {item && <input type="hidden" name="received_voucher_id" value={item.received_voucher_id} />}
      <div className="space-y-2">
        <Label>Vendor</Label>
        <select name="vendor_id" defaultValue={item?.vendor_id ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
          <option value="" disabled>Select Vendor</option>
          {vendors.map((v) => <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Vehicle</Label>
        <select name="vehicle_id" defaultValue={item?.vehicle_id ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">-- Select Vehicle --</option>
          {vehicles.map((v) => <option key={v.vehicle_id} value={v.vehicle_id}>{v.registration_no}</option>)}
        </select>
      </div>
      <div className="space-y-2"><Label>Note File Number</Label><Input name="note_file_no" defaultValue={item?.note_file_no} required /></div>
      <div className="space-y-2"><Label>Received Voucher</Label><Input name="received_voucher" defaultValue={item?.received_voucher} required /></div>
      <div className="space-y-2"><Label>Held Date</Label><Input name="held_date" type="date" defaultValue={item?.held_date} required /></div>
    </>
  );

  return (
    <div>
      <PageHeader title="Received Vouchers" description="RV/DC voucher management">
        <CrudDialog title="Create Voucher" onSubmit={createReceivedVoucherAction} triggerLabel="Create Voucher">
          <VoucherForm />
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={vouchers} searchKey="received_voucher" />
      {edit && (
        <CrudDialog title="Edit Voucher" onSubmit={updateReceivedVoucherAction} open={!!edit} onOpenChange={(o) => !o && setEdit(null)} hideTrigger>
          <VoucherForm item={edit} />
        </CrudDialog>
      )}
    </div>
  );
}
