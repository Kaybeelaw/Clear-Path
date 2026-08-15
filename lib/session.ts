import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./auth";

export function homeForRole(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "/dashboard";
    case "OFFICER":
      return "/officer";
    case "ADMIN":
      return "/admin";
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!roles.includes(session.role)) redirect(homeForRole(session.role));
  return session;
}
