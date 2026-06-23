import { notFound } from "next/navigation";
import {
  ApiError,
  getClass,
  listMyEntitlements,
  type ClassOut,
  type EntitlementOut,
} from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import { CheckoutButton } from "@/components/CheckoutButton";
import { JoinButton } from "./JoinButton";
import { ClassRecordingPlayer } from "./ClassRecordingPlayer";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let klass: ClassOut;
  try {
    klass = await getClass(id);
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

  const isEntitled =
    klass.access_type === "free" ||
    entitlements.some(
      (e) =>
        e.scope_type === "all_access" ||
        (e.scope_type === "class" && e.scope_id === klass.id) ||
        (e.scope_type === "cohort" && e.scope_id === klass.cohort_id),
    );

  const start = new Date(klass.scheduled_start);
  const endsAt = start.getTime() + klass.duration_min * 60_000;
  const now = Date.now();
  // Time window is "doors open" — the 5-minute pre-show gate. The Cloudflare
  // webhook flips status to "live" the moment the instructor actually starts
  // pushing RTMPS, and keeps it "live" past scheduled end if they run over.
  const isLiveWindow = now >= start.getTime() - 5 * 60_000 && now <= endsAt;
  const showJoin = klass.status === "live" || (klass.status === "scheduled" && isLiveWindow);
  const joinWaiting = klass.status === "scheduled" && isLiveWindow;

  return (
    <article className="space-y-8">
      {klass.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={klass.thumbnail_url}
          alt={klass.title}
          className="aspect-video w-full rounded-xl object-cover"
        />
      )}

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-600">
          {klass.subject ?? "Lecture"}
          {klass.topic ? ` · ${klass.topic}` : ""}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{klass.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink/70">
          <span>{start.toLocaleString()}</span>
          <span>·</span>
          <span>{klass.duration_min} min</span>
          <span>·</span>
          <span className="font-mono uppercase">{klass.access_type}</span>
          {klass.target_exam && (
            <span className="badge bg-brand-50 text-brand-700">{klass.target_exam}</span>
          )}
          {klass.target_year && (
            <span className="badge bg-ink/5 normal-case text-ink/60">
              Target {klass.target_year}
            </span>
          )}
        </div>
      </header>

      {klass.description && <p className="max-w-2xl text-base">{klass.description}</p>}

      <div className="pt-2">
        {!isEntitled ? (
          <div className="max-w-xs space-y-3">
            {klass.price_single && (
              <p className="text-sm text-ink/70">One-time access · ₹{klass.price_single}</p>
            )}
            <CheckoutButton
              kind="class"
              id={klass.id}
              label={klass.price_single ? `Buy — ₹${klass.price_single}` : "Buy"}
            />
            {klass.status === "ended" && (
              <p className="text-xs text-ink/60">Includes the lecture recording.</p>
            )}
          </div>
        ) : klass.status === "ended" ? (
          <ClassRecordingPlayer classId={klass.id} />
        ) : showJoin ? (
          <div className="space-y-2">
            <JoinButton classId={klass.id} />
            {joinWaiting && (
              <p className="text-xs text-ink/60">
                Waiting for instructor to start the broadcast…
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink/60">
            Join button opens 5 minutes before scheduled start.
          </p>
        )}
      </div>
    </article>
  );
}
