"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import {
  createOfficerSchema,
  createStageSchema,
  createFacultySchema,
  createDepartmentSchema,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

export type AdminFormState = { error?: string; success?: boolean };

// ─── Officer ─────────────────────────────────────────────────────────────────

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

  // Resolve stage name from DB
  const stage = await prisma.stage.findUnique({ where: { code: stageCode } });
  if (!stage) return { error: "The selected clearance stage does not exist." };

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "OFFICER",
      officer: {
        create: {
          stageCode,
          stageName: stage.name,
          departmentId: departmentId ?? null,
        },
      },
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

// ─── Stage ────────────────────────────────────────────────────────────────────

export async function createStageAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("ADMIN");

  const parsed = createStageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const { name, code, description, order } = parsed.data;

  const existing = await prisma.stage.findUnique({ where: { code } });
  if (existing) return { error: `A stage with code "${code}" already exists.` };

  await prisma.stage.create({
    data: { name, code, description: description ?? null, order, isActive: true },
  });

  revalidatePath("/admin");
  return { success: true };
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export async function createFacultyAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("ADMIN");

  const parsed = createFacultySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const { name, code } = parsed.data;

  const existing = await prisma.faculty.findUnique({ where: { name } });
  if (existing) return { error: "A faculty with this name already exists." };

  await prisma.faculty.create({
    data: { name, code: code ?? null },
  });

  revalidatePath("/admin");
  return { success: true };
}

// ─── Department ───────────────────────────────────────────────────────────────

export async function createDepartmentAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("ADMIN");

  const parsed = createDepartmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const { name, facultyId, code } = parsed.data;

  const existing = await prisma.department.findUnique({ where: { name } });
  if (existing) return { error: "A department with this name already exists." };

  const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
  if (!faculty) return { error: "The selected faculty does not exist." };

  await prisma.department.create({
    data: { name, facultyId, code: code ?? null },
  });

  revalidatePath("/admin");
  return { success: true };
}
