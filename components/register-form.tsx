"use client";

import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass, submitClass } from "./ui";

const initialState: AuthFormState = {};

const LEVELS = ["100", "200", "300", "400", "500"];

export function RegisterForm({ departments }: { departments?: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error} />

      <Field label="Full name" htmlFor="fullName" error={state.fieldErrors?.fullName?.[0]}>
        <input
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          className={inputClass}
          placeholder="e.g. Adeola Okafor"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Matriculation number" htmlFor="matricNo" error={state.fieldErrors?.matricNo?.[0]}>
          <input
            id="matricNo"
            name="matricNo"
            required
            className={inputClass}
            placeholder="CSC/2021/101"
          />
        </Field>

        <Field label="Current level" htmlFor="level" error={state.fieldErrors?.level?.[0]}>
          <select id="level" name="level" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select level
            </option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level} Level
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Faculty" htmlFor="faculty" error={state.fieldErrors?.faculty?.[0]}>
          <input id="faculty" name="faculty" required className={inputClass} placeholder="e.g. Science" />
        </Field>

        <Field label="Department" htmlFor="department" error={state.fieldErrors?.departmentId?.[0]}>
          <select id="department" name="departmentId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select department
            </option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Programme" htmlFor="program" error={state.fieldErrors?.program?.[0]}>
        <input
          id="program"
          name="program"
          required
          className={inputClass}
          placeholder="e.g. B.Sc. Computer Science"
        />
      </Field>

      <Field label="Email address" htmlFor="email" error={state.fieldErrors?.email?.[0]}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="you@example.edu"
        />
      </Field>

      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password?.[0]}>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </Field>

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Creating account…" : "Create account & start clearance"}
      </button>
    </form>
  );
}
