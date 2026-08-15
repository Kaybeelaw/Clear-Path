"use client";

import { useActionState, useState } from "react";
import { createStageAction, type AdminFormState } from "@/app/actions/admin";
import { Field, ErrorBanner, SuccessBanner, inputClass, submitClass } from "./ui";

const initialState: AdminFormState = {};

function toCode(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function CreateStageForm() {
  const [state, formAction, isPending] = useActionState(createStageAction, initialState);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [code, setCode] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error} />
      <SuccessBanner message={state.success ? "Stage created successfully." : undefined} />

      <Field label="Stage name" htmlFor="st-name">
        <input
          id="st-name"
          name="name"
          required
          className={inputClass}
          placeholder="e.g. Alumni Relations"
          onChange={(e) => {
            if (!codeManuallyEdited) setCode(toCode(e.target.value));
          }}
        />
      </Field>

      <Field label="Stage code" htmlFor="st-code">
        <input
          id="st-code"
          name="code"
          required
          className={inputClass}
          placeholder="e.g. alumni_relations"
          value={code}
          onChange={(e) => {
            setCodeManuallyEdited(true);
            setCode(e.target.value);
          }}
        />
      </Field>

      <Field label="Description (optional)" htmlFor="st-desc">
        <input
          id="st-desc"
          name="description"
          className={inputClass}
          placeholder="Brief description of this clearance stage"
        />
      </Field>

      <Field label="Display order" htmlFor="st-order">
        <input
          id="st-order"
          name="order"
          type="number"
          min={1}
          required
          className={inputClass}
          placeholder="e.g. 8"
        />
      </Field>

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Creating…" : "Create stage"}
      </button>
    </form>
  );
}
