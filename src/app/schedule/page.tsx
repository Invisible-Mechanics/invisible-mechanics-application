import Link from "next/link";
import { ApiError, listClasses, type ClassOut } from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let classes: ClassOut[] = [];
  let errorKind: ApiError["kind"] | null = null;
  try {
    classes = await listClasses();
  } catch (e) {
    if (e instanceof ApiError) errorKind = e.kind;
    else throw e;
  }

  const now = Date.now();
  const upcoming = classes.filter((c) => new Date(c.scheduled_start).getTime() >= now);
  const past = classes.filter((c) => new Date(c.scheduled_start).getTime() < now);

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-sm text-ink/70">Upcoming live lectures and past sessions.</p>
      </header>

      {errorKind && <ErrorState kind={errorKind} />}

      {!errorKind && (
        <>
          <Section
            title="Upcoming"
            items={upcoming}
            empty={
              <EmptyState
                heading="No live lectures scheduled yet"
                body="When new lectures are announced they'll appear here."
              />
            }
          />
          <Section
            title="Past"
            items={past}
            empty={
              <EmptyState
                heading="Nothing here yet"
                body="Past sessions appear after they end."
              />
            }
          />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  items: ClassOut[];
  empty: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium">{title}</h2>
      {items.length === 0 ? (
        empty
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <ClassRow key={c.id} c={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ClassRow({ c }: { c: ClassOut }) {
  return (
    <li>
      <Link href={`/classes/${c.id}`} className="card flex flex-col gap-3 p-3 sm:flex-row sm:gap-4">
        <Thumbnail src={c.thumbnail_url} title={c.title} />
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="space-y-1">
            <div className="font-medium leading-snug">{c.title}</div>
            <div className="text-xs text-ink/60">
              {new Date(c.scheduled_start).toLocaleString()} · {c.duration_min} min
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <AccessBadge type={c.access_type} />
            {c.target_exam && <ExamBadge exam={c.target_exam} />}
            {c.target_year && <YearBadge year={c.target_year} />}
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
        Live
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
