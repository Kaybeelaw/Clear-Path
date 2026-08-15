import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token;

  if (token) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-12">
        <h1 className="mb-4 text-2xl font-bold">Reset your password</h1>
        <p className="mb-6 text-sm text-zinc-600">Set a new password for your account.</p>
        {/* @ts-expect-error Server -> Client prop passing */}
        <ResetPasswordForm token={token} />
      </div>
    );
  }

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
