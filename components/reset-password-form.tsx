"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass, submitClass } from "./ui";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error ?? state.message} />

      <input type="hidden" name="token" value={token} />

      <Field label="New password" htmlFor="password" error={state.fieldErrors?.password?.[0]}>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </Field>

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
