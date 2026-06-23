"use client";

import { useEffect, useState } from "react";
import { getStreamKeys, type StreamKeys } from "@/lib/api-client";

type State =
  | { kind: "loading" }
  | { kind: "ready"; keys: StreamKeys; revealed: boolean }
  | { kind: "error"; message: string };

export function StreamKeysPanel({ classId }: { classId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    getStreamKeys(classId)
      .then((keys) => {
        if (!active) return;
        setState({ kind: "ready", keys, revealed: false });
      })
      .catch((e) => {
        if (!active) return;
        setState({ kind: "error", message: e instanceof Error ? e.message : "Could not load keys." });
      });
    return () => {
      active = false;
    };
  }, [classId]);

  return (
    <section className="space-y-3 border-t border-black/10 pt-6">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Stream push credentials</h2>
        <p className="text-xs text-black/60">
          Paste these into OBS / your encoder to broadcast. The stream key is a
          secret — only the instructor for this lecture should see it.
        </p>
      </div>

      {state.kind === "loading" && <p className="text-xs text-black/60">Loading…</p>}
      {state.kind === "error" && <p className="text-xs text-red-600">{state.message}</p>}
      {state.kind === "ready" && (
        <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
          <dt className="text-black/60">Server (RTMPS URL)</dt>
          <dd className="break-all font-mono">{state.keys.rtmps_url}</dd>
          <dt className="text-black/60">Stream key</dt>
          <dd className="break-all font-mono">
            {state.revealed ? (
              state.keys.rtmps_stream_key
            ) : (
              <button
                type="button"
                onClick={() => setState({ ...state, revealed: true })}
                className="text-brand-700 hover:underline"
              >
                Reveal
              </button>
            )}
          </dd>
          <dt className="text-black/60">Live input UID</dt>
          <dd className="break-all font-mono">{state.keys.live_input_uid}</dd>
        </dl>
      )}
    </section>
  );
}
