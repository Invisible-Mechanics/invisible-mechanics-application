import Link from "next/link";
import { AdminUsersClient } from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href="/admin" className="text-xs text-ink/60 transition-colors hover:text-brand-600">
          Back to admin
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-ink/60">
            Create admin accounts and convert existing users between student and admin.
          </p>
        </div>
      </header>
      <AdminUsersClient />
    </div>
  );
}
