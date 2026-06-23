import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  );
}
