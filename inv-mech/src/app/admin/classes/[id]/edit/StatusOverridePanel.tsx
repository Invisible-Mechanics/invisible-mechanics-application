"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateClassStatus } from "@/lib/api-client";

type Status = "scheduled" | "live" | "ended";

export function StatusOverridePanel({
  classId,
  initialStatus,
}: {
  classId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus as Status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: Status) {
    setError(null);
    setPending(true);
    try {
      await updateClassStatus(classId, next);
      setStatus(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update status.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-3 border-t border-black/10 pt-6">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Broadcast status</h2>
        <p className="text-xs text-black/60">
          Cloudflare webhooks flip this automatically when the instructor
          connects (scheduled → live) and disconnects after scheduled end
          (live → ended). Override here only if a webhook was missed.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-black/60">Current:</span>
        <span className="font-mono uppercase">{status}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["scheduled", "live", "ended"] as Status[]).map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending || s === status}
            onClick={() => save(s)}
            className="rounded border border-black/15 px-3 py-1 text-xs uppercase tracking-wide disabled:opacity-40 hover:bg-black/5"
          >
            Force {s}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
