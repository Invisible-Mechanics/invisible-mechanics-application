import { notFound } from "next/navigation";
import Link from "next/link";
import { ApiError, getAdminClass, listCohorts, type AdminClassOut, type CohortOut } from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import { EditClassClient } from "./EditClassClient";

export const dynamic = "force-dynamic";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let klass: AdminClassOut;
  try {
    klass = await getAdminClass(id);
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

  let cohorts: CohortOut[] = [];
  try {
    cohorts = await listCohorts();
  } catch {
    // Non-fatal — form still works without the cohort dropdown options.
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <Link href="/admin" className="text-xs text-black/60 hover:underline">
          ← Back to admin
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Edit lecture</h1>
        <p className="text-sm text-black/60">{klass.title}</p>
      </div>
      <EditClassClient initial={klass} cohorts={cohorts} />
    </div>
  );
}
