import Link from "next/link";
import { ApiError, listRecordedLectures, type RecordedLectureOut } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export const dynamic = "force-dynamic";

export default async function AdminRecordedPage() {
  let lectures: RecordedLectureOut[] = [];
  let errorKind: ApiError["kind"] | null = null;
  try {
    lectures = await listRecordedLectures();
  } catch (e) {
    if (e instanceof ApiError) errorKind = e.kind;
    else throw e;
  }

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <Link href="/admin" className="text-xs text-black/60 hover:underline">
            ← Back to admin
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Recorded lectures</h1>
          <p className="text-sm text-ink/60">
            Standalone videos in the Library. Separate from live broadcasts.
          </p>
        </div>
        <Link href="/admin/recorded/new" className="btn-primary px-4 py-2 text-sm">
          New recorded lecture
        </Link>
      </header>

      {errorKind && <ErrorState kind={errorKind} />}

      {!errorKind && (
        <section className="space-y-3">
          {lectures.length === 0 ? (
            <EmptyState
              heading="No recorded lectures yet"
              body="Upload a video to Cloudflare Stream, then add a lecture here with its UID."
              cta={{ href: "/admin/recorded/new", label: "New recorded lecture" }}
            />
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {lectures.map((lec) => (
                <li
                  key={lec.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {lec.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={lec.thumbnail_url}
                        alt=""
                        loading="lazy"
                        className="h-10 w-16 shrink-0 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-medium">{lec.title}</div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
                        <span>{new Date(lec.recorded_on).toLocaleString()}</span>
                        <span>·</span>
                        <span>{lec.duration_min} min</span>
                        <span>·</span>
                        <span>{lec.access_type}</span>
                        {lec.target_exam && (
                          <span className="rounded bg-brand-50 px-1 text-[10px] uppercase text-brand-700">
                            {lec.target_exam}
                          </span>
                        )}
                        {lec.target_year && (
                          <span className="rounded bg-ink/5 px-1 text-[10px] text-ink/60">
                            &apos;{String(lec.target_year).slice(-2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <Link
                      href={`/library/${lec.id}`}
                      className="transition-colors hover:text-brand-600"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/recorded/${lec.id}/edit`}
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
