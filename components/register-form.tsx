"use client";

import { useState } from "react";
import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass, submitClass } from "./ui";

const initialState: AuthFormState = {};

const LEVELS = ["100", "200", "300", "400", "500"];

type Faculty = { id: string; name: string };
type Department = { id: string; name: string; facultyId: string | null };

export function RegisterForm({
  faculties,
  departments,
}: {
  faculties?: Faculty[];
  departments?: Department[];
}) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");

  const filteredDepartments = selectedFacultyId
    ? (departments ?? []).filter((d) => d.facultyId === selectedFacultyId)
    : (departments ?? []);

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
        <Field label="Faculty" htmlFor="facultyId" error={state.fieldErrors?.facultyId?.[0]}>
          <select
            id="facultyId"
            name="facultyId"
            required
            defaultValue=""
            className={inputClass}
            onChange={(e) => {
              setSelectedFacultyId(e.target.value);
            }}
          >
            <option value="" disabled>
              Select faculty
            </option>
            {faculties?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Department" htmlFor="departmentId" error={state.fieldErrors?.departmentId?.[0]}>
          <select
            id="departmentId"
            name="departmentId"
            required
            defaultValue=""
            className={inputClass}
            disabled={!selectedFacultyId}
          >
            <option value="" disabled>
              {selectedFacultyId ? "Select department" : "Select a faculty first"}
            </option>
            {filteredDepartments.map((d) => (
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
