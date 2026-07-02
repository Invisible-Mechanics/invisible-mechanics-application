"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminRecordedLectureOut, CohortOut } from "@/lib/api";
import { RecordedLectureForm } from "@/app/admin/_components/RecordedLectureForm";
import { deleteRecordedLecture, updateRecordedLecture } from "@/lib/api-client";

export function EditRecordedClient({
  initial,
  cohorts,
}: {
  initial: AdminRecordedLectureOut;
  cohorts: CohortOut[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function onDelete() {
    const ok = window.confirm(
      `Delete "${initial.title}"? This can't be undone. The Cloudflare Stream video itself is not deleted.`,
    );
    if (!ok) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteRecordedLecture(initial.id);
      router.push("/admin/recorded");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete lecture.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10">
      <RecordedLectureForm
        initial={initial}
        cohorts={cohorts}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          await updateRecordedLecture(initial.id, payload);
        }}
      />

      <section className="space-y-3 border-t border-red-200 pt-6">
        <h2 className="text-sm font-medium text-red-700">Danger zone</h2>
        <p className="text-xs text-ink/60">
          Permanently removes the lecture. The Cloudflare Stream video itself is not
          deleted.
        </p>
        <button type="button" onClick={onDelete} disabled={deleting} className="btn-danger">
          {deleting ? "Deleting…" : "Delete lecture"}
        </button>
        {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
      </section>
    </div>
  );
}
