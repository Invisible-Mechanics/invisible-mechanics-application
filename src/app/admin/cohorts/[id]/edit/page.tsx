import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ApiError,
  getCohort,
  listCohortClasses,
  type ClassOut,
  type CohortOut,
} from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import { EditCohortClient } from "./EditCohortClient";

export const dynamic = "force-dynamic";

export default async function EditCohortPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let cohort: CohortOut;
  try {
    cohort = await getCohort(id);
  } catch (e) {
    if (e instanceof ApiError && e.kind === "not_found") notFound();
    if (e instanceof ApiError) {
      return (
        <div className="space-y-6">
          <ErrorState kind={e.kind} />
        </div>
      );
    }
    throw e;
  }

  let classes: ClassOut[] = [];
  try {
    classes = await listCohortClasses(id);
  } catch {
    // non-fatal
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <Link href="/admin/cohorts" className="text-xs text-black/60 hover:underline">
          ← Back to cohorts
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Edit cohort</h1>
        <p className="text-sm text-black/60">{cohort.title}</p>
      </div>
      <EditCohortClient initial={cohort} classes={classes} />
    </div>
  );
}
