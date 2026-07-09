"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Car, Fuel, Pencil, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { CrudDialog } from "@/components/shared/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createMakeTypeAction,
  updateMakeTypeAction,
  deleteMakeTypeAction,
  createVariantAction,
  updateVariantAction,
  deleteVariantAction,
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
  getVariantsByMakeTypeAction,
} from "@/actions/vehicle.actions";
import { buildVehicleWhatsAppLinks } from "@/lib/mto-messages";
import type { VehicleMakeType, VehicleVariant, Vehicle } from "@/lib/types";
import type { PoliceStation } from "@/lib/types";

// Make Type Client
export function MakeTypeClient({ items }: { items: VehicleMakeType[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<VehicleMakeType | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<VehicleMakeType>[] = [
    {
      id: "s_no",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "make_type_name", header: "Vehicle Make Type" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) startTransition(async () => { const r = await deleteMakeTypeAction(row.original.make_type_id); toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage); router.refresh(); }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Vehicle Make Types" description="Manage vehicle manufacturers">
        <CrudDialog title="Add Make Type" onSubmit={createMakeTypeAction}>
          <div className="space-y-2"><Label>Name</Label><Input name="make_type_name" required /></div>
        </CrudDialog>
      </PageHeader>
      <DataTable
        columns={columns}
        data={items}
        searchKey="make_type_name"
        searchPlaceholder="Search..."
      />
      {edit && (
        <CrudDialog title="Edit" onSubmit={updateMakeTypeAction} open={!!edit} onOpenChange={(o) => !o && setEdit(null)} hideTrigger>
          <input type="hidden" name="make_type_id" value={edit.make_type_id} />
          <div className="space-y-2"><Label>Name</Label><Input name="make_type_name" defaultValue={edit.make_type_name} required /></div>
        </CrudDialog>
      )}
    </div>
  );
}

// Variant Client
export function VariantClient({ items, makeTypes }: { items: VehicleVariant[]; makeTypes: VehicleMakeType[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<VehicleVariant | null>(null);
  const [, startTransition] = useTransition();

  const columns: ColumnDef<VehicleVariant>[] = [
    { accessorKey: "make_type_name", header: "Make" },
    { accessorKey: "variant_name", header: "Variant" },
    { accessorKey: "status", header: "Status" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) startTransition(async () => { const r = await deleteVariantAction(row.original.variant_id); toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage); router.refresh(); }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const MakeSelect = ({ defaultMake }: { defaultMake?: number }) => (
    <div className="space-y-2">
      <Label>Make Type</Label>
      <select name="make_type_id" defaultValue={defaultMake} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
        {makeTypes.map((m) => <option key={m.make_type_id} value={m.make_type_id}>{m.make_type_name}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <PageHeader title="Vehicle Variant" description="Manage vehicle model variants">
        <CrudDialog title="Add Variant" onSubmit={createVariantAction}>
          <MakeSelect />
          <div className="space-y-2"><Label>Variant Name</Label><Input name="variant_name" required /></div>
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={items} searchKey="variant_name" />
      {edit && (
        <CrudDialog title="Edit Variant" onSubmit={updateVariantAction} open={!!edit} onOpenChange={(o) => !o && setEdit(null)} hideTrigger>
          <input type="hidden" name="variant_id" value={edit.variant_id} />
          <MakeSelect defaultMake={edit.make_type_id} />
          <div className="space-y-2"><Label>Variant Name</Label><Input name="variant_name" defaultValue={edit.variant_name} required /></div>
        </CrudDialog>
      )}
    </div>
  );
}

// Vehicles Client
export function VehiclesClient({
  vehicles,
  makeTypes,
  policeStations,
}: {
  vehicles: Vehicle[];
  makeTypes: VehicleMakeType[];
  policeStations: PoliceStation[];
}) {
  const router = useRouter();
  const [edit, setEdit] = useState<Vehicle | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [psValue, setPsValue] = useState<string>("");
  const [makeTypeValue, setMakeTypeValue] = useState<string>("");
  const [variantValue, setVariantValue] = useState<string>("");
  const [selectedMakeTypeId, setSelectedMakeTypeId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  async function loadVariants(makeTypeId: number) {
    const result = await getVariantsByMakeTypeAction(makeTypeId);
    if (result.statusCode === 200 && result.data) {
      setVariants(result.data as VehicleVariant[]);
    } else {
      setVariants([]);
    }
  }

  useEffect(() => {
    if (edit?.make_type_id) {
      setSelectedMakeTypeId(edit.make_type_id);
      loadVariants(edit.make_type_id);
      return;
    }
    if (selectedMakeTypeId) {
      loadVariants(selectedMakeTypeId);
      return;
    }
    setVariants([]);
  }, [edit, selectedMakeTypeId]);

  const columns: ColumnDef<Vehicle>[] = [
    {
      id: "s_no",
      header: "S.No",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "make_type_name", header: "Vehicle Make Type" },
    { accessorKey: "variant_name", header: "Vehicle Variant" },
    { accessorKey: "registration_no", header: "Registration Number" },
    { accessorKey: "model_year", header: "vehicle model year" },
    { accessorKey: "ps_name", header: "PS" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const vehicle = row.original;
        const officerMobile = vehicle.officer_mobile?.trim() ?? "";
        const whatsappLinks =
          officerMobile.length > 0
            ? buildVehicleWhatsAppLinks(vehicle.registration_no, officerMobile)
            : null;

        return (
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Edit"
              onClick={() => {
                setEdit(vehicle);
                setPsValue(String(vehicle.ps_id));
                setMakeTypeValue(String(vehicle.make_type_id));
                setVariantValue(String(vehicle.variant_id));
                setSelectedMakeTypeId(vehicle.make_type_id);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {!whatsappLinks ? (
              <span className="px-2 text-xs text-muted-foreground">Officer not assigned</span>
            ) : (
              <>
                <Button variant="ghost" size="icon" asChild title="ADDL. QUOTA SANCTION">
                  <a href={whatsappLinks.addQuota} target="_blank" rel="noopener noreferrer">
                    <Fuel className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild title="VEHICLE SERVICING DUE">
                  <a href={whatsappLinks.service} target="_blank" rel="noopener noreferrer">
                    <Car className="h-4 w-4 text-amber-600" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild title="VEHICLE INSPECTION DUE">
                  <a href={whatsappLinks.inspection} target="_blank" rel="noopener noreferrer">
                    <Shield className="h-4 w-4 text-sky-600" />
                  </a>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              title="Delete"
              onClick={() => {
                if (confirm("Are you sure want to delete?")) {
                  startTransition(async () => {
                    const r = await deleteVehicleAction(vehicle.vehicle_id);
                    toast[r.statusCode === 200 ? "success" : "error"](r.statusMessage);
                    router.refresh();
                  });
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>

            <Button variant="ghost" size="icon" asChild title="fuel">
              <Link href={`/vehicles/${vehicle.vehicle_id}/fuel`}>
                <Fuel className="h-4 w-4 text-primary" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  const VehicleForm = ({ item }: { item?: Vehicle }) => (
    <>
      {item && <input type="hidden" name="vehicle_id" value={item.vehicle_id} />}
      <div className="space-y-2">
        <Label>Select PS</Label>
        <select
          name="ps_id"
          value={psValue}
          onChange={(e) => setPsValue(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="" disabled>
            Select PS
          </option>
          {policeStations.map((ps) => <option key={ps.ps_id} value={ps.ps_id}>{ps.ps_name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Select Make Type</Label>
        <select
          name="make_type_id"
          value={makeTypeValue}
          onChange={(e) => {
            const value = e.target.value;
            setMakeTypeValue(value);
            setVariantValue("");
            if (!value) {
              setSelectedMakeTypeId(null);
              setVariants([]);
              return;
            }
            const makeTypeId = Number(value);
            setSelectedMakeTypeId(Number.isNaN(makeTypeId) ? null : makeTypeId);
            setVariants([]);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="" disabled>
            Select Make Type
          </option>
          {makeTypes.map((m) => <option key={m.make_type_id} value={m.make_type_id}>{m.make_type_name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Select Variant</Label>
        <select
          name="variant_id"
          value={variantValue}
          onChange={(e) => setVariantValue(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
          disabled={variants.length === 0}
        >
          <option value="" disabled>
            {variants.length === 0 ? "Select Make Type First" : "Select Variant"}
          </option>
          {variants.map((v) => <option key={v.variant_id} value={v.variant_id}>{v.variant_name}</option>)}
        </select>
      </div>
      <div className="space-y-2"><Label>Registration Number</Label><Input name="registration_no" defaultValue={item?.registration_no} required /></div>
      <div className="space-y-2">
        <Label>Vehicle Model Year</Label>
        <Input name="vehicle_model_year" defaultValue={item?.model_year} required />
      </div>
    </>
  );

  return (
    <div>
      <PageHeader title="Vehicles" description="Vehicle management">
        <CrudDialog
          title="Add Vehicle"
          onSubmit={createVehicleAction}
          open={addOpen}
          onOpenChange={(open) => {
            setAddOpen(open);
            if (open) {
              setEdit(null);
              setPsValue("");
              setMakeTypeValue("");
              setVariantValue("");
              setSelectedMakeTypeId(null);
              setVariants([]);
            }
          }}
          triggerLabel="Add Vehicles"
        >
          <VehicleForm />
        </CrudDialog>
      </PageHeader>
      <DataTable columns={columns} data={vehicles} searchKey="registration_no" />
      {edit && (
        <CrudDialog
          title="Edit Vehicle"
          onSubmit={updateVehicleAction}
          open={!!edit}
          onOpenChange={(o) => {
            if (!o) {
              setEdit(null);
              setPsValue("");
              setMakeTypeValue("");
              setVariantValue("");
              setSelectedMakeTypeId(null);
              setVariants([]);
            }
          }}
          hideTrigger
        >
          <VehicleForm item={edit} />
        </CrudDialog>
      )}
    </div>
  );
}
