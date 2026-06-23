import Link from "next/link";
import { listCohorts, type CohortOut } from "@/lib/api";
import { NewRecordedClient } from "./NewRecordedClient";

export const dynamic = "force-dynamic";

export default async function NewRecordedLecturePage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  const { cohort } = await searchParams;
  let cohorts: CohortOut[] = [];
  try {
    cohorts = await listCohorts();
  } catch {
    // Non-fatal — the form surfaces an empty-cohorts error itself.
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/admin/recorded" className="text-xs text-black/60 hover:underline">
        ← Back to recorded lectures
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">New lecture</h1>
      {cohorts.length === 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">No cohorts yet.</p>
          <p className="mt-1 text-amber-900/80">
            Recorded lectures belong to a cohort.{" "}
            <Link href="/admin/cohorts/new" className="underline">
              Create a cohort first
            </Link>
            .
          </p>
        </div>
      ) : (
        <NewRecordedClient cohorts={cohorts} initialCohortId={cohort} />
      )}
    </div>
  );
}
