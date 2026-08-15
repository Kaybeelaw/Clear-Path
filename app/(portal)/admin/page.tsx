import type { Metadata } from "next";
import { Users, Inbox, BadgeCheck, UserPlus, ShieldCheck, BookOpen, Building2, Layers } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { RecordStatusBadge } from "@/components/status-badge";
import { CreateOfficerForm } from "@/components/create-officer-form";
import { CreateStageForm } from "@/components/create-stage-form";
import { CreateFacultyForm } from "@/components/create-faculty-form";
import { CreateDepartmentForm } from "@/components/create-department-form";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage() {
  await requireRole("ADMIN");

  const [totalStudents, inProgress, complete, records, officers, stages, faculties, departments] =
    await Promise.all([
      prisma.student.count(),
      prisma.clearanceRecord.count({ where: { status: "IN_PROGRESS" } }),
      prisma.clearanceRecord.count({ where: { status: "COMPLETE" } }),
      prisma.clearanceRecord.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          student: {
            include: {
              user: { select: { fullName: true } },
              department: { select: { name: true } },
            },
          },
          items: { select: { status: true } },
        },
      }),
      prisma.officer.findMany({
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { stageName: "asc" },
      }),
      prisma.stage.findMany({ orderBy: { order: "asc" } }),
      prisma.faculty.findMany({ orderBy: { name: "asc" } }),
      prisma.department.findMany({
        orderBy: { name: "asc" },
        include: { faculty: { select: { name: true } } },
      }),
    ]);

  const availableStages = stages.map((s) => ({ code: s.code, name: s.name }));
  const availableDepartments = departments.map((d) => ({ id: d.id, name: d.name }));
  const availableFaculties = faculties.map((f) => ({ id: f.id, name: f.name }));

  const stats = [
    { label: "Registered students", value: totalStudents, icon: Users },
    { label: "Clearance in progress", value: inProgress, icon: Inbox },
    { label: "Fully cleared", value: complete, icon: BadgeCheck },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Administration
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Overview of the institutional clearance process.
      </p>

      {/* ── Stats ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <stat.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Clearance records ── */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Clearance records
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Matric No.</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Level</th>
                <th className="px-5 py-3 font-semibold">Progress</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {records.map((record) => {
                const approved = record.items.filter((item) => item.status === "APPROVED").length;
                return (
                  <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {record.student.user.fullName}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                      {record.student.matricNo}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                      {record.student.department?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                      {record.student.level}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                      {approved} / {record.items.length}
                    </td>
                    <td className="px-5 py-3">
                      <RecordStatusBadge status={record.status} />
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 dark:text-zinc-400">
                    No clearance records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Officer management ── */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Create officer account
            </h2>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CreateOfficerForm
              availableStages={availableStages}
              availableDepartments={availableDepartments}
            />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Clearance officers
            </h2>
          </div>
          <ul className="space-y-2">
            {officers.map((officer) => (
              <li
                key={officer.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {officer.user.fullName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{officer.user.email}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-300">{officer.stageName}</span>
              </li>
            ))}
            {officers.length === 0 ? (
              <li className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No officers created yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* ── Stage management ── */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Create clearance stage
            </h2>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CreateStageForm />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Clearance stages
            </h2>
          </div>
          <ul className="space-y-2">
            {stages.map((stage) => (
              <li
                key={stage.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {stage.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    code: {stage.code} · order: {stage.order}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    stage.isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {stage.isActive ? "Active" : "Inactive"}
                </span>
              </li>
            ))}
            {stages.length === 0 ? (
              <li className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No stages configured yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* ── Faculty management ── */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Create faculty
            </h2>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CreateFacultyForm />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Faculties</h2>
          </div>
          <ul className="space-y-2">
            {faculties.map((faculty) => (
              <li
                key={faculty.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {faculty.name}
                </p>
                {faculty.code ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{faculty.code}</span>
                ) : null}
              </li>
            ))}
            {faculties.length === 0 ? (
              <li className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No faculties created yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* ── Department management ── */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Create department
            </h2>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CreateDepartmentForm faculties={availableFaculties} />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Departments</h2>
          </div>
          <ul className="space-y-2">
            {departments.map((dept) => (
              <li
                key={dept.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{dept.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {dept.faculty?.name ?? "No faculty assigned"}
                  </p>
                </div>
                {dept.code ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{dept.code}</span>
                ) : null}
              </li>
            ))}
            {departments.length === 0 ? (
              <li className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No departments created yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
