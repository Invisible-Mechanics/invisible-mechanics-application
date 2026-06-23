"use client";

import { useEffect, useState } from "react";
import { joinClass } from "@/lib/api-client";

type State =
  | { kind: "loading" }
  | { kind: "ready"; iframeUrl: string }
  | { kind: "error"; message: string };

export function JoinButton({ classId }: { classId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    joinClass(classId)
      .then((res) => {
        if (!active) return;
        setState({ kind: "ready", iframeUrl: res.iframe_url });
      })
      .catch((e) => {
        if (!active) return;
        const message =
          e instanceof Error && e.message === "not entitled"
            ? "You don't have access to this paid lecture yet."
            : e instanceof Error
              ? e.message
              : "Could not join.";
        setState({ kind: "error", message });
      });
    return () => {
      active = false;
    };
  }, [classId]);

  if (state.kind === "loading") {
    return <p className="text-sm text-ink/60">Preparing live stream…</p>;
  }
  if (state.kind === "error") {
    return <p className="text-sm text-red-700">{state.message}</p>;
  }
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">Live now</h2>
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-line">
        <iframe
          src={state.iframeUrl}
          title="Live lecture"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
