"use client";

import { useActionState } from "react";
import { approveItemAction, rejectItemAction } from "@/app/actions/clearance";
import { ErrorBanner, inputClass } from "./ui";
import { cn } from "@/lib/cn";

export function DecideItem({ itemId, hasDocuments }: { itemId: string; hasDocuments?: boolean }) {
  const [approveState, approveAction, approving] = useActionState(approveItemAction, {});
  const [rejectState, rejectAction, rejecting] = useActionState(rejectItemAction, {});
  const approveDisabled = approving || !hasDocuments;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <form action={approveAction}>
          <input type="hidden" name="itemId" value={itemId} />
          <button
            type="submit"
            disabled={approveDisabled}
            title={!hasDocuments ? "Waiting for the student to upload supporting evidence" : undefined}
            className={cn(
              "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm",
              "transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {approving ? "Approving…" : "Approve"}
          </button>
        </form>

        <form action={rejectAction} className="flex flex-1 flex-col gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <div className="flex items-center gap-2">
            <input
              name="comment"
              type="text"
              required
              maxLength={500}
              placeholder="Reason for rejection (required)…"
              className={cn(inputClass, "flex-1")}
            />
            <button
              type="submit"
              disabled={rejecting}
              className={cn(
                "rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700",
                "transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60",
                "dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40",
              )}
            >
              {rejecting ? "Rejecting…" : "Reject"}
            </button>
          </div>
          <ErrorBanner message={rejectState.error} />
        </form>
      </div>
      <ErrorBanner message={approveState.error} />
    </div>
  );
}
