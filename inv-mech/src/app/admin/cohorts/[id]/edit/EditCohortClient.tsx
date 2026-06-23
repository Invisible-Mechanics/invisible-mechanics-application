"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ClassOut, CohortOut } from "@/lib/api";
import { CohortForm } from "@/app/admin/_components/CohortForm";
import { deleteCohort, updateCohort } from "@/lib/api-client";

export function EditCohortClient({
  initial,
  classes,
}: {
  initial: CohortOut;
  classes: ClassOut[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function onDelete() {
    const ok = window.confirm(
      `Delete cohort "${initial.title}"? Attached lectures will be kept but un-attached from this cohort. This can't be undone.`,
    );
    if (!ok) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteCohort(initial.id);
      router.push("/admin/cohorts");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete cohort.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10">
      <CohortForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          await updateCohort(initial.id, payload);
        }}
      />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-medium">Lectures in this cohort</h2>
          <Link
            href={`/admin/classes/new?cohort=${initial.id}`}
            className="text-xs text-ink/60 transition-colors hover:text-brand-600"
          >
            + Add a lecture
          </Link>
        </div>
        {classes.length === 0 ? (
          <p className="text-sm text-ink/60">
            No lectures attached yet. Create lectures and pick this cohort in the form, or use the
            link above.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {classes.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <Link href={`/classes/${c.id}`} className="font-medium transition-colors hover:text-brand-600">
                    {c.title}
                  </Link>
                  <div className="text-xs text-ink/60">
                    {new Date(c.scheduled_start).toLocaleString()} · {c.duration_min} min
                  </div>
                </div>
                <Link
                  href={`/admin/classes/${c.id}/edit`}
                  className="text-xs transition-colors hover:text-brand-600"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 border-t border-red-200 pt-6">
        <h2 className="text-sm font-medium text-red-700">Danger zone</h2>
        <p className="text-xs text-ink/60">
          Deleting removes the cohort wrapper. Attached lectures are <strong>kept</strong> but
          un-attached.
        </p>
        <button type="button" onClick={onDelete} disabled={deleting} className="btn-danger">
          {deleting ? "Deleting…" : "Delete cohort"}
        </button>
        {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
      </section>
    </div>
  );
}
