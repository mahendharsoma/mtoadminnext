"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/jwt";
import { psRepository } from "@/lib/db/repositories/ps.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse } from "@/lib/constants";

function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.trim());
}

function validatePsForm(formData: FormData): { ok: true; data: Record<string, string> } | { ok: false; message: string } {
  const psName = String(formData.get("ps_name") || "").trim();
  const psPhone = String(formData.get("ps_phone") || "").trim();
  const address = String(formData.get("address") || "").trim();

  if (!psName) return { ok: false, message: "PS Name is required" };
  if (!psPhone) return { ok: false, message: "Mobile Number is required" };
  if (!isValidPhone(psPhone)) return { ok: false, message: "Mobile Number must be exactly 10 digits" };
  if (!address) return { ok: false, message: "Address is required" };

  return { ok: true, data: { psName, psPhone, address } };
}

export async function createPsAction(formData: FormData) {
  const session = await requireSession();
  const validated = validatePsForm(formData);
  if (!validated.ok) return failureResponse(validated.message);

  try {
    await psRepository.createPs({
      ps_name: validated.data.psName,
      ps_phone: validated.data.psPhone,
      address: validated.data.address,
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/ps");
    return successResponse(undefined, "Successfully Add Police Station!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Add Ps, Please Try again later");
  }
}

export async function updatePsAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("ps_id"));
  if (!id) return failureResponse("Invalid ID");

  const validated = validatePsForm(formData);
  if (!validated.ok) return failureResponse(validated.message);

  try {
    await psRepository.updatePs(id, {
      ps_name: validated.data.psName,
      ps_phone: validated.data.psPhone,
      address: validated.data.address,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/ps");
    return successResponse(undefined, "Successfully updated PS", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update PS Details");
  }
}

export async function updatePsStatusAction(id: number, status: string) {
  const session = await requireSession();
  if (!id) return failureResponse("Invalid ID");
  if (status !== "Active" && status !== "Inactive") return failureResponse("Invalid status");

  try {
    await psRepository.updatePs(id, {
      status,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/ps");
    return successResponse(undefined, "Ps status Updated Successfully!", { refreshPage: true });
  } catch {
    return failureResponse("unable to update");
  }
}

export async function deletePsAction(id: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await psRepository.deletePs(id);
    revalidatePath("/ps");
    return successResponse(undefined, "Deleted Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to delete PS, please try again");
  }
}

export async function createOfficerAction(formData: FormData) {
  const session = await requireSession();
  const officerName = String(formData.get("officer_name") || "").trim();
  const officerMobile = String(formData.get("officer_mobile") || "").trim();
  const employeeId = String(formData.get("officer_rank") || "").trim();

  if (!officerName) return failureResponse("Officer Name is required");
  if (!officerMobile) return failureResponse("Mobile Number is required");
  if (!/^\d{10}$/.test(officerMobile)) {
    return failureResponse("Mobile Number must be exactly 10 digits");
  }
  if (!employeeId) return failureResponse("Employee Id is required");
  if (await psRepository.employeeIdExists(employeeId)) {
    return failureResponse("Unable to Add Officer, This Rank or General Number already existed!");
  }

  try {
    await psRepository.createOfficer({
      officer_name: officerName,
      officer_mobile: officerMobile,
      officer_rank: employeeId,
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/officers");
    return successResponse(undefined, "Added Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Something went wrong, please try again later");
  }
}

export async function updateOfficerAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("officer_id"));
  const officerName = String(formData.get("officer_name") || "").trim();
  const officerMobile = String(formData.get("officer_mobile") || "").trim();
  const employeeId = String(formData.get("officer_rank") || "").trim();

  if (!id) return failureResponse("Invalid ID");
  if (!officerName) return failureResponse("Officer Name is required");
  if (!officerMobile) return failureResponse("Mobile Number is required");
  if (!/^\d{10}$/.test(officerMobile)) {
    return failureResponse("Mobile Number must be exactly 10 digits");
  }
  if (!employeeId) return failureResponse("Employee Id is required");
  if (await psRepository.employeeIdExists(employeeId, id)) {
    return failureResponse("Unable to Update Officer Details, This Rank or General Number already existed!");
  }

  try {
    await psRepository.updateOfficer(id, {
      officer_name: officerName,
      officer_mobile: officerMobile,
      officer_rank: employeeId,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/officers");
    return successResponse(undefined, "Successfully Officer Updated!", { refreshPage: true });
  } catch {
    return failureResponse("unable to update Officer Details, please try again");
  }
}

export async function updateOfficerStatusAction(id: number, status: string) {
  const session = await requireSession();
  if (!id) return failureResponse("Invalid ID");
  if (status !== "Active" && status !== "Inactive") return failureResponse("Invalid status");

  try {
    await psRepository.updateOfficer(id, {
      status,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/officers");
    return successResponse(undefined, "Officer status Updated Successfully!", { refreshPage: true });
  } catch {
    return failureResponse("unable to update");
  }
}

export async function deleteOfficerAction(id: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await psRepository.deleteOfficer(id);
    revalidatePath("/officers");
    return successResponse(undefined, "Deleted Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to delete, please try again");
  }
}
