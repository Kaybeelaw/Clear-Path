import { ForgotPasswordForm } from "@/components/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="mb-4 text-2xl font-bold">Forgot your password?</h1>
      <p className="mb-6 text-sm text-zinc-600">Enter the email address for your account and we'll send a link to reset your password.</p>
      <ForgotPasswordForm />
    </div>
  );
}
