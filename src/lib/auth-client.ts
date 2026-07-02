"use client";

const API_URL = "/api/backend";

export type VerifyResponse = {
  access_token: string;
  expires_at: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    target_exam?: "jee" | "neet" | null;
    grade?: "11" | "12" | "dropper" | null;
    terms_accepted_at?: string | null;
  };
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
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Could not send the code.");
  }
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
export async function persistSession(accessToken: string, expiresAt: string): Promise<void> {
  const r = await fetch(`/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, expires_at: expiresAt }),
  });
  if (!r.ok) throw new Error("could not save session");
}

export type SessionIdentity = {
  email: string | null;
  phone: string | null;
  name: string | null;
};

export async function readSessionIdentity(): Promise<SessionIdentity | null> {
  try {
    const response = await fetch("/api/session", { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as SessionIdentity;
    return { email: payload.email, phone: payload.phone, name: payload.name };
  } catch {
    return null;
  }
}

export async function hasSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/session", { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}
