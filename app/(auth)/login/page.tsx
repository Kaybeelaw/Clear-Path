import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Welcome back</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to track your clearance progress.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        New student?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}
