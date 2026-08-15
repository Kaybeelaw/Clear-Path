import { CLEARANCE_STAGES } from "./stages";
import { prisma } from "./db";

export async function createClearanceRecord(studentId: string): Promise<void> {
  await prisma.clearanceRecord.create({
    data: {
      studentId,
      items: {
        create: CLEARANCE_STAGES.map((stage, index) => ({
          stageCode: stage.code,
          stageName: stage.name,
          stageOrder: index + 1,
        })),
      },
    },
  });
}

export async function isRecordComplete(recordId: string): Promise<boolean> {
  const record = await prisma.clearanceRecord.findUnique({
    where: { id: recordId },
    include: { items: { select: { status: true } } },
  });
  if (!record) return false;
  return record.items.length > 0 && record.items.every((item) => item.status === "APPROVED");
}

export async function markRecordCompleteIfDone(recordId: string): Promise<void> {
  const record = await prisma.clearanceRecord.findUnique({ where: { id: recordId } });
  if (!record || record.status === "COMPLETE") return;
  if (await isRecordComplete(recordId)) {
    await prisma.clearanceRecord.update({
      where: { id: recordId },
      data: { status: "COMPLETE", completedAt: new Date() },
    });
  }
}
