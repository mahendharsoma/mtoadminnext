"use client";

import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
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

function UserForm({ user, roles }: { user?: User; roles: Role[] }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            defaultValue={user?.password ?? ""}
            placeholder={user ? "Leave blank to keep current" : "Enter password"}
            className="pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </>
  );
}

export function UsersClient({ users, roles }: { users: User[]; roles: Role[] }) {
  const router = useRouter();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<User>[] = [
    { accessorKey: "user_name", header: "Name" },
    { accessorKey: "email_id", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "password",
      header: "Password",
      cell: ({ row }) => {
        const password = row.original.password?.trim() || "—";
        if (password.startsWith("$2")) {
          return <span className="text-sm text-muted-foreground">•••••••• (hashed)</span>;
        }
        return <span className="font-mono text-sm">{password}</span>;
      },
      enableSorting: false,
    },
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

  return (
    <div>
      <PageHeader title="Users" description="Manage system users and roles">
        <CrudDialog title="Add User" onSubmit={createUserAction}>
          <UserForm roles={roles} />
        </CrudDialog>
      </PageHeader>
      <DataTable
        columns={columns}
        data={users}
        searchKey="user_name"
        searchPlaceholder="Search users..."
        showSerialNumber
        exportConfig={{
          title: "Users",
          fileName: "users",
          columns: [
            { header: "Name", getValue: (r) => r.user_name },
            { header: "Email", getValue: (r) => r.email_id },
            { header: "Phone", getValue: (r) => r.phone },
            {
              header: "Password",
              getValue: (r) =>
                r.password?.startsWith("$2") ? "(hashed)" : r.password || "",
            },
            { header: "Role", getValue: (r) => r.role_name },
            { header: "Status", getValue: (r) => r.status },
          ],
        }}
      />

      {editUser && (
        <CrudDialog
          title="Edit User"
          onSubmit={updateUserAction}
          open={!!editUser}
          onOpenChange={(o) => !o && setEditUser(null)}
          hideTrigger
        >
          <UserForm user={editUser} roles={roles} />
        </CrudDialog>
      )}
    </div>
  );
}
