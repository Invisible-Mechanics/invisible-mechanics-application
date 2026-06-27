import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ApiError,
  getCohort,
  listCohortClasses,
  listMyEntitlements,
  type ClassOut,
  type CohortOut,
  type EntitlementOut,
} from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import { CheckoutButton } from "@/components/CheckoutButton";

export const dynamic = "force-dynamic";

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cohort: CohortOut;
  try {
    cohort = await getCohort(id);
  } catch (e) {
    if (e instanceof ApiError && e.kind === "not_found") notFound();
    if (e instanceof ApiError) {
      return <ErrorState kind={e.kind} />;
    }
    throw e;
  }

  let classes: ClassOut[] = [];
  try {
    classes = await listCohortClasses(id);
  } catch {
    // non-fatal — show cohort without classes
  }

  let entitlements: EntitlementOut[] = [];
  try {
    entitlements = await listMyEntitlements();
  } catch {
    // not logged in → no entitlements to mirror
  }

  const isEnrolled = entitlements.some(
    (e) =>
      (e.scope_type === "cohort" && e.scope_id === cohort.id) || e.scope_type === "all_access",
  );

  const seatsLeft = cohort.seat_limit
    ? Math.max(0, cohort.seat_limit - cohort.seats_taken)
    : null;

  return (
    <article className="space-y-10">
      {cohort.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cohort.thumbnail_url}
          alt={cohort.title}
          className="aspect-video w-full rounded-xl object-cover"
        />
      )}

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-600">Cohort</p>
        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{cohort.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {cohort.target_exam && (
            <span className="badge bg-brand-50 text-brand-700">{cohort.target_exam}</span>
          )}
          {cohort.target_year && (
            <span className="badge bg-ink/5 normal-case text-ink/60">
              Target {cohort.target_year}
            </span>
          )}
        </div>
        {cohort.description && (
          <p className="max-w-2xl text-base text-ink/80">{cohort.description}</p>
        )}
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <dl className="space-y-2 text-sm">
          <Row k="Starts" v={cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : "TBA"} />
          <Row k="Ends" v={cohort.end_date ? new Date(cohort.end_date).toLocaleDateString() : "TBA"} />
          {cohort.price && <Row k="Price" v={`₹${cohort.price}`} />}
          {cohort.early_bird_price && cohort.early_bird_deadline && (
            <Row
              k="Early bird"
              v={`₹${cohort.early_bird_price} until ${new Date(
                cohort.early_bird_deadline,
              ).toLocaleDateString()}`}
            />
          )}
          {seatsLeft !== null && (
            <Row k="Seats" v={`${seatsLeft} of ${cohort.seat_limit} remaining`} />
          )}
        </dl>

        <div className="space-y-3">
          {isEnrolled ? (
            <button
              disabled
              className="w-full rounded-md bg-emerald-600 px-5 py-3 font-medium text-white opacity-90"
            >
              Enrolled ✓
            </button>
          ) : cohort.status !== "open" ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-md bg-ink px-5 py-3 font-medium text-paper opacity-50"
            >
              Enrollment closed
            </button>
          ) : seatsLeft === 0 ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-md bg-ink px-5 py-3 font-medium text-paper opacity-50"
            >
              Cohort full
            </button>
          ) : (
            <CheckoutButton kind="cohort" id={cohort.id} label="Enroll" />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Schedule</h2>
        {classes.length === 0 ? (
          <p className="text-sm text-ink/60">Lecture schedule will be published closer to start.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {classes.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/classes/${c.id}`}
                    className="font-medium transition-colors hover:text-brand-600"
                  >
                    {c.title}
                  </Link>
                  <div className="text-xs text-ink/60">
                    {new Date(c.scheduled_start).toLocaleString()} · {c.duration_min} min
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line pb-1 sm:flex-row sm:justify-between">
      <dt className="text-ink/60">{k}</dt>
      <dd className="break-words sm:text-right">{v}</dd>
    </div>
  );
}
