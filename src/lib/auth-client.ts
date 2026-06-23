"use client";

import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export type VerifyResponse = {
  access_token: string;
  expires_at: string;
  user: { id: string; email: string; name: string | null; phone: string | null; role: string };
  next: string | null;
};

/** Ask the backend to email a magic link + 6-digit code. Always resolves ok=true. */
export async function requestLogin(email: string, next?: string): Promise<void> {
  const r = await fetch(`${API_URL}/auth/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, next }),
  });
  if (!r.ok) throw new Error(`request failed: ${r.status}`);
}

/** Verify a 6-digit code against the backend; on success, persists the cookie. */
export async function verifyCode(email: string, code: string): Promise<VerifyResponse> {
  const r = await fetch(`${API_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.detail ?? "invalid code");
  }
  const data = (await r.json()) as VerifyResponse;
  await persistSession(data.access_token, data.expires_at);
  return data;
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
