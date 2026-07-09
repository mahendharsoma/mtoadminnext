"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/jwt";
import {
  inspectionRepository,
  lubricantRepository,
} from "@/lib/db/repositories/inspection.repository";
import { jobCardRepository } from "@/lib/db/repositories/job-card.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse } from "@/lib/constants";

// Inspection
export async function createVehicleTypeAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("vehicle_type_name") || "").trim();
  if (!name) return failureResponse("Vehicle Type Name is required");
  try {
    await inspectionRepository.createVehicleType({
      vehicle_type_name: name,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicle-types");
    return successResponse(undefined, "Successfully Added Vehicle Type!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Add Vehicle type info, Please Try again later");
  }
}

export async function updateVehicleTypeAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("vehicle_type_id"));
  const name = String(formData.get("vehicle_type_name") || "").trim();
  if (!id) return failureResponse("Invalid ID");
  if (!name) return failureResponse("Vehicle Type Name is required");
  try {
    await inspectionRepository.updateVehicleType(id, {
      vehicle_type_name: name,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicle-types");
    return successResponse(undefined, "Successfully updated", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Details");
  }
}

export async function deleteVehicleTypeAction(id: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await inspectionRepository.deleteVehicleType(id);
    revalidatePath("/vehicle-types");
    return successResponse(undefined, "Deleted Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to delete, please try again");
  }
}

export async function createInspectionTitleAction(formData: FormData) {
  const session = await requireSession();
  const vehicleTypeId = Number(formData.get("vehicle_type_id"));
  const title = String(formData.get("inspection_title") || "").trim();
  if (!vehicleTypeId) return failureResponse("Vehicle Type is required");
  if (!title) return failureResponse("Inspection Title is required");
  try {
    await inspectionRepository.createInspectionTitle({
      vehicle_type_id: vehicleTypeId,
      inspection_title: title,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/inspection-titles", "layout");
    return successResponse(undefined, "Inspection Title Added Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to add inspection title");
  }
}

export async function updateInspectionTitleAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("inspection_title_id"));
  const title = String(formData.get("inspection_title") || "").trim();
  if (!id) return failureResponse("Invalid ID");
  if (!title) return failureResponse("Inspection Title is required");
  try {
    await inspectionRepository.updateInspectionTitle(id, {
      inspection_title: title,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/inspection-titles", "layout");
    return successResponse(undefined, "Updated Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to update");
  }
}

export async function deleteInspectionTitleAction(id: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await inspectionRepository.deleteInspectionTitle(id);
    revalidatePath("/inspection-titles", "layout");
    return successResponse(undefined, "Deleted Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to delete");
  }
}

// Lubricants
export async function createLubricantTypeAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("lubricant_type_name") || "").trim();
  if (!name) return failureResponse("Lubricant Type Name is required");
  if (await lubricantRepository.typeExists(name)) {
    return failureResponse("Unable to Add Lubricant Type, This Lubricant Type already existed!");
  }
  try {
    await lubricantRepository.createType({
      lubricant_type_name: name,
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Added Lubricant Type!", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateLubricantTypeAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("lubricant_type_id"));
  const name = String(formData.get("lubricant_type_name") || "").trim();
  if (!id) return failureResponse("Invalid ID");
  if (!name) return failureResponse("Lubricant Type Name is required");
  if (await lubricantRepository.typeExists(name, id)) {
    return failureResponse("Unable to Update Lubricant Type, This Lubricant Type already existed!");
  }

  try {
    await lubricantRepository.updateType(id, {
      lubricant_type_name: name,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Updated Lubricant Type!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Lubricant Type, Please Try again later");
  }
}

export async function deleteLubricantTypeAction(id: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await lubricantRepository.deleteType(id);
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Deleted Lubricant Type", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Delete Lubricant Type, please try later");
  }
}

export async function createLubricantGradeAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("lubricant_grade_name") || "").trim();
  if (!name) return failureResponse("Lubricant Grade is required");
  if (await lubricantRepository.gradeExists(name)) {
    return failureResponse("Unable to Add Lubricant Grade, This Lubricant Grade already existed!");
  }
  try {
    await lubricantRepository.createGrade({
      lubricant_grade_name: name,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Added Lubricant Grade!", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateLubricantGradeAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("lubricant_grade_id"));
  const name = String(formData.get("lubricant_grade_name") || "").trim();
  if (!id) return failureResponse("Invalid ID");
  if (!name) return failureResponse("Lubricant Grade is required");
  if (await lubricantRepository.gradeExists(name, id)) {
    return failureResponse("Unable to Update Lubricant Grade, This Lubricant Grade already existed!");
  }
  try {
    await lubricantRepository.updateGrade(id, {
      lubricant_grade: name,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Updated Lubricant Grade!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Lubricant Grade, Please Try again later");
  }
}

export async function deleteLubricantGradeAction(id: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await lubricantRepository.deleteGrade(id);
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Deleted Lubricant Grade", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Delete Lubricant Grade, please try later");
  }
}

export async function createLubricantAction(formData: FormData) {
  const session = await requireSession();
  const lubricantName = String(formData.get("lubricant_name") || "").trim();
  const lubricantTypeId = Number(formData.get("lubricant_type_id"));
  const lubricantGradeId = Number(formData.get("lubricant_grade_id"));
  if (!lubricantName || !lubricantTypeId || !lubricantGradeId) {
    return failureResponse("Lubricant name, type and grade are required");
  }
  if (await lubricantRepository.lubricantNameExists(lubricantName)) {
    return failureResponse("Unable to Add Lubricant, This Lubricant Name already existed!");
  }
  try {
    await lubricantRepository.createLubricant({
      lubricant_type_id: lubricantTypeId,
      lubricant_grade_id: lubricantGradeId,
      lubricant_name: lubricantName,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Added Lubricant!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Add Lubricant, Please Try again later");
  }
}

export async function updateLubricantAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("lubricant_id"));
  const lubricantName = String(formData.get("lubricant_name") || "").trim();
  const lubricantTypeId = Number(formData.get("lubricant_type_id"));
  const lubricantGradeId = Number(formData.get("lubricant_grade_id"));
  if (!id) return failureResponse("Invalid ID");
  if (!lubricantName || !lubricantTypeId || !lubricantGradeId) {
    return failureResponse("Lubricant name, type and grade are required");
  }
  if (await lubricantRepository.lubricantNameExists(lubricantName, id)) {
    return failureResponse("Unable to Update Lubricant, This Lubricant Name already existed!");
  }

  try {
    await lubricantRepository.updateLubricant(id, {
      lubricant_name: lubricantName,
      lubricant_type_id: lubricantTypeId,
      lubricant_grade_id: lubricantGradeId,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Updated Lubricant!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Lubricant, Please Try again later");
  }
}

export async function deleteLubricantAction(id: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await lubricantRepository.deleteLubricant(id);
    revalidatePath("/lubricants");
    return successResponse(undefined, "Successfully Deleted Lubricant", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Delete Lubricant, please try later");
  }
}

// Lubricant Receive Voucher
export async function createLubricantReceiveVoucherAction(formData: FormData) {
  const session = await requireSession();
  const noteFileNo = String(formData.get("note_file_no") || "").trim();
  const voucherNo = String(formData.get("voucher_no") || "").trim();
  const voucherDate = String(formData.get("voucher_date") || "").trim();
  const vendorName = String(formData.get("vendor_name") || "").trim();
  if (!noteFileNo || !voucherNo || !voucherDate) {
    return failureResponse("Note File No, Voucher No and Voucher Date are required");
  }
  if (await lubricantRepository.voucherNoExists(voucherNo)) {
    return failureResponse("This Voucher No already exists!");
  }
  try {
    const id = await lubricantRepository.createLubricantVoucher({
      note_file_no: noteFileNo,
      voucher_no: voucherNo,
      voucher_date: voucherDate,
      vendor_name: vendorName,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricant-receive-voucher");
    return successResponse({ voucherId: id }, "Successfully Created Lubricant Receive Voucher!", {
      refreshPage: true,
    });
  } catch {
    return failureResponse("Unable to Create Voucher, Please try again later");
  }
}

export async function updateLubricantReceiveVoucherAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("lubricant_receive_voucher_id"));
  const noteFileNo = String(formData.get("note_file_no") || "").trim();
  const voucherNo = String(formData.get("voucher_no") || "").trim();
  const voucherDate = String(formData.get("voucher_date") || "").trim();
  const vendorName = String(formData.get("vendor_name") || "").trim();
  if (!id) return failureResponse("Invalid ID");
  if (!noteFileNo || !voucherNo || !voucherDate) {
    return failureResponse("Note File No, Voucher No and Voucher Date are required");
  }
  if (await lubricantRepository.voucherNoExists(voucherNo, id)) {
    return failureResponse("This Voucher No already exists!");
  }
  try {
    await lubricantRepository.updateLubricantVoucher(id, {
      note_file_no: noteFileNo,
      voucher_no: voucherNo,
      voucher_date: voucherDate,
      vendor_name: vendorName,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/lubricant-receive-voucher");
    return successResponse(undefined, "Successfully Updated Voucher!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Voucher, Please try again later");
  }
}

export async function deleteLubricantReceiveVoucherAction(id: number) {
  const session = await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await lubricantRepository.deleteVoucher(id, session.userId, getCurrentDateTimeForDb());
    revalidatePath("/lubricant-receive-voucher");
    return successResponse(
      undefined,
      "Successfully Deleted Voucher and reversed inventory",
      { refreshPage: true }
    );
  } catch {
    return failureResponse("Unable to Delete Voucher, please try later");
  }
}

export async function addLubricantReceiveVoucherItemsAction(formData: FormData) {
  const session = await requireSession();
  const voucherId = Number(formData.get("voucher_id"));
  if (!voucherId) return failureResponse("Invalid Voucher ID, please try again");

  const itemsRaw = String(formData.get("items_json") || "[]");
  let items: Array<Record<string, unknown>> = [];
  try {
    items = JSON.parse(itemsRaw) as Array<Record<string, unknown>>;
  } catch {
    return failureResponse("Invalid items payload");
  }
  if (!items.length) return failureResponse("No items found, please add at least one item");

  try {
    await lubricantRepository.insertVoucherItems(
      voucherId,
      items,
      session.userId,
      getCurrentDateTimeForDb()
    );
    revalidatePath(`/lubricant-receive-voucher/${voucherId}/items`);
    return successResponse(
      undefined,
      "Successfully Saved Items and Updated Inventory!",
      { refreshPage: true }
    );
  } catch {
    return failureResponse("Unable to Save Items, Please try again later");
  }
}

export async function receivePartialLubricantQuantityAction(formData: FormData) {
  const session = await requireSession();
  const parentReceiveItemId = Number(formData.get("parent_receive_item_id"));
  const voucherId = Number(formData.get("voucher_id"));
  const receiveQuantity = Number(formData.get("receive_quantity"));
  const litersPerContainer = Number(formData.get("liters_per_container"));
  if (!parentReceiveItemId) return failureResponse("Invalid Item ID, please try again");

  try {
    const result = await lubricantRepository.receivePartialQuantity({
      parentReceiveItemId,
      receiveQuantity,
      litersPerContainer,
      userId: session.userId,
      now: getCurrentDateTimeForDb(),
    });
    if (result === "invalid_quantity") {
      return failureResponse("Receive quantity must be greater than zero");
    }
    if (result === "invalid_container_capacity") {
      return failureResponse("Liters per container must be greater than zero");
    }
    if (result === "not_parent_item") {
      return failureResponse("Selected item is not a valid parent item");
    }
    if (result === "exceeds_ordered_quantity") {
      return failureResponse("Receive quantity exceeds remaining ordered quantity");
    }
    if (voucherId) {
      revalidatePath(`/lubricant-receive-voucher/${voucherId}/items`);
    }
    revalidatePath("/lubricant-receive-voucher");
    revalidatePath("/lubricant-inventory");
    return successResponse(
      undefined,
      "Successfully received quantity, generated containers, and updated inventory!",
      { refreshPage: true }
    );
  } catch {
    return failureResponse("Unable to receive quantity, please try later");
  }
}

export async function deleteLubricantReceiveVoucherItemAction(receiveItemId: number, voucherId: number) {
  const session = await requireSession();
  if (!receiveItemId || !voucherId) return failureResponse("Invalid item request");
  try {
    await lubricantRepository.deleteVoucherItem(receiveItemId, session.userId, getCurrentDateTimeForDb());
    revalidatePath(`/lubricant-receive-voucher/${voucherId}/items`);
    revalidatePath("/lubricant-receive-voucher");
    return successResponse(undefined, "Successfully Deleted Item and reversed inventory", {
      refreshPage: true,
    });
  } catch {
    return failureResponse("Unable to Delete Item, please try later");
  }
}

// Job Card
export async function updateJobCardAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("job_card_id"));
  if (!id) return failureResponse("Invalid ID");

  try {
    await jobCardRepository.updateJobCard(id, {
      job_type: formData.get("job_type") ? Number(formData.get("job_type")) : null,
      service_type: formData.get("service_type") ? Number(formData.get("service_type")) : null,
      kmr: formData.get("kmr"),
      date_time_in: formData.get("date_time_in"),
      job_card_status: formData.get("job_card_status"),
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath(`/job-cards/${id}`);
    revalidatePath("/job-cards");
    return successResponse(undefined, "Job card updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function approveJobCardAction(jobCardId: number) {
  const session = await requireSession();
  try {
    await jobCardRepository.updateJobCard(jobCardId, {
      job_card_status: "Approve",
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath(`/job-cards/${jobCardId}`);
    revalidatePath("/job-cards");
    return successResponse(undefined, "Job card approved", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function closeJobCardAction(jobCardId: number) {
  const session = await requireSession();
  try {
    await jobCardRepository.updateJobCard(jobCardId, {
      job_card_status: "Close",
      date_time_out: getCurrentDateTimeForDb(),
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath(`/job-cards/${jobCardId}`);
    revalidatePath("/job-cards");
    return successResponse(undefined, "Job card closed", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function rejectJobCardAction(jobCardId: number) {
  const session = await requireSession();
  try {
    await jobCardRepository.updateJobCard(jobCardId, {
      job_card_status: "Rejected",
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath(`/job-cards/${jobCardId}`);
    revalidatePath("/job-cards");
    return successResponse(undefined, "Job card rejected", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}
