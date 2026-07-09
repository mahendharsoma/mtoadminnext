"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { createToken, setAuthCookie, clearAuthCookie } from "@/lib/auth/jwt";
import { failureResponse, successResponse } from "@/lib/constants";

const loginSchema = z.object({
  user_email: z.string().email("Invalid email address"),
  user_password: z.string().min(1, "Password is required"),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    user_email: formData.get("user_email"),
    user_password: formData.get("user_password"),
  });

  if (!parsed.success) {
    return failureResponse(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const { user_email, user_password } = parsed.data;

  try {
    const user = await userRepository.findByEmail(user_email);

    if (!user) {
      return failureResponse("Email does not exist");
    }

    if (!userRepository.isAllowedRole(user.role_name)) {
      return failureResponse("You are Unauthorized to login");
    }

    // Support both plaintext (legacy CI4) and bcrypt hashed passwords
    const passwordMatch =
      user.password === user_password ||
      (user.password.startsWith("$2") &&
        (await import("bcryptjs")).default.compare(user_password, user.password));

    if (!passwordMatch) {
      return failureResponse("Password is not correct");
    }

    const token = await createToken({
      userId: user.user_id,
      userName: user.user_name,
      userEmail: user.email_id,
      userPhone: user.phone,
      userRole: user.role_name ?? "Admin",
    });

    await setAuthCookie(token);
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Login error:", error);
    return failureResponse("Error! System Encountered an Error, Please try again");
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/login");
}
