import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

type SetBody = { access_token?: string; expires_at?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SetBody;
  const token = body.access_token;
  if (!token) return NextResponse.json({ error: "missing access_token" }, { status: 400 });

  // Verify before setting — refuse to mint a cookie from a token we can't trust.
  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "invalid token" }, { status: 400 });

  const maxAge = body.expires_at
    ? Math.max(0, Math.floor((Date.parse(body.expires_at) - Date.now()) / 1000))
    : 60 * 60 * 24 * 30;

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    email: session.email,
    phone: session.phone,
    name: session.name,
  });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
