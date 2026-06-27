import Link from "next/link";
import Image from "next/image";
import { masterclassMode, masterclassPath } from "@/lib/masterclass";

export type NavbarUser = { email: string; role: string };

export function Navbar({ user }: { user: NavbarUser | null }) {
  const isAdmin = user?.role === "admin";
  const isMasterclassStudent = masterclassMode && user?.role === "student";

  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href={isMasterclassStudent ? masterclassPath : "/"}
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
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
          Invisible Mechanics
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {isMasterclassStudent ? (
            <Link href={masterclassPath} className="text-ink/70 transition-colors hover:text-brand-600">
              Masterclass
            </Link>
          ) : user && (
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
          ) : (
            <Link href="/login" className="btn-primary px-3 py-1.5 text-sm">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
