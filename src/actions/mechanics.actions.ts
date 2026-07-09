"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/jwt";
import { mechanicsRepository } from "@/lib/db/repositories/mechanics.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse } from "@/lib/constants";

const mechanicSchema = z.object({
  mechanic_name: z.string().trim().min(1, "Mechanic name is required"),
  general_number: z.string().trim().min(1, "General number is required"),
  mechanic_phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
});

export async function createMechanicAction(formData: FormData) {
  const session = await requireSession();
  const parsed = mechanicSchema.safeParse({
    mechanic_name: formData.get("mechanic_name"),
    general_number: formData.get("general_number"),
    mechanic_phone: formData.get("mechanic_phone"),
  });

  if (!parsed.success) {
    return failureResponse(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const data = parsed.data;
  if (await mechanicsRepository.generalNumberExists(data.general_number)) {
    return failureResponse("General number already exists");
  }

  try {
    await mechanicsRepository.insert({
      ...data,
      status: "Active",
      created_by: session.userId,
      created_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/mechanics");
    return successResponse(undefined, "Mechanic created", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function updateMechanicAction(formData: FormData) {
  const session = await requireSession();
  const id = Number(formData.get("mechanic_id"));
  if (!id) return failureResponse("Invalid ID");

  const parsed = mechanicSchema.safeParse({
    mechanic_name: formData.get("mechanic_name"),
    general_number: formData.get("general_number"),
    mechanic_phone: formData.get("mechanic_phone"),
  });

  if (!parsed.success) {
    return failureResponse(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const data = parsed.data;
  if (await mechanicsRepository.generalNumberExists(data.general_number, id)) {
    return failureResponse("General number already exists");
  }

  try {
    await mechanicsRepository.update(id, {
      ...data,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    });
    revalidatePath("/mechanics");
    return successResponse(undefined, "Mechanic updated", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function deleteMechanicAction(id: number) {
  await requireSession();
  try {
    await mechanicsRepository.delete(id);
    revalidatePath("/mechanics");
    return successResponse(undefined, "Mechanic deleted", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function getMechanicForEditAction(id: number) {
  await requireSession();
  const mechanic = await mechanicsRepository.findById(id);
  if (!mechanic) return failureResponse("Not found");
  return successResponse(mechanic);
}
