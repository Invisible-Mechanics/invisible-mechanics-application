import Link from "next/link";
import { ApiError, listCohorts, type CohortOut } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
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
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Cohorts</h1>
        <p className="text-sm text-ink/70">
          Multi-week batches with a fixed start and end date. Enrollment opens with payments soon.
        </p>
      </header>

      {errorKind && <ErrorState kind={errorKind} />}

      {!errorKind &&
        (cohorts.length === 0 ? (
          <EmptyState
            heading="No cohorts announced yet"
            body="The first cohort will be announced ahead of the next academic cycle."
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {cohorts.map((c) => (
              <CohortCard key={c.id} c={c} />
            ))}
          </ul>
        ))}
    </div>
  );
}

function CohortCard({ c }: { c: CohortOut }) {
  return (
    <li className="card overflow-hidden">
      <Link href={`/cohorts/${c.id}`} className="block">
        <Thumbnail src={c.thumbnail_url} title={c.title} />
        <div className="space-y-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-medium leading-snug">{c.title}</h2>
            <Status status={c.status} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {c.target_exam && <ExamBadge exam={c.target_exam} />}
            {c.target_year && <YearBadge year={c.target_year} />}
          </div>
          {c.description && (
            <p className="line-clamp-2 text-sm text-ink/70">{c.description}</p>
          )}
          <dl className="grid grid-cols-2 gap-y-1 pt-1 text-xs text-ink/60">
            <dt>Starts</dt>
            <dd>{c.start_date ? new Date(c.start_date).toLocaleDateString() : "TBA"}</dd>
            <dt>Ends</dt>
            <dd>{c.end_date ? new Date(c.end_date).toLocaleDateString() : "TBA"}</dd>
            {c.price && (
              <>
                <dt>Price</dt>
                <dd>₹{c.price}</dd>
              </>
            )}
            {c.seat_limit && (
              <>
                <dt>Seats</dt>
                <dd>
                  {Math.max(0, c.seat_limit - c.seats_taken)} / {c.seat_limit} left
                </dd>
              </>
            )}
          </dl>
        </div>
      </Link>
    </li>
  );
}

function Thumbnail({ src, title }: { src: string | null; title: string }) {
  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-black/5 to-black/15 text-xs uppercase tracking-wider text-black/40">
        Cohort
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={title} loading="lazy" className="aspect-video w-full object-cover" />
  );
}

function Status({ status }: { status: CohortOut["status"] }) {
  const styles =
    status === "open"
      ? "bg-emerald-50 text-emerald-700"
      : status === "closed"
        ? "bg-amber-50 text-amber-700"
        : "bg-ink/5 text-ink/60";
  return <span className={`badge shrink-0 ${styles}`}>{status}</span>;
}

function ExamBadge({ exam }: { exam: "jee" | "neet" }) {
  return <span className="badge bg-brand-50 text-brand-700">{exam}</span>;
}

function YearBadge({ year }: { year: number }) {
  return <span className="badge bg-ink/5 normal-case text-ink/60">Target {year}</span>;
}
