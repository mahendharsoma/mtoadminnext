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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createVehicleTypeAction,
  updateVehicleTypeAction,
  deleteVehicleTypeAction,
  createInspectionTitleAction,
  updateInspectionTitleAction,
  deleteInspectionTitleAction,
  createLubricantTypeAction,
  updateLubricantTypeAction,
  deleteLubricantTypeAction,
  createLubricantGradeAction,
  updateLubricantGradeAction,
  deleteLubricantGradeAction,
  createLubricantAction,
  updateLubricantAction,
  deleteLubricantAction,
} from "@/actions/misc.actions";
import type { VehicleType, InspectionTitle, LubricantType, LubricantGrade, Lubricant } from "@/lib/types";
import type { RowDataPacket } from "mysql2/promise";

export function VehicleTypesClient({ types }: { types: VehicleType[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<VehicleType | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<VehicleType>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    { accessorKey: "vehicle_type_name", header: "Vehicle Type Name" },
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
            onClick={() => {
              if (!confirm("Delete this vehicle type?")) return;
              startTransition(async () => {
                const result = await deleteVehicleTypeAction(row.original.vehicle_type_id);
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
      <PageHeader title="Vehicle Types">
        <CrudDialog title="Add Vehicle Type" onSubmit={createVehicleTypeAction} triggerLabel="Add Vehicle Type">
          <div className="space-y-2">
            <Label>Vehicle Type Name *</Label>
            <Input name="vehicle_type_name" placeholder="Vehicle Type Name" required />
          </div>
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={types} searchKey="vehicle_type_name" searchPlaceholder="Search:"  exportTitle="Vehicle Types" exportFileName="vehicle-types"/>
      {edit && (
        <CrudDialog
          title="Edit Vehicle Type"
          onSubmit={updateVehicleTypeAction}
          open={!!edit}
          onOpenChange={(o) => !o && setEdit(null)}
          hideTrigger
        >
          <input type="hidden" name="vehicle_type_id" value={edit.vehicle_type_id} />
          <div className="space-y-2">
            <Label>Vehicle Type Name *</Label>
            <Input name="vehicle_type_name" defaultValue={edit.vehicle_type_name} required />
          </div>
        </CrudDialog>
      )}
    </div>
  );
}

export function InspectionTitlesClient({
  titles,
  types,
  selectedVehicleTypeId,
}: {
  titles: InspectionTitle[];
  types: VehicleType[];
  selectedVehicleTypeId?: number;
}) {
  const router = useRouter();
  const [edit, setEdit] = useState<InspectionTitle | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();

  function onVehicleTypeChange(vehicleTypeId: string) {
    if (!vehicleTypeId) {
      router.push("/inspection-titles");
      return;
    }
    router.push(`/inspection-titles?vehicle_type_id=${vehicleTypeId}`);
  }

  const columns: ColumnDef<InspectionTitle>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    { accessorKey: "inspection_title", header: "Inspection Title" },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            onClick={() => {
              if (!confirm("Are you sure want to Delete?")) return;
              startTransition(async () => {
                const result = await deleteInspectionTitleAction(row.original.inspection_title_id);
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
    <Card>
      <CardHeader>
        <CardTitle>Inspection Titles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-type-select">Select Vehicle *:</Label>
          <select
            id="vehicle-type-select"
            value={selectedVehicleTypeId ?? ""}
            onChange={(e) => onVehicleTypeChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">--Select Vehicle Type--</option>
            {types.map((t) => (
              <option key={t.vehicle_type_id} value={t.vehicle_type_id}>
                {t.vehicle_type_name}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicleTypeId ? (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setAddOpen(true)}>Add Inspection Title</Button>
            </div>
            {titles.length > 0 ? (
              <DataTable columns={columns} data={titles} exportTitle="Inspection Titles" exportFileName="inspection-titles" />
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No inspection titles found for this vehicle type.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Please select a vehicle type to view inspection titles.
          </p>
        )}
      </CardContent>

      <CrudDialog
        title="Add Inspection Title"
        onSubmit={createInspectionTitleAction}
        open={addOpen}
        onOpenChange={setAddOpen}
        hideTrigger
        submitLabel="Submit"
      >
        <div className="space-y-2">
          <Label>Vehicle Type *</Label>
          <select
            name="vehicle_type_id"
            defaultValue={selectedVehicleTypeId ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Select Vehicle Type</option>
            {types.map((t) => (
              <option key={t.vehicle_type_id} value={t.vehicle_type_id}>
                {t.vehicle_type_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Inspection Title *</Label>
          <Input name="inspection_title" placeholder="Inspection Title" required />
        </div>
      </CrudDialog>

      {edit && (
        <CrudDialog
          title="Edit"
          onSubmit={updateInspectionTitleAction}
          open={!!edit}
          onOpenChange={(o) => !o && setEdit(null)}
          hideTrigger
          submitLabel="Submit"
        >
          <input type="hidden" name="inspection_title_id" value={edit.inspection_title_id} />
          <div className="space-y-2">
            <Label>Inspection Title</Label>
            <Input name="inspection_title" defaultValue={edit.inspection_title} required />
          </div>
        </CrudDialog>
      )}
    </Card>
  );
}

export function LubricantsClient({
  lubricants,
  types,
  grades,
}: {
  lubricants: Lubricant[];
  types: LubricantType[];
  grades: LubricantGrade[];
}) {
  const router = useRouter();
  const [editType, setEditType] = useState<LubricantType | null>(null);
  const [editGrade, setEditGrade] = useState<LubricantGrade | null>(null);
  const [editLubricant, setEditLubricant] = useState<Lubricant | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<Lubricant>[] = [
    { accessorKey: "lubricant_name", header: "Lubricant" },
    { accessorKey: "lubricant_type_name", header: "Type" },
    { accessorKey: "lubricant_grade_name", header: "Grade" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditLubricant(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this lubricant?")) {
                startTransition(async () => {
                  const r = await deleteLubricantAction(row.original.lubricant_id);
                  toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage);
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

  const typeColumns: ColumnDef<LubricantType>[] = [
    { accessorKey: "lubricant_type_name", header: "Lubricant Type" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditType(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this lubricant type?")) {
                startTransition(async () => {
                  const r = await deleteLubricantTypeAction(row.original.lubricant_type_id);
                  toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage);
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

  const gradeColumns: ColumnDef<LubricantGrade>[] = [
    { accessorKey: "lubricant_grade_name", header: "Lubricant Grade" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditGrade(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this lubricant grade?")) {
                startTransition(async () => {
                  const r = await deleteLubricantGradeAction(row.original.lubricant_grade_id);
                  toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage);
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
      <PageHeader title="Lubricant Setup" description="Types, grades, and lubricants" />
      <div className="grid gap-4 sm:grid-cols-12 mb-8">
        <Card className="sm:col-span-6">
          <CardHeader><CardTitle className="text-base">Add Type</CardTitle></CardHeader>
          <CardContent>
            <form action={async (fd) => { const r = await createLubricantTypeAction(fd); toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage); }} className="flex gap-2">
              <Input name="lubricant_type_name" placeholder="Type name" required />
              <Button type="submit" size="sm">Add</Button>
            </form>
            <div className="mt-4">
              <DataTable columns={typeColumns} data={types} searchKey="lubricant_type_name" exportTitle="Lubricant Types" exportFileName="lubricant-types" />
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-6">
          <CardHeader><CardTitle className="text-base">Add Grade</CardTitle></CardHeader>
          <CardContent>
            <form action={async (fd) => { const r = await createLubricantGradeAction(fd); toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage); }} className="flex gap-2">
              <Input name="lubricant_grade_name" placeholder="Grade name" required />
              <Button type="submit" size="sm">Add</Button>
            </form>
            <div className="mt-4">
              <DataTable columns={gradeColumns} data={grades} searchKey="lubricant_grade_name" exportTitle="Lubricant Grades" exportFileName="lubricant-grades" />
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-12">
          <CardHeader><CardTitle className="text-base">Add Lubricant</CardTitle></CardHeader>
          <CardContent>
            <CrudDialog title="Add Lubricant" onSubmit={createLubricantAction} triggerLabel="Add">
              <div className="space-y-2">
                <Label>Type</Label>
                <select name="lubricant_type_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  {types.map((t) => <option key={t.lubricant_type_id} value={t.lubricant_type_id}>{t.lubricant_type_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <select name="lubricant_grade_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  {grades.map((g) => <option key={g.lubricant_grade_id} value={g.lubricant_grade_id}>{g.lubricant_grade_name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Name</Label><Input name="lubricant_name" required /></div>
            </CrudDialog>
          </CardContent>
        </Card>
      </div>

      {editType && (
        <CrudDialog
          title="Edit Lubricant Type"
          onSubmit={updateLubricantTypeAction}
          open={!!editType}
          onOpenChange={(o) => !o && setEditType(null)}
          hideTrigger
        >
          <input type="hidden" name="lubricant_type_id" value={editType.lubricant_type_id} />
          <div className="space-y-2">
            <Label>Lubricant Type Name</Label>
            <Input name="lubricant_type_name" defaultValue={editType.lubricant_type_name} required />
          </div>
        </CrudDialog>
      )}
      {editGrade && (
        <CrudDialog
          title="Edit Lubricant Grade"
          onSubmit={updateLubricantGradeAction}
          open={!!editGrade}
          onOpenChange={(o) => !o && setEditGrade(null)}
          hideTrigger
        >
          <input type="hidden" name="lubricant_grade_id" value={editGrade.lubricant_grade_id} />
          <div className="space-y-2">
            <Label>Lubricant Grade</Label>
            <Input name="lubricant_grade_name" defaultValue={editGrade.lubricant_grade_name} required />
          </div>
        </CrudDialog>
      )}
      {editLubricant && (
        <CrudDialog
          title="Edit Lubricant"
          onSubmit={updateLubricantAction}
          open={!!editLubricant}
          onOpenChange={(o) => !o && setEditLubricant(null)}
          hideTrigger
        >
          <input type="hidden" name="lubricant_id" value={editLubricant.lubricant_id} />
          <div className="space-y-2">
            <Label>Lubricant Name</Label>
            <Input name="lubricant_name" defaultValue={editLubricant.lubricant_name} required />
          </div>
          <div className="space-y-2">
            <Label>Lubricant Type</Label>
            <select name="lubricant_type_id" defaultValue={editLubricant.lubricant_type_id} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
              <option value="">-- Select Lubricant Type --</option>
              {types.map((t) => <option key={t.lubricant_type_id} value={t.lubricant_type_id}>{t.lubricant_type_name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Lubricant Grade</Label>
            <select name="lubricant_grade_id" defaultValue={editLubricant.lubricant_grade_id} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
              <option value="">-- Select Lubricant Grade --</option>
              {grades.map((g) => <option key={g.lubricant_grade_id} value={g.lubricant_grade_id}>{g.lubricant_grade_name}</option>)}
            </select>
          </div>
        </CrudDialog>
      )}
      <DataTable columns={columns} data={lubricants} searchKey="lubricant_name" exportTitle="Lubricants" exportFileName="lubricants" />
    </div>
  );
}

export function LubricantInventoryClient({ inventory }: { inventory: RowDataPacket[] }) {
  const columns: ColumnDef<RowDataPacket>[] = [
    { accessorKey: "lubricant_name", header: "Lubricant" },
    { accessorKey: "lubricant_type_name", header: "Type" },
    { accessorKey: "lubricant_grade_name", header: "Grade" },
    { accessorKey: "total_received_liters", header: "Liters In" },
    { accessorKey: "total_allocated_liters", header: "Liters Out" },
    { accessorKey: "available_liters", header: "Available" },
  ];

  return (
    <div>
      <PageHeader title="Lubricant Inventory" description="Current lubricant stock in liters" />
      <DataTable columns={columns} data={inventory} searchKey="lubricant_name" exportTitle="Lubricant Inventory" exportFileName="lubricant-inventory" />
    </div>
  );
}
