import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage() {
  const [faculties, departments] = await Promise.all([
    prisma.faculty.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, facultyId: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Create your account</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your clearance record is created automatically once you register.
        </p>
      </div>

      <RegisterForm faculties={faculties} departments={departments} />

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
