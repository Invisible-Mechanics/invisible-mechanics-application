"use client";

import { useEffect, useMemo, useState } from "react";
import type { StreamPlayback } from "@/lib/api-client";
import { readSessionIdentity } from "@/lib/auth-client";

type State =
  | { kind: "loading" }
  | { kind: "ready"; playback: StreamPlayback }
  | { kind: "none" }
  | { kind: "error"; message: string };

/** Shared signed-iframe player for any Cloudflare Stream video.
 *
 * Used by both live-class recordings (/classes/[id]) and standalone recorded
 * lectures (/library/[id]). The caller supplies the playback fetcher so the
 * component stays decoupled from any specific API path. */
export function RecordingPlayer({
  fetchPlayback,
  label = "Recording",
  emptyText = "The recording will be posted soon.",
}: {
  fetchPlayback: () => Promise<StreamPlayback | null>;
  label?: string;
  emptyText?: string;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const watermark = useMemo(() => {
    const identity = readSessionIdentity();
    return [identity?.name, identity?.phone ?? identity?.email].filter(Boolean).join(" | ");
  }, []);

  useEffect(() => {
    let active = true;
    fetchPlayback()
      .then((playback) => {
        if (!active) return;
        setState(playback ? { kind: "ready", playback } : { kind: "none" });
      })
      .catch((e) => {
        if (!active) return;
        setState({ kind: "error", message: e instanceof Error ? e.message : "Could not load." });
      });
    return () => {
      active = false;
    };
  }, [fetchPlayback]);

  if (state.kind === "loading") {
    return <p className="text-sm text-ink/60">Loading recording...</p>;
  }
  if (state.kind === "none") {
    return <p className="text-sm text-ink/60">{emptyText}</p>;
  }
  if (state.kind === "error") {
    if (state.message === "unauthenticated") {
      const next =
        typeof window === "undefined"
          ? "/schedule"
          : `${window.location.pathname}${window.location.search}`;
      return (
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-sm font-medium text-ink">Log in to watch this video</p>
          <p className="mt-1 text-sm text-ink/60">
            Your session is required before playback can start.
          </p>
          <a
            href={`/login?next=${encodeURIComponent(next)}`}
            className="btn-primary mt-4 inline-flex px-4 py-2 text-sm"
          >
            Log in
          </a>
        </div>
      );
    }
    return <p className="text-sm text-red-600">{state.message}</p>;
  }
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-black">
        <iframe
          src={state.playback.iframe_url}
          title={label}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="h-full w-full"
        />
        {watermark && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="video-watermark rounded bg-black/10 px-3 py-1 text-xs font-medium text-white/45 shadow-sm">
              {watermark}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
