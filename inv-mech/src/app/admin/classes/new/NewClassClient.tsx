"use client";

import { ClassForm } from "@/app/admin/_components/ClassForm";
import type { CohortOut } from "@/lib/api";
import { createClass } from "@/lib/api-client";

export function NewClassClient({
  cohorts,
  initialCohortId,
}: {
  cohorts: CohortOut[];
  initialCohortId?: string;
}) {
  return (
    <ClassForm
      submitLabel="Create lecture"
      cohorts={cohorts}
      initialCohortId={initialCohortId}
      onSubmit={async (payload) => {
        await createClass(payload);
      }}
    />
  );
}
