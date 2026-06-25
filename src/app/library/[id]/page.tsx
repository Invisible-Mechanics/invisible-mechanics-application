import { notFound } from "next/navigation";
import {
  ApiError,
  getRecordedLecture,
  listMyEntitlements,
  type EntitlementOut,
  type RecordedLectureOut,
} from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import { CheckoutButton } from "@/components/CheckoutButton";
import { LectureRecordingPlayer } from "./LectureRecordingPlayer";

export const dynamic = "force-dynamic";

export default async function LectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let lec: RecordedLectureOut;
  try {
    lec = await getRecordedLecture(id);
  } catch (e) {
    if (e instanceof ApiError && e.kind === "not_found") notFound();
    if (e instanceof ApiError) {
      return (
        <div className="space-y-6">
          <ErrorState kind={e.kind} />
        </div>
      );
    }
    throw e;
  }

  let entitlements: EntitlementOut[] = [];
  try {
    entitlements = await listMyEntitlements();
  } catch {
    // not logged in → no entitlements
  }

  // Recorded lectures can be unlocked directly, through their cohort/course,
  // or through a future all-access entitlement.
  const isEntitled =
    lec.access_type === "free" ||
    entitlements.some(
      (e) =>
        e.scope_type === "all_access" ||
        (e.scope_type === "recorded_lecture" && e.scope_id === lec.id) ||
        (e.scope_type === "cohort" && e.scope_id === lec.cohort_id),
    );

  const recorded = new Date(lec.recorded_on);

  return (
    <article className="space-y-8">
      {lec.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lec.thumbnail_url}
          alt={lec.title}
          className="aspect-video w-full rounded-xl object-cover"
        />
      )}

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-600">
          {lec.subject ?? "Lecture"}
          {lec.topic ? ` · ${lec.topic}` : ""}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{lec.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink/70">
          <span>{recorded.toLocaleDateString()}</span>
          <span>·</span>
          <span>{lec.duration_min} min</span>
          <span>·</span>
          <span className="font-mono uppercase">{lec.access_type}</span>
          {lec.target_exam && (
            <span className="badge bg-brand-50 text-brand-700">{lec.target_exam}</span>
          )}
          {lec.target_year && (
            <span className="badge bg-ink/5 normal-case text-ink/60">
              Target {lec.target_year}
            </span>
          )}
        </div>
      </header>

      {lec.description && <p className="max-w-2xl text-base">{lec.description}</p>}

      <div className="pt-2">
        {!isEntitled ? (
          <div className="max-w-xs space-y-3">
            {lec.price_single && (
              <CheckoutButton
                kind="recorded_lecture"
                id={lec.id}
                label={`Buy this video - Rs ${lec.price_single}`}
              />
            )}
            <CheckoutButton
              kind="cohort"
              id={lec.cohort_id}
              label="Buy complete course"
            />
            <p className="text-xs text-ink/60">
              Buy this video only, or unlock the full course with cohort access.
            </p>
          </div>
        ) : (
          <LectureRecordingPlayer lectureId={lec.id} />
        )}
      </div>
    </article>
  );
}
