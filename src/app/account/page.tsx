import { StudentDetailsForm } from "@/app/account/StudentDetailsForm";
import { ApiError, getMe } from "@/lib/api";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  let profile = null;
  try {
    profile = session ? await getMe() : null;
  } catch (e) {
    if (!(e instanceof ApiError && e.kind === "unauthenticated")) throw e;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm sm:gap-x-6">
        <dt className="text-ink/60">Email</dt>
        <dd className="min-w-0 break-words">{profile?.email ?? session?.email ?? "-"}</dd>
        <dt className="text-ink/60">Mobile</dt>
        <dd className="min-w-0 break-words">{profile?.phone ?? session?.phone ?? "-"}</dd>
        <dt className="text-ink/60">User ID</dt>
        <dd className="min-w-0 break-all font-mono text-xs">{session?.userId ?? "-"}</dd>
        <dt className="text-ink/60">Role</dt>
        <dd>{profile?.role ?? session?.role ?? "-"}</dd>
      </dl>

      {profile ? (
        <section className="space-y-3 pt-2">
          <h2 className="text-xl font-medium">Student details</h2>
          <StudentDetailsForm profile={profile} />
        </section>
      ) : (
        <p className="text-sm text-ink/60">Log in to manage your student details.</p>
      )}

      <form action="/auth/signout" method="post">
        <button className="text-sm text-red-700 transition-colors hover:text-red-800 hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
