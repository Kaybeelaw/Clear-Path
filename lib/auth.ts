import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/generated/prisma/client";

export const SESSION_COOKIE = "clearance_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in .env");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    const role = payload.role;
    if (role !== "STUDENT" && role !== "OFFICER" && role !== "ADMIN") return null;
    return { userId: payload.sub, email: payload.email, role };
  } catch {
    return null;
  }
}

// Password reset tokens: short-lived JWTs with explicit purpose
const RESET_TOKEN_EXPIRY = "1h"; // 1 hour

export async function createPasswordResetToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ email, purpose: "pwd_reset" as const })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(RESET_TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyPasswordResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    if (payload.purpose !== "pwd_reset") return null;
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
