import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export { SESSION_COOKIE_NAME } from "@/lib/session-constants";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

export type Session = {
  userId: string;
  email: string;
  role: string;
  raw: string;
};

const SECRET_BYTES = new TextEncoder().encode(process.env.APP_JWT_SECRET ?? "");

/**
 * Server-only: decode the session JWT from the request cookie. Returns null
 * for missing, expired, or tampered tokens — never throws. Safe to call from
 * layouts and route handlers.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifySessionToken(raw);
}

export async function verifySessionToken(raw: string): Promise<Session | null> {
  if (!process.env.APP_JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(raw, SECRET_BYTES, { algorithms: ["HS256"] });
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const role = typeof payload.role === "string" ? payload.role : "student";
    if (!sub || !email) return null;
    return { userId: sub, email, role, raw };
  } catch {
    return null;
  }
}
