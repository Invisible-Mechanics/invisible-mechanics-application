import Link from "next/link";
import { ApiError, listCohorts, type CohortOut } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export const dynamic = "force-dynamic";

export default async function AdminCohortsPage() {
  let cohorts: CohortOut[] = [];
  let errorKind: ApiError["kind"] | null = null;
  try {
    cohorts = await listCohorts();
  } catch (e) {
    if (e instanceof ApiError) errorKind = e.kind;
    else throw e;
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-xs text-ink/60 transition-colors hover:text-brand-600">
            ← Back to admin
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Cohorts</h1>
          <p className="text-sm text-ink/60">Multi-week batches with enrollment and seats.</p>
        </div>
        <Link href="/admin/cohorts/new" className="btn-primary px-4 py-2 text-sm">
          New cohort
        </Link>
      </header>

      {errorKind && <ErrorState kind={errorKind} />}

      {!errorKind &&
        (cohorts.length === 0 ? (
          <EmptyState
            heading="No cohorts yet"
            body="Cohorts let you group lectures into a paid, multi-week series."
            cta={{ href: "/admin/cohorts/new", label: "New cohort" }}
          />
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {cohorts.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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
                      {c.start_date && (
                        <span>
                          {new Date(c.start_date).toLocaleDateString()}
                          {c.end_date && ` → ${new Date(c.end_date).toLocaleDateString()}`}
                        </span>
                      )}
                      {c.price && <span>· ₹{c.price}</span>}
                      {c.seat_limit && (
                        <span>
                          · {Math.max(0, c.seat_limit - c.seats_taken)} / {c.seat_limit} left
                        </span>
                      )}
                      <span>· {c.status}</span>
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
                  <Link href={`/cohorts/${c.id}`} className="transition-colors hover:text-brand-600">
                    View
                  </Link>
                  <Link href={`/admin/cohorts/${c.id}/edit`} className="transition-colors hover:text-brand-600">
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
