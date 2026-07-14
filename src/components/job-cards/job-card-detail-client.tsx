"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  assignSparePartItemAction,
  assignJobCardItemsAction,
  addJobCardOilAction,
  approveJobCardOilAction,
  updateJobCardOilAction,
  deleteJobCardOilAction,
} from "@/actions/job-card.actions";
import { JOB_TYPES, SERVICE_TYPES } from "@/lib/constants";
import type {
  JobCard,
  JobCardAssignedItem,
  JobCardOil,
  JobCardSparePart,
  Inspection,
  Lubricant,
  Mechanic,
} from "@/lib/types";

const MTO_MOBILE = "8712662874";

type SparePartRowState = Record<
  string,
  { checked: boolean; quantity: string; is_common: number; item_name_id: number }
>;

// item_name_id is not unique in this list (common + make/variant rows can share it),
// so use a stable composite key for both React rendering and row-local UI state.
function getSparePartRowKey(part: JobCardSparePart): string {
  return `${part.item_name_id}-${part.is_common}`;
}

function formatDateForInput(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).split("T")[0].split(" ")[0];
}

function formatTimeForInput(value: string | null | undefined, fallback?: string): string {
  const source = value || fallback;
  if (!source) return "";
  const match = String(source).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
}

function InfoBlock({ title, content }: { title: string; content: string | null | undefined }) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-primary-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{content?.trim() || "—"}</p>
      </CardContent>
    </Card>
  );
}

export function JobCardDetailClient({
  jobCard,
  spareParts,
  assignedItems,
  allMechanics,
  assignedMechanicIds,
  inspection,
  oils,
  lubricants,
}: {
  jobCard: JobCard;
  spareParts: JobCardSparePart[];
  assignedItems: JobCardAssignedItem[];
  allMechanics: Mechanic[];
  assignedMechanicIds: number[];
  inspection: Inspection | null;
  oils: JobCardOil[];
  lubricants: Lubricant[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jobTypeId, setJobTypeId] = useState(String(jobCard.job_type_id ?? ""));
  const [serviceTypeId, setServiceTypeId] = useState(String(jobCard.service_type_id ?? ""));
  const [oilLubricantId, setOilLubricantId] = useState("");
  const [oilQuantity, setOilQuantity] = useState("");
  const [editOil, setEditOil] = useState<JobCardOil | null>(null);
  const [editOilQuantity, setEditOilQuantity] = useState("");

  const initialSpareState = useMemo(() => {
    const state: SparePartRowState = {};
    for (const part of spareParts) {
      const rowKey = getSparePartRowKey(part);
      const assigned = assignedItems.find(
        (item) =>
          item.item_name_id === part.item_name_id &&
          Number(item.is_common ?? 0) === Number(part.is_common)
      );
      state[rowKey] = {
        checked: Boolean(assigned),
        quantity: assigned ? String(assigned.item_quantity) : "",
        is_common: Number(part.is_common),
        item_name_id: Number(part.item_name_id),
      };
    }
    return state;
  }, [spareParts, assignedItems]);

  const [spareState, setSpareState] = useState<SparePartRowState>(initialSpareState);

  useEffect(() => {
    setSpareState(initialSpareState);
  }, [initialSpareState]);

  useEffect(() => {
    setServiceTypeId(String(jobCard.service_type_id ?? ""));
  }, [jobCard.service_type_id]);

  const isActive = jobCard.job_card_status === "Active";
  const isApproved = jobCard.job_card_status === "Approve";
  const isOutsideJob = Number(jobTypeId) === 2;
  const showInspectionFields = Number(serviceTypeId) === 5;
  const canEditSpareParts = !["Close", "Rejected"].includes(jobCard.job_card_status);

  const whatsappLink = useMemo(() => {
    if (!isApproved || !jobCard.officer_mobile) return null;
    const date = new Date(jobCard.created_on).toLocaleDateString("en-GB").replace(/\//g, "-");
    const message =
      `Hi  Sir/Madam,\n` +
      `Job card No : #${jobCard.it_no} has been opened on ${date}.\n` +
      `your vehicle number ${jobCard.registration_no}.\n` +
      `to carry out the ${jobCard.complaints ?? ""} repairs.\n\n` +
      `For any further queries contact MTO control number [${MTO_MOBILE}]. \n\n` +
      `-- MTO, Malkajgiri.\n`;
    return `https://wa.me/91${jobCard.officer_mobile}?text=${encodeURIComponent(message)}`;
  }, [isApproved, jobCard]);

  function submitForm(jobCardAction: string) {
    startTransition(async () => {
      const form = document.getElementById("job-card-form") as HTMLFormElement | null;
      if (!form) return;
      const fd = new FormData(form);
      fd.set("job_card_action", jobCardAction);
      const result = await assignSparePartItemAction(fd);
      toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
      if (result.refreshPage) router.refresh();
    });
  }

  function saveSpareParts() {
    const selectedRows = Object.entries(spareState).filter(([, row]) => row.checked);

    if (selectedRows.length === 0) {
      toast.error("Select at least one item to assign");
      return;
    }

    for (const [, row] of selectedRows) {
      const qty = Number(row.quantity);
      if (!qty || qty <= 0) {
        toast.error("Please enter valid quantity for all selected items");
        return;
      }
    }

    const items = selectedRows.map(([, row]) => ({
      item_id: row.item_name_id,
      quantity: Number(row.quantity),
      is_common: row.is_common,
    }));

    startTransition(async () => {
      const result = await assignJobCardItemsAction(jobCard.job_card_id, items);
      toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
      if (result.refreshPage) router.refresh();
    });
  }

  function clearSpareParts() {
    if (!confirm("Remove all assigned items from this job card?")) return;
    startTransition(async () => {
      const result = await assignJobCardItemsAction(jobCard.job_card_id, []);
      toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
      if (result.refreshPage) router.refresh();
    });
  }

  function addOil() {
    if (!oilLubricantId) {
      toast.error("Please select oil");
      return;
    }
    const qty = Number(oilQuantity);
    if (!qty || qty <= 0) {
      toast.error("Please enter valid quantity");
      return;
    }
    startTransition(async () => {
      const result = await addJobCardOilAction(jobCard.job_card_id, Number(oilLubricantId), qty);
      toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
      if (result.refreshPage) {
        setOilLubricantId("");
        setOilQuantity("");
        router.refresh();
      }
    });
  }

  function saveOilEdit() {
    if (!editOil) return;
    const qty = Number(editOilQuantity);
    if (!qty || qty <= 0) {
      toast.error("Please enter valid quantity");
      return;
    }
    startTransition(async () => {
      const result = await updateJobCardOilAction(
        editOil.job_card_oil_id,
        jobCard.job_card_id,
        qty
      );
      toast[result.statusCode === 200 ? "success" : "error"](result.statusMessage);
      if (result.refreshPage) {
        setEditOil(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <Link href="/job-cards">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Job Card</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="job-card-form" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <input type="hidden" name="job_card_id" value={jobCard.job_card_id} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vehicle Registration No*</Label>
                <Input name="registration_no" value={jobCard.registration_no ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>IT No*</Label>
                <Input name="it_no" value={jobCard.it_no ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Officer Name*</Label>
                <Input value={jobCard.officer_name ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Driver Name*</Label>
                <Input value={jobCard.driver_name ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Make Type*</Label>
                <Input value={jobCard.make_type ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Variant *</Label>
                <Input value={jobCard.variant_name ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Select Job Type</Label>
                <select
                  name="job_type_id"
                  value={jobTypeId}
                  onChange={(e) => setJobTypeId(e.target.value)}
                  disabled={!isActive && !isApproved}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select Job Type
                  </option>
                  {Object.entries(JOB_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Select Service Type</Label>
                <select
                  name="service_type_id"
                  value={serviceTypeId}
                  onChange={(e) => setServiceTypeId(e.target.value)}
                  disabled={!isActive && !isApproved}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:bg-muted"
                >
                  <option value="" disabled>
                    Select Service Type
                  </option>
                  {Object.entries(SERVICE_TYPES).map(([key, label]) => (
                    <option key={key} value={key} data-id={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {showInspectionFields && (
                <>
                  <div className="space-y-2 inspection_fields">
                    <Label>Inspected By</Label>
                    <Input value={inspection?.inspected_by ?? ""} readOnly />
                  </div>
                  <div className="space-y-2 inspection_fields">
                    <Label>Inspected On</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(inspection?.inspected_on)}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2 inspection_fields">
                    <Label>General Number</Label>
                    <Input value={inspection?.general_number ?? ""} readOnly />
                  </div>
                  <div className="space-y-2 inspection_fields md:col-span-2">
                    <Label>Comment</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                      value={inspection?.comment ?? ""}
                      readOnly
                      rows={3}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>KMR*</Label>
                <Input
                  name="kmr"
                  defaultValue={jobCard.kmr ?? ""}
                  readOnly={!isActive && !isApproved}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Mechanic</Label>
                <select
                  name="mechanic_id"
                  multiple
                  defaultValue={assignedMechanicIds.map(String)}
                  disabled={!isActive && !isApproved}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {allMechanics.map((mechanic) => (
                    <option key={mechanic.mechanic_id} value={mechanic.mechanic_id}>
                      {mechanic.mechanic_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date In *</Label>
                <Input
                  type="date"
                  name="date_in"
                  defaultValue={formatDateForInput(jobCard.date_time_in)}
                  readOnly={!isActive && !isApproved}
                />
              </div>
              <div className="space-y-2">
                <Label>Time In*</Label>
                <Input
                  type="time"
                  name="time_in"
                  defaultValue={formatTimeForInput(jobCard.time_in, jobCard.created_on)}
                  readOnly={!isActive && !isApproved}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InfoBlock title="Comments" content={jobCard.comments} />
              <InfoBlock title="Complaints Report" content={jobCard.complaints} />
              <InfoBlock title="Outside Parts" content={jobCard.outside_parts} />
            </div>

            <div className="space-y-2">
              <Label>
                Remarks*: (If the service is only for oil changes, please mention &quot;Lubes&quot; in
                the remarks section.)
              </Label>
              <textarea
                name="remarks"
                defaultValue={jobCard.remarks ?? ""}
                placeholder="Remarks"
                readOnly={!isActive && !isApproved}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {isOutsideJob && (isActive || isApproved) && (
              <div className="space-y-2">
                <Label>Outside Work Shop Name*</Label>
                <Input
                  name="outside_work_shop"
                  defaultValue={jobCard.outside_work_shop ?? ""}
                  placeholder="Outside Work Shop Name"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {isActive && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-green-600 text-green-700"
                    disabled={isPending}
                    onClick={() => submitForm("approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-destructive text-destructive"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm("Are you sure you want to reject this job card?")) return;
                      submitForm("reject");
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              {isApproved && (
                <>
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => submitForm("")}
                  >
                    Save
                  </Button>
                  {whatsappLink && (
                    <a href={whatsappLink} target="_blank" rel="noreferrer">
                      <Button type="button" variant="outline" className="border-green-600 text-green-700">
                        <MessageCircle className="h-4 w-4" /> Send Message
                      </Button>
                    </a>
                  )}
                  {isOutsideJob && (
                    <Link href={`/job-cards/${jobCard.job_card_id}/gate-pass`} target="_blank">
                      <Button type="button" variant="outline">
                        Gatepass
                      </Button>
                    </Link>
                  )}
                </>
              )}
              {!isActive && !isApproved && (
                <Badge variant="secondary">{jobCard.job_card_status}</Badge>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {spareParts.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Assign Items</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Select items, enter quantity, then click Assign Items (same as CI4 approve items).
              </p>
            </div>
            {canEditSpareParts && (
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSpareParts}
                  disabled={isPending}
                >
                  Clear All
                </Button>
                <Button size="sm" onClick={saveSpareParts} disabled={isPending}>
                  Assign Items
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left w-[10%]">S.No</th>
                  <th className="p-3 text-left w-[30%]">Name</th>
                  <th className="p-3 text-left w-[20%]">Quantity</th>
                  <th className="p-3 text-left w-[20%]">Available Quantity</th>
                  <th className="p-3 text-center w-[20%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {spareParts.map((part, index) => {
                  const rowKey = getSparePartRowKey(part);
                  const available = Number(part.available_quantity);
                  const row = spareState[rowKey] ?? {
                    checked: false,
                    quantity: "",
                    is_common: Number(part.is_common),
                    item_name_id: Number(part.item_name_id),
                  };
                  return (
                    <tr key={rowKey} className="border-b">
                      <td className="p-3 w-[10%]">{index + 1}</td>
                      <td className="p-3 w-[30%] whitespace-normal break-words">
                        {part.item_name}
                        {Number(part.is_common) === 1 ? " / Common Spare Part" : ""}
                      </td>
                      <td className="p-3 w-[20%]">
                        {available !== 0 ? (
                          <Input
                            type="number"
                            placeholder="Quantity"
                            value={row.quantity}
                            disabled={!canEditSpareParts}
                            onChange={(e) => {
                              const qty = e.target.value;
                              setSpareState((prev) => ({
                                ...prev,
                                [rowKey]: {
                                  ...row,
                                  quantity: qty,
                                  checked: qty !== "" ? true : row.checked,
                                },
                              }));
                            }}
                          />
                        ) : (
                          <span className="text-center block text-muted-foreground">
                            Item Not Available
                          </span>
                        )}
                      </td>
                      <td className="p-3 w-[20%]">{part.available_quantity}&nbsp;(Avbl Qty.)</td>
                      <td className="p-3 text-center w-[20%]">
                        {available !== 0 ? (
                          <input
                            type="checkbox"
                            className="h-5 w-5"
                            checked={row.checked}
                            disabled={!canEditSpareParts}
                            onChange={(e) =>
                              setSpareState((prev) => ({
                                ...prev,
                                [rowKey]: {
                                  ...row,
                                  checked: e.target.checked,
                                },
                              }))
                            }
                          />
                        ) : (
                          <span className="text-destructive">✕</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assign Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No spare parts available in inventory for this vehicle.
            </p>
          </CardContent>
        </Card>
      )}

      {assignedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left">S.No</th>
                    <th className="p-3 text-left">Item Name</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedItems.map((item, index) => (
                    <tr key={item.job_card_item_id} className="border-b">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{item.item_name ?? `Item #${item.item_name_id}`}</td>
                      <td className="p-3">
                        {Number(item.is_common) === 1 ? (
                          <Badge variant="secondary">Common</Badge>
                        ) : (
                          "Vehicle Specific"
                        )}
                      </td>
                      <td className="p-3">{item.item_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Oils</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {canEditSpareParts && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Select Oil</Label>
                <select
                  value={oilLubricantId}
                  onChange={(e) => setOilLubricantId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select Oil
                  </option>
                  {lubricants.map((lubricant) => (
                    <option key={lubricant.lubricant_id} value={lubricant.lubricant_id}>
                      {lubricant.lubricant_name}
                      {lubricant.lubricant_type_name ? ` (${lubricant.lubricant_type_name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quantity (L)*</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Quantity in Liters"
                  value={oilQuantity}
                  onChange={(e) => setOilQuantity(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="button" variant="outline" onClick={addOil} disabled={isPending}>
                  Add Oil
                </Button>
              </div>
            </div>
          )}

          {oils.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left">S.No</th>
                    <th className="p-3 text-left">Oil Name</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Grade</th>
                    <th className="p-3 text-left">Required Quantity (L)</th>
                    <th className="p-3 text-left">Available (L)</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {oils.map((oil, index) => {
                    const isOilApproved = String(oil.status).toLowerCase() === "approved";
                    const hasStock =
                      Number(oil.available_liters) >= Number(oil.required_quantity);
                    return (
                      <tr key={oil.job_card_oil_id} className="border-b">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{oil.lubricant_name}</td>
                        <td className="p-3">{oil.lubricant_type_name}</td>
                        <td className="p-3">{oil.lubricant_grade}</td>
                        <td className="p-3">{oil.required_quantity}</td>
                        <td className="p-3">{oil.available_liters}</td>
                        <td className="p-3">
                          {isOilApproved ? (
                            <Badge variant="success">Approved</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {!isOilApproved ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditOil(oil);
                                  setEditOilQuantity(String(oil.required_quantity));
                                }}
                              >
                                Edit
                              </Button>
                              {hasStock ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-green-600 text-green-700"
                                  disabled={isPending}
                                  onClick={() => {
                                    if (
                                      !confirm(
                                        `Do you want to approve this oil entry for Job Card: ${jobCard.it_no}?`
                                      )
                                    ) {
                                      return;
                                    }
                                    startTransition(async () => {
                                      const result = await approveJobCardOilAction(
                                        oil.job_card_oil_id,
                                        jobCard.job_card_id
                                      );
                                      toast[result.statusCode === 200 ? "success" : "error"](
                                        result.statusMessage
                                      );
                                      if (result.refreshPage) router.refresh();
                                    });
                                  }}
                                >
                                  Approve
                                </Button>
                              ) : (
                                <Badge variant="destructive" title={`Available: ${oil.available_liters}L, Required: ${oil.required_quantity}L`}>
                                  Low Stock
                                </Badge>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-destructive text-destructive"
                                disabled={isPending}
                                onClick={() => {
                                  if (!confirm("Are you sure you want to delete this oil?")) return;
                                  startTransition(async () => {
                                    const result = await deleteJobCardOilAction(
                                      oil.job_card_oil_id,
                                      jobCard.job_card_id
                                    );
                                    toast[result.statusCode === 200 ? "success" : "error"](
                                      result.statusMessage
                                    );
                                    if (result.refreshPage) router.refresh();
                                  });
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editOil)} onOpenChange={(open) => !open && setEditOil(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Oil Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Oil Name</Label>
              <Input value={editOil?.lubricant_name ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Quantity (L)*</Label>
              <Input
                type="number"
                step="0.01"
                value={editOilQuantity}
                onChange={(e) => setEditOilQuantity(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOil(null)}>
              Close
            </Button>
            <Button onClick={saveOilEdit} disabled={isPending}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
