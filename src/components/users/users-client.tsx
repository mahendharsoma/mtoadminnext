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
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  deleteUserAction,
} from "@/actions/user.actions";
import type { User, Role } from "@/lib/types";

export function UsersClient({ users, roles }: { users: User[]; roles: Role[] }) {
  const router = useRouter();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<User>[] = [
    { accessorKey: "user_name", header: "Name" },
    { accessorKey: "email_id", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "role_name", header: "Role" },
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
          <Button variant="ghost" size="icon" onClick={() => setEditUser(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              startTransition(async () => {
                const newStatus = row.original.status === "Active" ? "Inactive" : "Active";
                const result = await toggleUserStatusAction(row.original.user_id, newStatus);
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
              if (confirm("Delete this user?")) {
                startTransition(async () => {
                  const result = await deleteUserAction(row.original.user_id);
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

  const UserForm = ({ user }: { user?: User }) => (
    <>
      {user && <input type="hidden" name="user_id" value={user.user_id} />}
      <div className="space-y-2">
        <Label>Name</Label>
        <Input name="user_name" defaultValue={user?.user_name} required />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input name="email_id" type="email" defaultValue={user?.email_id} required />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input name="phone" defaultValue={user?.phone} required />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <select
          name="role_id"
          defaultValue={user?.role_id}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          {roles.map((r) => (
            <option key={r.role_id} value={r.role_id}>
              {r.role_name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Password {user ? "(leave blank to keep)" : ""}</Label>
        <Input name="password" type="password" placeholder={user ? "••••••" : "123456"} />
      </div>
    </>
  );

  return (
    <div>
      <PageHeader title="Users" description="Manage system users and roles">
        <CrudDialog title="Add User" onSubmit={createUserAction}>
          <UserForm />
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={users} searchKey="user_name" searchPlaceholder="Search users..." />

      {editUser && (
        <CrudDialog
          title="Edit User"
          onSubmit={updateUserAction}
          open={!!editUser}
          onOpenChange={(o) => !o && setEditUser(null)}
          hideTrigger
        >
          <UserForm user={editUser} />
        </CrudDialog>
      )}
    </div>
  );
}
