"use client";

import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
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
  createMechanicAction,
  updateMechanicAction,
  deleteMechanicAction,
} from "@/actions/mechanics.actions";
import type { Mechanic } from "@/lib/types";

export function MechanicsClient({ mechanics }: { mechanics: Mechanic[] }) {
  const router = useRouter();
  const [editItem, setEditItem] = useState<Mechanic | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<Mechanic>[] = [
    { accessorKey: "mechanic_name", header: "Name" },
    { accessorKey: "general_number", header: "General Number" },
    { accessorKey: "mechanic_phone", header: "Phone" },
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
          <Button variant="ghost" size="icon" onClick={() => setEditItem(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this mechanic?")) {
                startTransition(async () => {
                  const result = await deleteMechanicAction(row.original.mechanic_id);
                  toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
                  router.refresh();
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const Form = ({ item }: { item?: Mechanic }) => (
    <>
      {item && <input type="hidden" name="mechanic_id" value={item.mechanic_id} />}
      <div className="space-y-2">
        <Label>Mechanic Name</Label>
        <Input name="mechanic_name" defaultValue={item?.mechanic_name} required />
      </div>
      <div className="space-y-2">
        <Label>General Number</Label>
        <Input name="general_number" defaultValue={item?.general_number} required />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input name="mechanic_phone" defaultValue={item?.mechanic_phone} required />
      </div>
    </>
  );

  return (
    <div>
      <PageHeader title="Mechanics" description="Workshop mechanic management">
        <CrudDialog title="Add Mechanic" onSubmit={createMechanicAction}>
          <Form />
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={mechanics} searchKey="mechanic_name" />
      {editItem && (
        <CrudDialog title="Edit Mechanic" onSubmit={updateMechanicAction} open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} hideTrigger>
          <Form item={editItem} />
        </CrudDialog>
      )}
    </div>
  );
}
