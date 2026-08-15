import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { deleteStoredFile, storedFilePath } from "@/lib/storage";

export const runtime = "nodejs";

async function getSessionUser() {
  const token = (await cookies()).get("clearance_session")?.value;
  return token ? verifySessionToken(token) : null;
}

async function canAccess(documentId: string, session: { userId: string; role: "STUDENT" | "OFFICER" | "ADMIN" }) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { item: { select: { stageCode: true } } },
  });
  if (!document) return { document: null, allowed: false };

  if (session.role === "ADMIN") return { document, allowed: true };

  if (session.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: session.userId } });
    if (student && student.id === document.studentId) return { document, allowed: true };
    return { document, allowed: false };
  }

  const officer = await prisma.officer.findUnique({ where: { userId: session.userId } });
  if (officer && officer.stageCode === document.item.stageCode) return { document, allowed: true };
  return { document, allowed: false };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const { id } = await params;
  const { document, allowed } = await canAccess(id, session);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "You are not allowed to view this document." }, { status: 403 });

  try {
    const data = await readFile(storedFilePath(document.storedName));
    const disposition = `inline; filename*=UTF-8''${encodeURIComponent(document.originalName)}`;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(document.sizeBytes),
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "The stored file could not be read." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  if (session.role !== "STUDENT") return NextResponse.json({ error: "Only students can delete their uploads." }, { status: 403 });

  const { id } = await params;
  const { document, allowed } = await canAccess(id, session);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "You are not allowed to delete this document." }, { status: 403 });

  const item = await prisma.clearanceItem.findUnique({ where: { id: document.itemId } });
  if (item && item.status === "APPROVED") {
    return NextResponse.json({ error: "This stage has already been approved and its documents are locked." }, { status: 409 });
  }

  await prisma.document.delete({ where: { id: document.id } });
  await deleteStoredFile(document.storedName);
  return NextResponse.json({ ok: true });
}
