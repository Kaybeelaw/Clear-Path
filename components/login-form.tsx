"use client";

import { useState } from "react";
import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass, submitClass } from "./ui";
import { ForgotPasswordForm } from "./forgot-password-form";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <ErrorBanner message={state.error} />

        <Field label="Email address" htmlFor="email" error={state.fieldErrors?.email?.[0]}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="you@example.edu"
          />
        </Field>

        <Field label="Password" htmlFor="password" error={state.fieldErrors?.password?.[0]}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        <div className="flex items-center justify-between">
          <button type="submit" disabled={isPending} className={submitClass}>
            {isPending ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => setShowForgot((s) => !s)}
            className="text-sm text-zinc-600 hover:underline ml-4"
          >
            Forgot password?
          </button>
        </div>
      </form>

      {showForgot && (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-lg font-semibold">Reset your password</h3>
          <ForgotPasswordForm />
        </div>
      )}
    </div>
  );
}
