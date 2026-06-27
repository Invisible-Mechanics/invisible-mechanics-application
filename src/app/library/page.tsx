import Link from "next/link";
import { ApiError, listRecordedLectures, type RecordedLectureOut } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export const dynamic = "force-dynamic";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    cohort?: string;
    target_exam?: "jee" | "neet";
    target_year?: string;
  }>;
}) {
  const sp = await searchParams;
  let lectures: RecordedLectureOut[] = [];
  let errorKind: ApiError["kind"] | null = null;
  try {
    lectures = await listRecordedLectures({
      cohortId: sp.cohort,
      targetExam: sp.target_exam,
      targetYear: sp.target_year ? Number(sp.target_year) : undefined,
    });
  } catch (e) {
    if (e instanceof ApiError) errorKind = e.kind;
    else throw e;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
        <p className="text-sm text-ink/70">Recorded lectures, available on demand.</p>
      </header>

      {errorKind && <ErrorState kind={errorKind} />}

      {!errorKind && (
        lectures.length === 0 ? (
          <EmptyState
            heading="No recorded lectures yet"
            body="Standalone recorded lectures will appear here when published."
          />
        ) : (
          <ul className="space-y-3">
            {lectures.map((lec) => (
              <LectureRow key={lec.id} lec={lec} />
            ))}
          </ul>
        )
      )}
    </div>
  );
}

function LectureRow({ lec }: { lec: RecordedLectureOut }) {
  return (
    <li>
      <Link href={`/library/${lec.id}`} className="card flex flex-col gap-3 p-3 sm:flex-row sm:gap-4">
        <Thumbnail src={lec.thumbnail_url} title={lec.title} />
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="space-y-1">
            <div className="font-medium leading-snug">{lec.title}</div>
            <div className="text-xs text-ink/60">
              {new Date(lec.recorded_on).toLocaleDateString()} · {lec.duration_min} min
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <AccessBadge type={lec.access_type} />
            {lec.target_exam && <ExamBadge exam={lec.target_exam} />}
            {lec.target_year && <YearBadge year={lec.target_year} />}
          </div>
        </div>
      </Link>
    </li>
  );
}

function Thumbnail({ src, title }: { src: string | null; title: string }) {
  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded bg-gradient-to-br from-black/5 to-black/15 text-xs uppercase tracking-wider text-black/40 sm:h-20 sm:w-32 sm:shrink-0">
        Recorded
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      loading="lazy"
      className="aspect-video w-full rounded object-cover sm:h-20 sm:w-32 sm:shrink-0"
    />
  );
}

function AccessBadge({ type }: { type: "free" | "paid" }) {
  return (
    <span
      className={
        type === "free"
          ? "badge bg-emerald-50 text-emerald-700"
          : "badge bg-amber-50 text-amber-700"
      }
    >
      {type}
    </span>
  );
}

function ExamBadge({ exam }: { exam: "jee" | "neet" }) {
  return <span className="badge bg-brand-50 text-brand-700">{exam}</span>;
}

function YearBadge({ year }: { year: number }) {
  return (
    <span className="badge bg-ink/5 normal-case tracking-wider text-ink/60">
      &apos;{String(year).slice(-2)}
    </span>
  );
}
