"use server";

import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";
import { homeForRole } from "@/lib/session";
import { sendPasswordResetEmail } from "@/lib/email";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password, fullName, matricNo, faculty, departmentId, program, level } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Try logging in." };
  }

  const existingMatric = await prisma.student.findUnique({ where: { matricNo } });
  if (existingMatric) {
    return { error: "This matriculation number is already registered." };
  }

  const passwordHash = await hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: "STUDENT",
          student: {
                create: { matricNo, faculty, departmentId, program, level },
          },
        },
        include: { student: true },
      });
      if (!user.student) throw new Error("Failed to create student profile");

      await tx.clearanceRecord.create({
        data: {
          studentId: user.student.id,
          items: {
            create: [
              { stageCode: "department", stageName: "Department", stageOrder: 1 },
              { stageCode: "library", stageName: "Library", stageOrder: 2 },
              { stageCode: "bursary", stageName: "Bursary / Finance", stageOrder: 3 },
              { stageCode: "hostel", stageName: "Hostel", stageOrder: 4 },
              { stageCode: "sports", stageName: "Sports", stageOrder: 5 },
              { stageCode: "security", stageName: "Security", stageOrder: 6 },
              { stageCode: "ict", stageName: "ICT", stageOrder: 7 },
            ],
          },
        },
      });

      const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
      (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
    });
  } catch {
    return { error: "Something went wrong while creating your account. Please try again." };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const passwordMatches = await compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Invalid email or password." };
  }

  const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(homeForRole(user.role));
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

// Request a password reset: creates a short-lived token and emails it to the user.
export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Please provide your email address." };

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid user enumeration.
  if (!user) return { message: "If an account exists for that email, a reset link has been sent." };

  try {
    const token = await createPasswordResetToken(user.id, user.email);
    await sendPasswordResetEmail(user.email, token);
    return { message: "If an account exists for that email, a reset link has been sent." };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return { message: "If an account exists for that email, a reset link has been sent." };
  }
}

// Perform the reset: verify token and set new password; then sign in the user.
export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("password") ?? "").trim();

  if (!token) return { error: "Invalid or missing token." };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };

  const verified = await verifyPasswordResetToken(token);
  if (!verified) return { error: "Invalid or expired token." };

  const user = await prisma.user.findUnique({ where: { id: verified.userId } });
  if (!user) return { error: "User not found." };

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Auto-login after reset
  const sessionToken = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
  (await cookies()).set(SESSION_COOKIE, sessionToken, sessionCookieOptions);

  redirect(homeForRole(user.role));
}
