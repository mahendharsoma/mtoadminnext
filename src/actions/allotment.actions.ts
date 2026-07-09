"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/jwt";
import { allotmentRepository } from "@/lib/db/repositories/allotment.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse } from "@/lib/constants";

function revalidateAllotmentPaths(psId?: number, vehicleId?: number) {
  revalidatePath("/officer-vehicle-allotment");
  if (psId && vehicleId) {
    revalidatePath(`/officer-vehicle-allotment/drivers?ps_id=${psId}&vehicle_id=${vehicleId}`);
  }
}

export async function createVehicleAllotmentAction(formData: FormData) {
  const session = await requireSession();
  const officerId = Number(formData.get("officer_id"));
  const vehicleId = Number(formData.get("vehicle_id"));
  const fromDate = String(formData.get("from_date") || "").trim();
  const psId = Number(formData.get("ps_id") || 0);

  if (!officerId || !vehicleId || !fromDate) {
    return failureResponse("Select Officer and Allocated Date are required");
  }

  try {
    await allotmentRepository.insertVehicleAllotment({
      officer_id: officerId,
      vehicle_id: vehicleId,
      from_date: fromDate,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidateAllotmentPaths(psId || undefined, vehicleId);
    return successResponse(undefined, "Successfully Vehicle Allocated!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Allocate Vehicle, Please Try again later");
  }
}

export async function reassignOfficerAllotmentAction(formData: FormData) {
  const session = await requireSession();
  const mappingId = Number(formData.get("officer_vehicle_mapping_id"));
  const officerId = Number(formData.get("officer_id"));
  const fromDate = String(formData.get("from_date") || "").trim();
  const psId = Number(formData.get("ps_id") || 0);
  const vehicleId = Number(formData.get("vehicle_id") || 0);

  if (!mappingId || !officerId || !fromDate) {
    return failureResponse("Unable to Update officer Details");
  }

  try {
    await allotmentRepository.updateOfficerVehicleMapping(mappingId, {
      officer_id: officerId,
      from_date: fromDate,
      to_date: null,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidateAllotmentPaths(psId || undefined, vehicleId || undefined);
    return successResponse(undefined, "Successfully updated officer", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update officer Details");
  }
}

export async function createDriverAllotmentAction(formData: FormData) {
  const session = await requireSession();
  const driverId = Number(formData.get("driver_id"));
  const vehicleId = Number(formData.get("vehicle_id"));
  const fromDate = String(formData.get("from_date") || "").trim();
  const psId = Number(formData.get("ps_id") || 0);

  if (!driverId || !vehicleId || !fromDate) {
    return failureResponse("Driver Officer and Allocated Date are required");
  }

  try {
    const existing = await allotmentRepository.driverCheckVehicleAllotment(driverId);
    if (existing && Number(existing.vehicle_id) !== vehicleId) {
      const officerDetails = await allotmentRepository.officerDetailsByVehicleId(
        Number(existing.vehicle_id)
      );
      if (officerDetails) {
        return failureResponse(
          `This Driver is under the ${officerDetails.officer_name} (${officerDetails.registration_no}) Please Remove there and Allocate Here`
        );
      }
    }

    await allotmentRepository.insertDriverAllotment({
      driver_id: driverId,
      vehicle_id: vehicleId,
      from_date: fromDate,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidateAllotmentPaths(psId || undefined, vehicleId);
    return successResponse(undefined, "Successfully Driver Allocated!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Allocate Driver, Please Try again later");
  }
}

export async function reassignDriverAllotmentAction(formData: FormData) {
  const session = await requireSession();
  const mappingId = Number(formData.get("driver_vehicle_mapping_id"));
  const driverId = Number(formData.get("driver_id"));
  const fromDate = String(formData.get("from_date") || "").trim();
  const psId = Number(formData.get("ps_id") || 0);
  const vehicleId = Number(formData.get("vehicle_id") || 0);

  if (!mappingId || !driverId || !fromDate) {
    return failureResponse("Unable to Update Driver Details");
  }

  try {
    await allotmentRepository.updateDriverVehicleMapping(mappingId, {
      driver_id: driverId,
      from_date: fromDate,
      to_date: null,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidateAllotmentPaths(psId || undefined, vehicleId || undefined);
    return successResponse(undefined, "Successfully updated Driver", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Driver Details");
  }
}

export async function deleteDriverVehicleMapAction(id: number, psId?: number, vehicleId?: number) {
  await requireSession();
  if (!id) return failureResponse("Invalid ID");
  try {
    await allotmentRepository.deleteDriverVehicleMapping(id);
    revalidateAllotmentPaths(psId, vehicleId);
    return successResponse(undefined, "Remove Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Remove, please try again");
  }
}
