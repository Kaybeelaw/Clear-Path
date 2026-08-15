"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createOfficerAction, type AdminFormState } from "@/app/actions/admin";
import { Field, ErrorBanner, SuccessBanner, inputClass, submitClass } from "./ui";

const initialState: AdminFormState = {};

export function CreateOfficerForm({
  availableStages,
  availableDepartments,
}: {
  availableStages: { code: string; name: string }[];
  availableDepartments?: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createOfficerAction, initialState);
  const [selectedStage, setSelectedStage] = useState<string>("");

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error} />
      <SuccessBanner message={state.success ? "Officer account created." : undefined} />

      <Field label="Full name" htmlFor="of-fullName">
        <input
          id="of-fullName"
          name="fullName"
          required
          className={inputClass}
          placeholder="e.g. Dr. Amina Yusuf"
        />
      </Field>

      <Field label="Email address" htmlFor="of-email">
        <input
          id="of-email"
          name="email"
          type="email"
          required
          className={inputClass}
          placeholder="officer@example.edu"
        />
      </Field>

      <Field label="Temporary password" htmlFor="of-password">
        <input
          id="of-password"
          name="password"
          type="password"
          required
          minLength={8}
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </Field>

      <Field label="Clearance stage" htmlFor="of-stage">
        <select
          id="of-stage"
          name="stageCode"
          required
          defaultValue=""
          className={inputClass}
          onChange={(e) => setSelectedStage(e.target.value)}
        >
          <option value="" disabled>
            Select a clearance stage
          </option>
          {availableStages.map((stage) => (
            <option key={stage.code} value={stage.code}>
              {stage.name}
            </option>
          ))}
        </select>
      </Field>

      {selectedStage === "department" && (
        <Field label="Department" htmlFor="of-department">
          <select
            id="of-department"
            name="departmentId"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Select department
            </option>
            {availableDepartments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Creating…" : "Create officer"}
      </button>
    </form>
  );
}
