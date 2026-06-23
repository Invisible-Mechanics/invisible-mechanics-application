"use client";

import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export type VerifyResponse = {
  access_token: string;
  expires_at: string;
  user: { id: string; email: string; name: string | null; phone: string | null; role: string };
  next: string | null;
};

export type LoginIdentifier =
  | { kind: "email"; email: string }
  | { kind: "phone"; phone: string };

/** Ask the backend to send a magic link/email code or SMS OTP. Always resolves ok=true. */
export async function requestLogin(identifier: LoginIdentifier, next?: string): Promise<void> {
  const r = await fetch(`${API_URL}/auth/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...identifierPayload(identifier), next }),
  });
  if (!r.ok) throw new Error(`request failed: ${r.status}`);
}

/** Verify a 6-digit code against the backend; on success, persists the cookie. */
export async function verifyCode(
  identifier: LoginIdentifier,
  code: string,
): Promise<VerifyResponse> {
  const r = await fetch(`${API_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...identifierPayload(identifier), code }),
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.detail ?? "invalid code");
  }
  const data = (await r.json()) as VerifyResponse;
  await persistSession(data.access_token, data.expires_at);
  return data;
}

function identifierPayload(identifier: LoginIdentifier): { email: string } | { phone: string } {
  return identifier.kind === "email"
    ? { email: identifier.email }
    : { phone: identifier.phone };
}

/** Persist the JWT in a same-origin cookie our middleware + api-client read. */
async function persistSession(accessToken: string, expiresAt: string): Promise<void> {
  const r = await fetch(`/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, expires_at: expiresAt }),
  });
  if (!r.ok) throw new Error("could not save session");
}

/** Browser-side read of the session JWT (used by api-client to stamp headers). */
export function readSessionToken(): string | null {
  if (typeof document === "undefined") return null;
  const target = `${SESSION_COOKIE_NAME}=`;
  for (const part of document.cookie.split(";")) {
    const c = part.trim();
    if (c.startsWith(target)) return decodeURIComponent(c.slice(target.length));
  }
  return null;
}

export type SessionIdentity = {
  email: string | null;
  phone: string | null;
  name: string | null;
};

export function readSessionIdentity(): SessionIdentity | null {
  const token = readSessionToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return {
      email: typeof payload.email === "string" ? payload.email : null,
      phone: typeof payload.phone === "string" ? payload.phone : null,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}
