import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, CircleDashed, ShieldCheck, Search } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/cn";
import { RecordStatusBadge, StageStatusBadge } from "@/components/status-badge";
import { StageDocuments } from "@/components/stage-documents";

export const metadata: Metadata = { title: "My clearance" };

export default async function DashboardPage() {
  const session = await requireRole("STUDENT");

  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: {
      user: { select: { fullName: true } },
      records: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          items: {
            orderBy: { stageOrder: "asc" },
            include: {
              officer: { include: { user: { select: { fullName: true } } } },
              documents: { orderBy: { createdAt: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!student) redirect("/register");

  const record = student.records[0];
  const approved = record?.items.filter((item) => item.status === "APPROVED").length ?? 0;
  const total = record?.items.length ?? 0;
  const percent = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, <span className="font-semibold text-zinc-700 dark:text-zinc-200">{student.user.fullName}</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Clearance progress
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {student.matricNo} · {student.program} · {student.department}
          </p>
        </div>
        <RecordStatusBadge status={record?.status ?? "IN_PROGRESS"} />
      </div>

      {!record ? (
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            No clearance record was found. Please contact the administration office.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">Overall progress</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {approved} of {total} stages
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  percent === 100 ? "bg-emerald-500" : "bg-indigo-500",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Started {record.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {record.status === "COMPLETE" && record.completedAt
                ? ` · Cleared on ${record.completedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                : ""}
            </p>
          </div>

          {record.status === "COMPLETE" ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Congratulations — you are fully cleared!
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Your status can now be verified by institutions.
                  </p>
                </div>
              </div>
              <Link
                href={`/verify?matric=${encodeURIComponent(student.matricNo)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
              >
                <Search className="h-4 w-4" />
                Preview verification
              </Link>
            </div>
          ) : null}

          <ul className="mt-8 space-y-3">
            {record.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {item.status === "APPROVED" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                ) : item.status === "REJECTED" ? (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                ) : (
                  <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                )}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.stageName}
                    </h3>
                    <StageStatusBadge status={item.status} />
                  </div>

                  {item.comment ? (
                    <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      {item.comment}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.officer ? (
                      <>
                        Signed by <span className="font-medium">{item.officer.user.fullName}</span>
                      </>
                    ) : (
                      "Awaiting the responsible office"
                    )}
                    {item.actedAt
                      ? ` · ${item.actedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                      : ""}
                  </p>

                  <StageDocuments
                    itemId={item.id}
                    status={item.status}
                    documents={item.documents}
                    canResubmit={(() => {
                      const rejectedAt = item.actedAt;
                      return rejectedAt
                        ? item.documents.some((d) => d.createdAt > rejectedAt)
                        : item.documents.length > 0;
                    })()}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
