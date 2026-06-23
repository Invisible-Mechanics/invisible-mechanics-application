"use client";

import Link from "next/link";
import { CohortForm } from "@/app/admin/_components/CohortForm";
import { createCohort } from "@/lib/api-client";

export default function NewCohortPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <Link href="/admin/cohorts" className="text-xs text-black/60 hover:underline">
          ← Back to cohorts
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">New cohort</h1>
      </div>
      <CohortForm
        submitLabel="Create cohort"
        onSubmit={async (payload) => {
          await createCohort(payload);
        }}
      />
    </div>
  );
}
