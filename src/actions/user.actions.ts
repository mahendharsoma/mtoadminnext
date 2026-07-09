"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/jwt";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse } from "@/lib/constants";

const userSchema = z.object({
  user_name: z.string().min(1, "Name is required"),
  email_id: z.string().email("Invalid email"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  role_id: z.coerce.number().min(1),
  password: z.string().optional(),
});

function generateRandomPassword(length = 8): string {
  const alphabet = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return password;
}

export async function createUserAction(formData: FormData) {
  const session = await requireSession();
  const parsed = userSchema.safeParse({
    user_name: formData.get("user_name"),
    email_id: formData.get("email_id"),
    phone: formData.get("phone"),
    role_id: formData.get("role_id"),
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return failureResponse(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const { user_name, email_id, phone, role_id, password } = parsed.data;
  const finalPassword = password?.trim() ? password : generateRandomPassword();

  if (await userRepository.emailExists(email_id)) {
    return failureResponse("Email already exists");
  }

  try {
    await userRepository.createUser(
      {
        user_name,
        email_id,
        password: finalPassword,
        phone,
        created_by: session.userId,
        created_on: getCurrentDateTimeForDb(),
      },
      role_id
    );
    revalidatePath("/users");
    return successResponse(
      undefined,
      `User created successfully. Temporary password: ${finalPassword}`,
      { refreshPage: true }
    );
  } catch {
    return failureResponse();
  }
}

export async function updateUserAction(formData: FormData) {
  const session = await requireSession();
  const userId = Number(formData.get("user_id"));
  if (!userId) return failureResponse("Invalid user ID");

  const parsed = userSchema.safeParse({
    user_name: formData.get("user_name"),
    email_id: formData.get("email_id"),
    phone: formData.get("phone"),
    role_id: formData.get("role_id"),
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return failureResponse(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const { user_name, email_id, phone, role_id, password } = parsed.data;

  if (await userRepository.emailExists(email_id, userId)) {
    return failureResponse("Email already exists");
  }

  try {
    const updateData: Record<string, unknown> = {
      user_name,
      email_id,
      phone,
      updated_by: session.userId,
      updated_on: getCurrentDateTimeForDb(),
    };
    if (password) updateData.password = password;

    await userRepository.updateUser(userId, updateData, role_id);
    revalidatePath("/users");
    return successResponse(undefined, "User updated successfully", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function toggleUserStatusAction(userId: number, status: string) {
  const session = await requireSession();
  try {
    await userRepository.updateStatus(
      userId,
      status,
      session.userId,
      getCurrentDateTimeForDb()
    );
    revalidatePath("/users");
    return successResponse(undefined, `User ${status === "Active" ? "activated" : "deactivated"}`, {
      refreshPage: true,
    });
  } catch {
    return failureResponse();
  }
}

export async function deleteUserAction(userId: number) {
  await requireSession();
  try {
    await userRepository.deleteUser(userId);
    revalidatePath("/users");
    return successResponse(undefined, "User deleted", { refreshPage: true });
  } catch {
    return failureResponse();
  }
}

export async function getUserForEditAction(userId: number) {
  await requireSession();
  const user = await userRepository.findById(userId);
  if (!user) return failureResponse("User not found");
  return successResponse(user);
}
