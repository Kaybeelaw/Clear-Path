"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { approveItemSchema, rejectItemSchema, resubmitItemSchema } from "@/lib/validation";
import { markRecordCompleteIfDone } from "@/lib/clearance";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: boolean };

async function getOfficerForSession(userId: string) {
  return prisma.officer.findUnique({ where: { userId } });
}

/** Check whether an officer is allowed to act on a given clearance item.
 *  - Stage must match the officer's stage.
 *  - For department-stage officers, the student's department must also match. */
async function officerCanActOnItem(
  officerStageCode: string,
  officerDepartmentId: string | null,
  itemId: string,
): Promise<{ allowed: boolean; error?: string }> {
  const item = await prisma.clearanceItem.findUnique({
    where: { id: itemId },
    include: {
      record: { include: { student: { select: { departmentId: true } } } },
      _count: { select: { documents: true } },
    },
  });

  if (!item) return { allowed: false, error: "Clearance item not found." };
  if (item.stageCode !== officerStageCode) return { allowed: false, error: "This item is not assigned to your office." };

  // For department-stage officers, enforce department scoping
  if (officerStageCode === "department" && officerDepartmentId) {
    if (item.record.student.departmentId !== officerDepartmentId) {
      return { allowed: false, error: "This item is not assigned to your office." };
    }
  }

  return { allowed: true };
}

export async function approveItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("OFFICER");
  const parsed = approveItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const officer = await getOfficerForSession(session.userId);
  if (!officer) return { error: "Officer profile not found." };

  const { allowed, error } = await officerCanActOnItem(
    officer.stageCode,
    officer.departmentId,
    parsed.data.itemId,
  );
  if (!allowed) return { error };

  const item = await prisma.clearanceItem.findUnique({
    where: { id: parsed.data.itemId },
    include: { _count: { select: { documents: true } } },
  });
  if (!item) return { error: "Clearance item not found." };
  if (item.status !== "PENDING") return { error: "This item has already been decided." };
  if (item._count.documents === 0) {
    return { error: "No supporting document has been uploaded for this stage yet. Please wait for the student to attach evidence." };
  }

  await prisma.clearanceItem.update({
    where: { id: item.id },
    data: { status: "APPROVED", officerId: officer.id, actedAt: new Date(), comment: null },
  });

  await markRecordCompleteIfDone(item.recordId);
  revalidatePath("/officer");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("OFFICER");
  const parsed = rejectItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const officer = await getOfficerForSession(session.userId);
  if (!officer) return { error: "Officer profile not found." };

  const { allowed, error } = await officerCanActOnItem(
    officer.stageCode,
    officer.departmentId,
    parsed.data.itemId,
  );
  if (!allowed) return { error };

  const item = await prisma.clearanceItem.findUnique({ where: { id: parsed.data.itemId } });
  if (!item) return { error: "Clearance item not found." };
  if (item.status !== "PENDING") return { error: "This item has already been decided." };

  await prisma.clearanceItem.update({
    where: { id: item.id },
    data: {
      status: "REJECTED",
      officerId: officer.id,
      actedAt: new Date(),
      comment: parsed.data.comment,
    },
  });

  revalidatePath("/officer");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function resubmitItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("STUDENT");
  const parsed = resubmitItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return { error: "Student profile not found." };

  const item = await prisma.clearanceItem.findUnique({
    where: { id: parsed.data.itemId },
    include: {
      record: { select: { studentId: true } },
      documents: { select: { createdAt: true } },
    },
  });
  if (!item || item.record.studentId !== student.id) {
    return { error: "This clearance item does not belong to you." };
  }
  if (item.status !== "REJECTED") {
    return { error: "Only rejected stages can be resubmitted." };
  }
  const hasNewEvidence = item.documents.some((doc) =>
    item.actedAt ? doc.createdAt > item.actedAt : true,
  );
  if (!hasNewEvidence) {
    return { error: "Please upload a corrected document after the rejection before resubmitting." };
  }

  await prisma.clearanceItem.update({
    where: { id: item.id },
    data: { status: "PENDING", officerId: null, comment: null, actedAt: null },
  });

  await prisma.clearanceRecord.update({
    where: { id: item.recordId },
    data: { status: "IN_PROGRESS", completedAt: null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/officer");
  return { success: true };
}
