import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, XCircle, CircleDashed, Search, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Verify Graduate" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ matric?: string }>;
}) {
  const params = await searchParams;
  const matric = params?.matric?.trim().toUpperCase() ?? "";

  const student = matric
    ? await prisma.student.findUnique({
        where: { matricNo: matric },
        include: {
          user: { select: { fullName: true } },
          faculty: { select: { name: true } },
          department: { select: { name: true } },
          records: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              items: {
                orderBy: { stageOrder: "asc" },
                select: {
                  id: true,
                  stageName: true,
                  stageOrder: true,
                  status: true,
                  actedAt: true,
                  officer: { include: { user: { select: { fullName: true } } } },
                },
              },
            },
          },
        },
      })
    : null;

  const record = student?.records[0] ?? null;
  const isCleared = record?.status === "COMPLETE";
  const approved = record?.items.filter((i) => i.status === "APPROVED").length ?? 0;
  const total = record?.items.length ?? 0;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* ── Header ── */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            ClearPath
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        {/* ── Title ── */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Graduate Verification
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Enter a student matriculation number to verify their clearance status.
          </p>
        </div>

        {/* ── Search form ── */}
        <form method="GET" action="/verify" className="mx-auto max-w-lg">
          <div className="flex gap-2">
            <input
              name="matric"
              defaultValue={matric}
              required
              className={cn(
                "flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm",
                "placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
                "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
              )}
              placeholder="e.g. CSC/2021/101"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              <Search className="h-4 w-4" />
              Verify
            </button>
          </div>
        </form>

        {/* ── Not found ── */}
        {matric && !student ? (
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">No record found</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              No student with matriculation number{" "}
              <span className="font-mono font-medium">{matric}</span> was found in the system.
            </p>
          </div>
        ) : null}

        {/* ── Results ── */}
        {student && record ? (
          <div className="mt-10 space-y-6">
            {/* Identity card */}
            <div
              className={cn(
                "rounded-2xl border p-6 shadow-sm",
                isCleared
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                      isCleared
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
                    )}
                  >
                    {isCleared ? (
                      <BadgeCheck className="h-6 w-6" />
                    ) : (
                      <ShieldCheck className="h-6 w-6" />
                    )}
                  </span>
                  <div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      {student.user.fullName}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {student.matricNo}
                      {student.department ? ` · ${student.department.name}` : ""}
                      {student.faculty ? ` · ${student.faculty.name}` : ""}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {student.program} · {student.level} Level
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset",
                      isCleared
                        ? "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800"
                        : "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800",
                    )}
                  >
                    {isCleared ? "Fully Cleared" : "In Progress"}
                  </span>
                  {isCleared && record.completedAt ? (
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Cleared on{" "}
                      {record.completedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {approved} of {total} stages approved
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stage breakdown */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Clearance stages
              </h2>
              <ul className="space-y-2">
                {record.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      {item.status === "APPROVED" ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : item.status === "REJECTED" ? (
                        <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                      ) : (
                        <CircleDashed className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                      )}
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.stageName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.status === "APPROVED" && item.actedAt ? (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {item.actedAt.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                          item.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800"
                            : item.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800"
                              : "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
                        )}
                      >
                        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              This record is provided for verification purposes only. Issued by ClearPath on{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              .
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
