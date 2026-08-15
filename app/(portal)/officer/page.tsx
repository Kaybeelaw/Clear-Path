import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inbox, History } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { StageStatusBadge } from "@/components/status-badge";
import { DecideItem } from "@/components/decide-item";

export const metadata: Metadata = { title: "My desk" };

export default async function OfficerPage() {
  const session = await requireRole("OFFICER");

  const officer = await prisma.officer.findUnique({ where: { userId: session.userId } });
  if (!officer) redirect("/dashboard");

  const items = await prisma.clearanceItem.findMany({
    where: { stageCode: officer.stageCode },
    orderBy: { createdAt: "desc" },
    include: {
      record: { include: { student: { include: { user: { select: { fullName: true } } } } } },
      documents: { orderBy: { createdAt: "asc" } },
    },
  });

  const pending = items.filter((item) => item.status === "PENDING");
  const decided = items.filter((item) => item.status !== "PENDING");

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {officer.stageName} desk
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Review and decide on clearance items submitted to your office.
      </p>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Pending decisions</h2>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-zinc-500 dark:text-zinc-400">
              No pending items. You are all caught up.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.record.student.user.fullName}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {item.record.student.matricNo} · {item.record.student.department} ·{" "}
                      {item.record.student.program}
                    </p>
                  </div>
                  <StageStatusBadge status={item.status} />
                </div>

                <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Evidence ({item.documents.length})
                  </p>
                  {item.documents.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {item.documents.map((doc) => (
                        <li key={doc.id}>
                          <a
                            href={`/api/documents/${doc.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {doc.originalName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      No documents uploaded yet — approval is blocked until the student attaches evidence.
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <DecideItem itemId={item.id} hasDocuments={item.documents.length > 0} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 ? (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recently decided</h2>
          </div>
          <ul className="space-y-2">
            {decided.slice(0, 15).map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {item.record.student.user.fullName}{" "}
                    <span className="font-normal text-zinc-500 dark:text-zinc-400">
                      ({item.record.student.matricNo})
                    </span>
                  </p>
                  {item.comment ? (
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.comment}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <StageStatusBadge status={item.status} />
                  {item.actedAt ? (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {item.actedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
