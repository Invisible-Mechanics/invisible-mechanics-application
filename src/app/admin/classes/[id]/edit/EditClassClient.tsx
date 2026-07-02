"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminClassOut, CohortOut } from "@/lib/api";
import { ClassForm } from "@/app/admin/_components/ClassForm";
import { RecordingUpload } from "./RecordingUpload";
import { StatusOverridePanel } from "./StatusOverridePanel";
import { StreamKeysPanel } from "./StreamKeysPanel";
import { deleteClass, updateClass } from "@/lib/api-client";

export function EditClassClient({
  initial,
  cohorts,
}: {
  initial: AdminClassOut;
  cohorts: CohortOut[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function onDelete() {
    const ok = window.confirm(
      `Delete "${initial.title}"? This can't be undone. The Cloudflare Stream live input will also be removed.`,
    );
    if (!ok) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteClass(initial.id);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete lecture.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10">
      <ClassForm
        initial={initial}
        cohorts={cohorts}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          await updateClass(initial.id, payload);
        }}
      />

      <StreamKeysPanel classId={initial.id} />

      <StatusOverridePanel classId={initial.id} initialStatus={initial.status} />

      <RecordingUpload
        classId={initial.id}
        initialStreamVideoUid={initial.stream_video_uid}
      />

      <section className="space-y-3 border-t border-red-200 pt-6">
        <h2 className="text-sm font-medium text-red-700">Danger zone</h2>
        <p className="text-xs text-ink/60">
          Permanently removes the lecture and its Cloudflare Stream live input.{" "}
          Students who&apos;ve enrolled won&apos;t see it anymore.
        </p>
        <button type="button" onClick={onDelete} disabled={deleting} className="btn-danger">
          {deleting ? "Deleting…" : "Delete lecture"}
        </button>
        {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
      </section>
    </div>
  );
}
