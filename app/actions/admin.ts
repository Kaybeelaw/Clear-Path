"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { createOfficerSchema } from "@/lib/validation";
import { STAGE_BY_CODE } from "@/lib/stages";
import { revalidatePath } from "next/cache";

export type AdminFormState = { error?: string; success?: boolean };

export async function createOfficerAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("ADMIN");

  const parsed = createOfficerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const { email, password, fullName, stageCode, departmentId } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { error: "An account with this email already exists." };

  // Department-stage officers must be linked to a specific department
  if (stageCode === "department" && !departmentId) {
    return { error: "Department is required for department-stage officers." };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "OFFICER",
      officer: {
        create: { stageCode, stageName: STAGE_BY_CODE[stageCode].name, departmentId: departmentId ?? null },
      },
    },
  });

  revalidatePath("/admin");
  return { success: true };
}
