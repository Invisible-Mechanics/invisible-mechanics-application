import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = ["/schedule", "/classes", "/cohorts", "/library", "/account", "/admin"];
const ADMIN_PREFIX = "/admin";
const SESSION_COOKIE_NAME = "im_session";

// Re-encode per request — middleware doesn't share module-scope state reliably
// in the edge runtime across deploys, and the cost is negligible.
function secretBytes(): Uint8Array | null {
  const s = process.env.APP_JWT_SECRET;
  return s ? new TextEncoder().encode(s) : null;
}

async function readSession(request: NextRequest): Promise<{ role: string } | null> {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = secretBytes();
  if (!raw || !secret) return null;
  try {
    const { payload } = await jwtVerify(raw, secret, { algorithms: ["HS256"] });
    const role = typeof payload.role === "string" ? payload.role : "student";
    return { role };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAdmin = path.startsWith(ADMIN_PREFIX);
  if (!needsAuth) {
    if (path === "/login") {
      const session = await readSession(request);
      if (session) {
        const url = request.nextUrl.clone();
        const next = url.searchParams.get("next");
        url.pathname = next && next.startsWith("/") && !next.startsWith("//") ? next : "/schedule";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  const session = await readSession(request);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (isAdmin && session.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
