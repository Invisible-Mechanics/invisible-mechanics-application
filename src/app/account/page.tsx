import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-ink/60">Email</dt>
        <dd>{session?.email ?? "—"}</dd>
        <dt className="text-ink/60">User ID</dt>
        <dd className="font-mono text-xs">{session?.userId ?? "—"}</dd>
        <dt className="text-ink/60">Role</dt>
        <dd>{session?.role ?? "—"}</dd>
      </dl>

      <section className="space-y-2 pt-6">
        <h2 className="text-xl font-medium">Billing</h2>
        <p className="text-sm text-ink/60">
          Subscriptions and cohort enrollments land in Phase 1/2. Nothing to show yet.
        </p>
      </section>

      <form action="/auth/signout" method="post">
        <button className="text-sm text-red-700 transition-colors hover:text-red-800 hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
