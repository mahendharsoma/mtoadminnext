"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/jwt";
import { vehicleRepository } from "@/lib/db/repositories/vehicle.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse } from "@/lib/constants";

// Make Type Actions
export async function createMakeTypeAction(formData: FormData) {
  const session = await requireSession();
  const name = formData.get("make_type_name") as string;
  if (!name?.trim()) return failureResponse("Name is required");

  try {
    await vehicleRepository.createMakeType({
      make_type_name: name.trim(),
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicle-make-type");
    return successResponse(undefined, "Make type created", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateMakeTypeAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("make_type_id"));
  const name = formData.get("make_type_name") as string;
  if (!id || !name?.trim()) return failureResponse("Invalid data");

  try {
    await vehicleRepository.updateMakeType(id, {
      make_type_name: name.trim(),
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicle-make-type");
    return successResponse(undefined, "Updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function deleteMakeTypeAction(id: number) {
  await requireSession();
  try {
    await vehicleRepository.deleteMakeType(id);
    revalidatePath("/vehicle-make-type");
    return successResponse(undefined, "Deleted", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

// Variant Actions
export async function createVariantAction(formData: FormData) {
  const session = await requireSession();
  const makeTypeId = Number(formData.get("make_type_id"));
  const name = formData.get("variant_name") as string;
  if (!makeTypeId || !name?.trim()) return failureResponse("Invalid data");

  try {
    await vehicleRepository.createVariant({
      make_type_id: makeTypeId,
      variant_name: name.trim(),
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicle-variant");
    return successResponse(undefined, "Variant created", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateVariantAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("variant_id"));
  const makeTypeId = Number(formData.get("make_type_id"));
  const name = formData.get("variant_name") as string;
  if (!id) return failureResponse("Invalid ID");

  try {
    await vehicleRepository.updateVariant(id, {
      make_type_id: makeTypeId,
      variant_name: name.trim(),
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicle-variant");
    return successResponse(undefined, "Updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function deleteVariantAction(id: number) {
  await requireSession();
  try {
    await vehicleRepository.deleteVariant(id);
    revalidatePath("/vehicle-variant");
    return successResponse(undefined, "Deleted", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function getVariantsByMakeTypeAction(makeTypeId: number) {
  await requireSession();
  const variants = await vehicleRepository.getVariantsByMakeType(makeTypeId);
  return successResponse(variants);
}

// Vehicle Actions
const vehicleSchema = z.object({
  registration_no: z.string().min(1),
  make_type_id: z.coerce.number(),
  variant_id: z.coerce.number(),
  ps_id: z.coerce.number(),
  model_year: z.string().min(1, "Vehicle model year is required"),
  engine_no: z.string().optional(),
  chassis_no: z.string().optional(),
});

export async function createVehicleAction(formData: FormData) {
  const session = await requireSession();
  const parsed = vehicleSchema.safeParse({
    registration_no: formData.get("registration_no"),
    make_type_id: formData.get("make_type_id"),
    variant_id: formData.get("variant_id"),
    ps_id: formData.get("ps_id"),
    model_year: formData.get("vehicle_model_year") || formData.get("model_year"),
    engine_no: formData.get("engine_no") || "",
    chassis_no: formData.get("chassis_no") || "",
  });

  if (!parsed.success) return failureResponse(parsed.error.issues[0]?.message ?? "Invalid data");

  const data = parsed.data;
  if (await vehicleRepository.registrationExists(data.registration_no)) {
    return failureResponse("Registration number already exists");
  }

  try {
    await vehicleRepository.createVehicle({
      ...data,
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicles");
    return successResponse(undefined, "Vehicle created", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateVehicleAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("vehicle_id"));
  if (!id) return failureResponse("Invalid ID");

  const parsed = vehicleSchema.safeParse({
    registration_no: formData.get("registration_no"),
    make_type_id: formData.get("make_type_id"),
    variant_id: formData.get("variant_id"),
    ps_id: formData.get("ps_id"),
    model_year: formData.get("vehicle_model_year") || formData.get("model_year"),
    engine_no: formData.get("engine_no") || "",
    chassis_no: formData.get("chassis_no") || "",
  });

  if (!parsed.success) return failureResponse(parsed.error.issues[0]?.message ?? "Invalid data");

  const data = parsed.data;
  if (await vehicleRepository.registrationExists(data.registration_no, id)) {
    return failureResponse("Registration number already exists");
  }

  try {
    await vehicleRepository.updateVehicle(id, {
      ...data,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/vehicles");
    return successResponse(undefined, "Vehicle updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function deleteVehicleAction(id: number) {
  await requireSession();
  try {
    await vehicleRepository.deleteVehicle(id);
    revalidatePath("/vehicles");
    return successResponse(undefined, "Deleted", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

const vehicleFuelSchema = z.object({
  vehicle_id: z.coerce.number(),
  filling_date: z.string().min(1),
  previous_reading: z.coerce.number().min(0),
  current_reading: z.coerce.number().min(0),
  liters: z.string().min(1),
});

/** Normalize DB/form dates to YYYY-MM-DD for reliable comparison. */
function toDateOnly(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function computeMileage(previousReading: number, currentReading: number, liters: string): string {
  const litersNum = Number(liters);
  const distance = currentReading - previousReading;
  if (!litersNum || litersNum <= 0 || distance <= 0) return "0.00";
  return (distance / litersNum).toFixed(2);
}

export async function createVehicleFuelAction(formData: FormData) {
  const session = await requireSession();
  const parsed = vehicleFuelSchema.safeParse({
    vehicle_id: formData.get("vehicle_id"),
    filling_date: formData.get("filling_date"),
    previous_reading: formData.get("previous_reading"),
    current_reading: formData.get("current_reading"),
    liters: formData.get("liters"),
  });

  if (!parsed.success) {
    return failureResponse(parsed.error.issues[0]?.message ?? "Invalid data");
  }

  const data = parsed.data;
  const fillingDate = toDateOnly(data.filling_date);
  if (!fillingDate) {
    return failureResponse("Invalid filling date");
  }

  // Always verify against the latest fuel record for this vehicle (not only form field)
  const lastFuel = await vehicleRepository.getLastVehicleFuelByVehicleId(data.vehicle_id);
  const lastFillingDate = toDateOnly(lastFuel?.filling_date);

  // Previous meter: 0 for first fill, else last record's current reading
  const previousReading = lastFuel
    ? Number(lastFuel.current_reading ?? 0)
    : 0;

  if (lastFillingDate && fillingDate < lastFillingDate) {
    return failureResponse(
      `Filling date must be greater than or equal to the last fuel filled date (${lastFillingDate})`
    );
  }

  if (Number(data.liters) <= 0) {
    return failureResponse("Liters must be greater than zero");
  }

  if (data.current_reading <= previousReading) {
    return failureResponse("Current Reading Must be greater than Previous Reading");
  }

  const mileage = computeMileage(previousReading, data.current_reading, data.liters);

  try {
    await vehicleRepository.createVehicleFuel({
      vehicle_id: data.vehicle_id,
      filling_date: fillingDate,
      previous_reading: previousReading,
      current_reading: data.current_reading,
      liters: data.liters,
      mileage,
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath(`/vehicles/${data.vehicle_id}/fuel`);
    return successResponse(undefined, "Successfully  Vehicle Fuel Added!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Add Vehicle Fuel, Please Try again later");
  }
}

export async function updateVehicleFuelAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("vehicle_fuel_id"));
  const vehicleId = Number(formData.get("vehicle_id"));
  if (!id || !vehicleId) return failureResponse("Invalid ID");

  const existing = await vehicleRepository.getVehicleFuelById(id);
  if (!existing) {
    return failureResponse("Unable to get Vehicle Details, please try later");
  }

  const parsed = vehicleFuelSchema.safeParse({
    vehicle_id: vehicleId,
    filling_date: formData.get("filling_date"),
    previous_reading: existing.previous_reading ?? 0,
    current_reading: formData.get("current_reading"),
    liters: formData.get("liters"),
  });

  if (!parsed.success) {
    return failureResponse(parsed.error.issues[0]?.message ?? "Invalid data");
  }

  const data = parsed.data;
  const fillingDate = toDateOnly(data.filling_date);
  if (!fillingDate) {
    return failureResponse("Invalid filling date");
  }

  // When updating, date must be >= previous record's filling date (if any)
  const previousFuel = await vehicleRepository.getPreviousVehicleFuelRecord(
    existing.vehicle_id,
    id
  );
  const previousFillingDate = toDateOnly(previousFuel?.filling_date);
  if (previousFillingDate && fillingDate < previousFillingDate) {
    return failureResponse(
      `Filling date must be greater than or equal to the last fuel filled date (${previousFillingDate})`
    );
  }

  // And must not be after the next record's filling date (if any)
  const nextFuel = await vehicleRepository.getNextVehicleFuelRecord(existing.vehicle_id, id);
  const nextFillingDate = toDateOnly(nextFuel?.filling_date);
  if (nextFillingDate && fillingDate > nextFillingDate) {
    return failureResponse(
      `Filling date must be less than or equal to the next fuel filled date (${nextFillingDate})`
    );
  }

  if (Number(data.liters) <= 0) {
    return failureResponse("Liters must be greater than zero");
  }

  if (data.current_reading <= data.previous_reading) {
    return failureResponse("Current Reading Must be greater than Previous Reading");
  }

  if (data.current_reading !== Number(existing.current_reading)) {
    const hasLaterRecord = await vehicleRepository.hasGreaterVehicleFuelRecord(
      existing.vehicle_id,
      id
    );
    if (hasLaterRecord) {
      return failureResponse("you can not update current reading  meter  this have next record");
    }
  }

  const mileage = computeMileage(data.previous_reading, data.current_reading, data.liters);

  try {
    await vehicleRepository.updateVehicleFuel(id, {
      filling_date: fillingDate,
      previous_reading: data.previous_reading,
      current_reading: data.current_reading,
      liters: data.liters,
      mileage,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath(`/vehicles/${vehicleId}/fuel`);
    return successResponse(undefined, "Successfully Update Vehicle Fuel!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Vehicle, Please Try again later");
  }
}

export async function deleteVehicleFuelAction(id: number, vehicleId: number) {
  await requireSession();

  const existing = await vehicleRepository.getVehicleFuelById(id);
  if (!existing) {
    return failureResponse("Unable to get Vehicle Details, please try later");
  }

  const hasLaterRecord = await vehicleRepository.hasGreaterVehicleFuelRecord(
    existing.vehicle_id,
    id
  );
  if (hasLaterRecord) {
    return failureResponse("you can not delete  this have next record");
  }

  try {
    await vehicleRepository.deleteVehicleFuel(id);
    revalidatePath(`/vehicles/${vehicleId}/fuel`);
    return successResponse(undefined, "Deleted Successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to delete, please try again");
  }
}
