"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass, submitClass } from "./ui";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error ?? state.message} />

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

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
