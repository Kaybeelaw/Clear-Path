"use client";

import { useActionState } from "react";
import { createDepartmentAction, type AdminFormState } from "@/app/actions/admin";
import { Field, ErrorBanner, SuccessBanner, inputClass, submitClass } from "./ui";

const initialState: AdminFormState = {};

export function CreateDepartmentForm({
  faculties,
}: {
  faculties: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createDepartmentAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error} />
      <SuccessBanner message={state.success ? "Department created successfully." : undefined} />

      <Field label="Department name" htmlFor="dep-name">
        <input
          id="dep-name"
          name="name"
          required
          className={inputClass}
          placeholder="e.g. Computer Science"
        />
      </Field>

      <Field label="Faculty" htmlFor="dep-faculty">
        <select
          id="dep-faculty"
          name="facultyId"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Select a faculty
          </option>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Code (optional)" htmlFor="dep-code">
        <input
          id="dep-code"
          name="code"
          className={inputClass}
          placeholder="e.g. CSC"
        />
      </Field>

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Creating…" : "Create department"}
      </button>
    </form>
  );
}
