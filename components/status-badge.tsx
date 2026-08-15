import { cn } from "@/lib/cn";

const STAGE_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 ring-rose-200",
};

const RECORD_STYLES: Record<string, string> = {
  IN_PROGRESS: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  COMPLETE: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StageStatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge className={STAGE_STYLES[status]}>{label}</Badge>;
}

export function RecordStatusBadge({ status }: { status: "IN_PROGRESS" | "COMPLETE" }) {
  const label = status === "COMPLETE" ? "Complete" : "In Progress";
  return <Badge className={RECORD_STYLES[status]}>{label}</Badge>;
}
