"use client";

import { useEffect, useState } from "react";
import type { StreamPlayback } from "@/lib/api-client";

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
    return <p className="text-sm text-ink/60">Loading recording…</p>;
  }
  if (state.kind === "none") {
    return <p className="text-sm text-ink/60">{emptyText}</p>;
  }
  if (state.kind === "error") {
    return <p className="text-sm text-red-600">{state.message}</p>;
  }
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-line">
        <iframe
          src={state.playback.iframe_url}
          title={label}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
