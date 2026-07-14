"use client";

import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLubricantReceiveVoucherAction,
  deleteLubricantReceiveVoucherAction,
  updateLubricantReceiveVoucherAction,
} from "@/actions/misc.actions";
import type { LubricantReceiveVoucher } from "@/lib/types";

export function LubricantVoucherClient({
  vouchers,
  fromDate,
  toDate,
}: {
  vouchers: LubricantReceiveVoucher[];
  fromDate: string;
  toDate: string;
}) {
  const router = useRouter();
  const [edit, setEdit] = useState<LubricantReceiveVoucher | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<LubricantReceiveVoucher>[] = [
    { accessorKey: "note_file_no", header: "Note File No" },
    { accessorKey: "voucher_no", header: "Voucher No" },
    { accessorKey: "voucher_date", header: "Date" },
    { accessorKey: "vendor_name", header: "Vendor Name" },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => (
        <Link href={`/lubricant-receive-voucher/${row.original.lubricant_receive_voucher_id}/items`}>
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4" />
            Add Items
          </Button>
        </Link>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Delete this voucher?")) return;
              startTransition(async () => {
                const result = await deleteLubricantReceiveVoucherAction(
                  row.original.lubricant_receive_voucher_id
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
  ];

  const VoucherForm = ({ item }: { item?: LubricantReceiveVoucher }) => (
    <>
      {item && (
        <input
          type="hidden"
          name="lubricant_receive_voucher_id"
          value={item.lubricant_receive_voucher_id}
        />
      )}
      <div className="space-y-2">
        <Label>Note File No</Label>
        <Input name="note_file_no" defaultValue={item?.note_file_no} required />
      </div>
      <div className="space-y-2">
        <Label>Voucher No</Label>
        <Input name="voucher_no" defaultValue={item?.voucher_no} required />
      </div>
      <div className="space-y-2">
        <Label>Voucher Date</Label>
        <Input name="voucher_date" type="date" defaultValue={item?.voucher_date} required />
      </div>
      <div className="space-y-2">
        <Label>Vendor Name</Label>
        <Input name="vendor_name" defaultValue={item?.vendor_name ?? ""} />
      </div>
    </>
  );

  return (
    <div>
      <PageHeader title="Lubricant Receive Voucher" description="Lubricant stock-in vouchers">
        <div className="flex items-center gap-2">
          <form action="/lubricant-receive-voucher" method="get" className="flex items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="from_date">From Date</Label>
              <Input id="from_date" name="from_date" type="date" defaultValue={fromDate} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to_date">To Date</Label>
              <Input id="to_date" name="to_date" type="date" defaultValue={toDate} required />
            </div>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
          <CrudDialog
            title="Create Lubricant Receive Voucher"
            onSubmit={createLubricantReceiveVoucherAction}
            triggerLabel="Create Voucher"
          >
            <VoucherForm />
          </CrudDialog>
        </div>
      </PageHeader>
      <DataTable columns={columns} data={vouchers} searchKey="voucher_no"  exportTitle="Lubricant Receive Voucher" exportFileName="lubricant-receive-voucher"/>
      {edit && (
        <CrudDialog
          title="Edit Lubricant Receive Voucher"
          onSubmit={updateLubricantReceiveVoucherAction}
          open={!!edit}
          onOpenChange={(open) => !open && setEdit(null)}
          hideTrigger
        >
          <VoucherForm item={edit} />
        </CrudDialog>
      )}
    </div>
  );
}
