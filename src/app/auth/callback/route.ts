import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";
const DEFAULT_NEXT = "/schedule";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return DEFAULT_NEXT;
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("t");
  const next = safeNext(searchParams.get("next"));

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const r = await fetch(`${API_URL}/auth/verify-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!r.ok) {
    return NextResponse.redirect(`${origin}/login?error=expired_link`);
  }
  const data = (await r.json()) as {
    access_token: string;
    expires_at: string;
    next: string | null;
  };

  const session = await verifySessionToken(data.access_token);
  if (!session) {
    return NextResponse.redirect(`${origin}/login?error=invalid_session`);
  }

  const destination = safeNext(data.next ?? next);
  const response = NextResponse.redirect(`${origin}${destination}`);
  const maxAge = Math.max(0, Math.floor((Date.parse(data.expires_at) - Date.now()) / 1000));
  response.cookies.set(SESSION_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  // Cookie is also set in the response store for completeness.
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return response;
}
