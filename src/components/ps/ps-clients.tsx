"use client";

import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createPsAction,
  updatePsAction,
  updatePsStatusAction,
  deletePsAction,
  createOfficerAction,
  updateOfficerAction,
  updateOfficerStatusAction,
  deleteOfficerAction,
} from "@/actions/ps.actions";
import type { PoliceStation, Officer } from "@/lib/types";

function PsForm({ item }: { item?: PoliceStation }) {
  return (
    <>
      {item && <input type="hidden" name="ps_id" value={item.ps_id} />}
      <div className="space-y-2">
        <Label>PS Name</Label>
        <Input name="ps_name" defaultValue={item?.ps_name} placeholder="PS Name" required />
      </div>
      <div className="space-y-2">
        <Label>Mobile Number</Label>
        <Input
          name="ps_phone"
          type="tel"
          defaultValue={item?.ps_phone ?? ""}
          placeholder="Mobile Number"
          pattern="\d{10}"
          maxLength={10}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <textarea
          name="address"
          defaultValue={item?.address ?? ""}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>
    </>
  );
}

export function PsClient({ stations }: { stations: PoliceStation[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<PoliceStation | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<PoliceStation>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    { accessorKey: "ps_name", header: "PS Name" },
    { accessorKey: "ps_phone", header: "Mobile Number" },
    { accessorKey: "address", header: "Address" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "Active" ? "success" : "destructive"}>
          {row.original.status}
        </Badge>
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
            onClick={() =>
              startTransition(async () => {
                const newStatus = row.original.status === "Active" ? "Inactive" : "Active";
                const result = await updatePsStatusAction(row.original.ps_id, newStatus);
                toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
                router.refresh();
              })
            }
          >
            {row.original.status === "Active" ? (
              <UserX className="h-4 w-4 text-destructive" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!confirm("Delete this police station?")) return;
              startTransition(async () => {
                const result = await deletePsAction(row.original.ps_id);
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

  return (
    <div>
      <PageHeader title="Police Stations" description="PS master data">
        <CrudDialog title="Add Police Station" onSubmit={createPsAction} triggerLabel="Add PS">
          <PsForm />
        </CrudDialog>
      </PageHeader>

      <DataTable columns={columns} data={stations} searchKey="ps_name" searchPlaceholder="Search PS..."  exportTitle="Police Stations" exportFileName="police-stations"/>

      {edit && (
        <CrudDialog
          title="Edit Police Station"
          onSubmit={updatePsAction}
          open={!!edit}
          onOpenChange={(open) => !open && setEdit(null)}
          hideTrigger
        >
          <PsForm item={edit} />
        </CrudDialog>
      )}
    </div>
  );
}

export function OfficersClient({ officers }: { officers: Officer[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Officer | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<Officer>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    { accessorKey: "officer_name", header: "Name" },
    { accessorKey: "officer_mobile", header: "Mobile Number" },
    { accessorKey: "officer_rank", header: "Employee Id" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              startTransition(async () => {
                const newStatus = row.original.status === "Active" ? "Inactive" : "Active";
                const result = await updateOfficerStatusAction(row.original.officer_id, newStatus);
                toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
                router.refresh();
              })
            }
          >
            {row.original.status === "Active" ? (
              <UserX className="h-4 w-4 text-destructive" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!confirm("Delete this officer?")) return;
              startTransition(async () => {
                const result = await deleteOfficerAction(row.original.officer_id);
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

  const Form = ({ item }: { item?: Officer }) => (
    <>
      {item && <input type="hidden" name="officer_id" value={item.officer_id} />}
      <div className="space-y-2">
        <Label>Officer Name *</Label>
        <Input name="officer_name" defaultValue={item?.officer_name} required />
      </div>
      <div className="space-y-2">
        <Label>Mobile Number *</Label>
        <Input
          name="officer_mobile"
          type="tel"
          defaultValue={item?.officer_mobile ?? ""}
          pattern="\d{10}"
          maxLength={10}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Employee Id *</Label>
        <Input name="officer_rank" defaultValue={item?.officer_rank} required />
      </div>
    </>
  );

  return (
    <div>
      <PageHeader title="Officers">
        <CrudDialog title="Add Officer" onSubmit={createOfficerAction} triggerLabel="Add Officer">
          <Form />
        </CrudDialog>
      </PageHeader>
      <DataTable
        columns={columns}
        data={officers}
        searchKey="officer_name"
        searchPlaceholder="Search:"
        exportTitle="Officers"
        exportFileName="officers"
      />
      {edit && (
        <CrudDialog title="Edit Officer" onSubmit={updateOfficerAction} open={!!edit} onOpenChange={(o) => !o && setEdit(null)} hideTrigger>
          <Form item={edit} />
        </CrudDialog>
      )}
    </div>
  );
}
