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

  const { email, password, fullName, stageCode, department } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { error: "An account with this email already exists." };

  // Validate uniqueness: for department stage, uniqueness is per-department; for other stages, department must be null and stage unique
  if (stageCode === "department") {
    if (!department) return { error: "Department is required for department-stage officers." };
    const existingOfficer = await prisma.officer.findFirst({ where: { stageCode, department } });
    if (existingOfficer) return { error: "An officer for this department already exists." };
  } else {
    const existingOfficer = await prisma.officer.findFirst({ where: { stageCode, department: null } });
    if (existingOfficer) return { error: "This stage already has an assigned officer." };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "OFFICER",
      officer: {
        create: { stageCode, stageName: STAGE_BY_CODE[stageCode].name, department: department ?? null },
      },
    },
  });

  revalidatePath("/admin");
  return { success: true };
}
