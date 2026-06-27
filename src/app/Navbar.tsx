"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { masterclassMode, masterclassPath } from "@/lib/masterclass";

export type NavbarUser = { email: string; role: string };

export function Navbar({ user }: { user: NavbarUser | null }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";
  const isMasterclassStudent = masterclassMode && user?.role === "student";
  const hideLoggedOutAction = pathname === "/login" || masterclassMode;

  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-5xl flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href={isMasterclassStudent ? masterclassPath : "/"}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-base font-semibold tracking-tight sm:text-lg"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
            <Image
              src="/im-logo.png"
              alt="Invisible Mechanics"
              width={28}
              height={28}
              className="rounded"
              priority
            />
          </span>
          <span className="truncate">Invisible Mechanics</span>
        </Link>
        <div className="flex shrink-0 items-center justify-end gap-x-4 gap-y-2 text-sm sm:gap-x-6">
          {!isMasterclassStudent && user && (
            <>
              <Link href="/schedule" className="text-ink/70 transition-colors hover:text-brand-600">
                Schedule
              </Link>
              <Link href="/library" className="text-ink/70 transition-colors hover:text-brand-600">
                Library
              </Link>
              <Link href="/cohorts" className="text-ink/70 transition-colors hover:text-brand-600">
                Cohorts
              </Link>
            </>
          )}
          {!isMasterclassStudent && isAdmin && (
            <Link href="/admin" className="text-ink/70 transition-colors hover:text-brand-600">
              Admin
            </Link>
          )}
          {user ? (
            <>
              {!isMasterclassStudent && (
                <Link
                  href="/account"
                  className="text-ink/70 transition-colors hover:text-brand-600"
                >
                  Account
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn-primary px-3 py-1.5 text-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : hideLoggedOutAction ? null : (
            <Link href="/login" className="btn-primary px-3 py-1.5 text-sm">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
