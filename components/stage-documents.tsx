"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, RotateCcw, Trash2, Upload } from "lucide-react";
import { resubmitItemAction } from "@/app/actions/clearance";
import { ErrorBanner } from "./ui";
import { cn } from "@/lib/cn";

type Doc = { id: string; originalName: string; sizeBytes: number };
type StageStatus = "PENDING" | "APPROVED" | "REJECTED";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StageDocuments({
  itemId,
  status,
  documents,
  canResubmit,
}: {
  itemId: string;
  status: StageStatus;
  documents: Doc[];
  canResubmit: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resubmitState, resubmitAction, resubmitting] = useActionState(resubmitItemAction, {});

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      setError("Only PNG and JPEG images are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Images must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("itemId", itemId);
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? "Upload failed. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? "Could not delete the document.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete the document. Please try again.");
    }
  }

  const canAdd = status === "PENDING" || status === "REJECTED";
  const canDelete = status === "PENDING" || status === "REJECTED";

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Supporting documents ({documents.length})
        </p>
        {canAdd ? (
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500",
              uploading && "cursor-wait opacity-60",
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                handleFile(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>

      {documents.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <ImageIcon className="h-4 w-4 shrink-0 text-indigo-500" />
                <a
                  href={`/api/documents/${doc.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title={doc.originalName}
                  className="truncate text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {doc.originalName}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-zinc-400">{formatSize(doc.sizeBytes)}</span>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    title="Delete document"
                    className="rounded p-1 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : status === "PENDING" ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Upload a supporting image before this office can approve your stage.
        </p>
      ) : status === "REJECTED" ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Upload the corrected evidence, then resubmit for review.
        </p>
      ) : null}

      {error ? (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      ) : null}

      {status === "REJECTED" ? (
        <form action={resubmitAction} className="mt-3">
          <input type="hidden" name="itemId" value={itemId} />
          <button
            type="submit"
            disabled={resubmitting || !canResubmit}
            title={canResubmit ? undefined : "Upload a corrected document first"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-700",
              "transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60",
              "dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40",
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resubmitting ? "Resubmitting…" : "Resubmit for review"}
          </button>
          <div className="mt-2">
            <ErrorBanner message={resubmitState.error} />
          </div>
        </form>
      ) : null}
    </div>
  );
}
