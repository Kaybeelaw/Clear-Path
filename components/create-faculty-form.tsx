"use client";

import { useActionState } from "react";
import { createFacultyAction, type AdminFormState } from "@/app/actions/admin";
import { Field, ErrorBanner, SuccessBanner, inputClass, submitClass } from "./ui";

const initialState: AdminFormState = {};

export function CreateFacultyForm() {
  const [state, formAction, isPending] = useActionState(createFacultyAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error} />
      <SuccessBanner message={state.success ? "Faculty created successfully." : undefined} />

      <Field label="Faculty name" htmlFor="fac-name">
        <input
          id="fac-name"
          name="name"
          required
          className={inputClass}
          placeholder="e.g. Faculty of Law"
        />
      </Field>

      <Field label="Code (optional)" htmlFor="fac-code">
        <input
          id="fac-code"
          name="code"
          className={inputClass}
          placeholder="e.g. LAW"
        />
      </Field>

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Creating…" : "Create faculty"}
      </button>
    </form>
  );
}
