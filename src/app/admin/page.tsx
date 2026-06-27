import Link from "next/link";
import { ApiError, listClasses, type ClassOut } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "live"
      ? "rounded bg-red-100 px-1.5 text-[10px] uppercase text-red-700 animate-pulse"
      : status === "ended"
        ? "rounded bg-ink/10 px-1.5 text-[10px] uppercase text-ink/50"
        : "rounded bg-ink/5 px-1.5 text-[10px] uppercase text-ink/60";
  return <span className={cls}>{status}</span>;
}

export default async function AdminPage() {
  let classes: ClassOut[] = [];
  let errorKind: ApiError["kind"] | null = null;
  try {
    classes = await listClasses();
  } catch (e) {
    if (e instanceof ApiError) errorKind = e.kind;
    else throw e;
  }

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-ink/60">Schedule and manage live lectures.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/users" className="btn-secondary px-4 py-2 text-sm">
            Manage users
          </Link>
          <Link href="/admin/cohorts" className="btn-secondary px-4 py-2 text-sm">
            Manage cohorts
          </Link>
          <Link href="/admin/recorded" className="btn-secondary px-4 py-2 text-sm">
            Recorded lectures
          </Link>
          <Link href="/admin/classes/new" className="btn-primary px-4 py-2 text-sm">
            New lecture
          </Link>
        </div>
      </header>

      {errorKind && <ErrorState kind={errorKind} />}

      {!errorKind && (
        <section className="space-y-3">
          <h2 className="text-xl font-medium">All lectures</h2>
          {classes.length === 0 ? (
            <EmptyState
              heading="No lectures yet"
              body="Schedule your first lecture to get started."
              cta={{ href: "/admin/classes/new", label: "New lecture" }}
            />
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {classes.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {c.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.thumbnail_url}
                        alt=""
                        loading="lazy"
                        className="h-10 w-16 shrink-0 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.title}</div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
                        <span>{new Date(c.scheduled_start).toLocaleString()}</span>
                        <span>·</span>
                        <span>{c.access_type}</span>
                        <span>·</span>
                        <StatusBadge status={c.status} />
                        {c.target_exam && (
                          <span className="rounded bg-brand-50 px-1 text-[10px] uppercase text-brand-700">
                            {c.target_exam}
                          </span>
                        )}
                        {c.target_year && (
                          <span className="rounded bg-ink/5 px-1 text-[10px] text-ink/60">
                            &apos;{String(c.target_year).slice(-2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <Link href={`/classes/${c.id}`} className="transition-colors hover:text-brand-600">
                      View
                    </Link>
                    <Link
                      href={`/admin/classes/${c.id}/edit`}
                      className="transition-colors hover:text-brand-600"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
