import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { saveImage, validateImageFile } from "@/lib/storage";

export const runtime = "nodejs";

const bodySchema = z.object({
  itemId: z.string().cuid("Invalid clearance item"),
});

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("clearance_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  if (session.role !== "STUDENT") return NextResponse.json({ error: "Only students can upload documents." }, { status: 403 });

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return NextResponse.json({ error: "Student profile not found." }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse({ itemId: formData.get("itemId") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400 });
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const item = await prisma.clearanceItem.findUnique({
    where: { id: parsed.data.itemId },
    include: { record: { select: { studentId: true } } },
  });
  if (!item || item.record.studentId !== student.id) {
    return NextResponse.json({ error: "This clearance item does not belong to you." }, { status: 403 });
  }
  if (item.status !== "PENDING" && item.status !== "REJECTED") {
    return NextResponse.json({ error: "This stage has already been approved and can no longer accept uploads." }, { status: 409 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const storedName = await saveImage(bytes, file.type);

  const document = await prisma.document.create({
    data: {
      itemId: item.id,
      studentId: student.id,
      originalName: file.name.slice(0, 255),
      storedName,
      mimeType: file.type,
      sizeBytes: bytes.length,
    },
    select: { id: true, originalName: true, sizeBytes: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, document }, { status: 201 });
}
