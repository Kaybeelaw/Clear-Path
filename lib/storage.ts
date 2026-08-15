import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

export const IMAGE_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function uploadsDir(): string {
  return join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
}

export async function ensureUploadsDir(): Promise<string> {
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export function extensionForMime(mimeType: string): string | null {
  return IMAGE_MIME_TYPES[mimeType] ?? null;
}

export function storedFilePath(storedName: string): string {
  return join(uploadsDir(), storedName);
}

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!extensionForMime(file.type)) {
    return "Only PNG and JPEG images are accepted.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  if (file.size === 0) {
    return "The selected file is empty.";
  }
  return null;
}

export async function saveImage(buffer: Uint8Array, mimeType: string): Promise<string> {
  const dir = await ensureUploadsDir();
  const extension = extensionForMime(mimeType) ?? ".bin";
  const storedName = `${randomUUID()}${extension}`;
  await writeFile(join(dir, storedName), buffer);
  return storedName;
}

export async function deleteStoredFile(storedName: string): Promise<void> {
  const path = storedFilePath(storedName);
  if (existsSync(path)) {
    await unlink(path);
  }
}

export async function writeSeedImage(storedName: string, buffer: Uint8Array): Promise<void> {
  const dir = await ensureUploadsDir();
  await writeFile(join(dir, storedName), buffer);
}
