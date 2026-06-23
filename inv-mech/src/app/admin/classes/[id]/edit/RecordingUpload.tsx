"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  attachRecording,
  attachRecordingFromLiveInput,
  deleteRecording,
} from "@/lib/api-client";

export function RecordingUpload({
  classId,
  initialStreamVideoUid,
}: {
  classId: string;
  initialStreamVideoUid: string | null;
}) {
  const router = useRouter();
  const [streamVideoUid, setStreamVideoUid] = useState<string | null>(initialStreamVideoUid);
  const [uid, setUid] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const hasRecording = streamVideoUid !== null;

  async function onAttachManual(e: React.FormEvent) {
    e.preventDefault();
    if (!uid.trim()) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const updated = await attachRecording(classId, uid.trim());
      setStreamVideoUid(updated.stream_video_uid);
      setUid("");
      setInfo("Recording attached.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not attach recording.");
    } finally {
      setBusy(false);
    }
  }

  async function onAttachFromLive() {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const updated = await attachRecordingFromLiveInput(classId);
      setStreamVideoUid(updated.stream_video_uid);
      setInfo("Attached latest recording from live input.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No recording available yet.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    if (!window.confirm("Remove the recording for this lecture?")) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await deleteRecording(classId);
      setStreamVideoUid(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove recording.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 border-t border-black/10 pt-6">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Recording</h2>
        <p className="text-xs text-black/60">
          {hasRecording ? (
            <>
              Cloudflare Stream UID:{" "}
              <span className="font-mono">{streamVideoUid}</span>
            </>
          ) : (
            "After the live broadcast ends, attach the Cloudflare Stream recording. The fastest path is the auto-attach button — it picks the newest video for this lecture's live input."
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onAttachFromLive}
        disabled={busy}
        className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
      >
        Attach latest from live input
      </button>

      <form onSubmit={onAttachManual} className="flex max-w-md items-center gap-2">
        <input
          type="text"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="Or paste a Stream video UID"
          disabled={busy}
          className="flex-1 rounded-md border border-black/15 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !uid.trim()}
          className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
        >
          Attach
        </button>
      </form>

      {hasRecording && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className="text-xs text-red-700 hover:underline disabled:opacity-50"
        >
          Remove recording
        </button>
      )}

      {info && <p className="text-xs text-emerald-700">{info}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
