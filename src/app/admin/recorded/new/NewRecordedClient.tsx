"use client";

import { RecordedLectureForm } from "@/app/admin/_components/RecordedLectureForm";
import type { CohortOut } from "@/lib/api";
import { createRecordedLecture } from "@/lib/api-client";

export function NewRecordedClient({
  cohorts,
  initialCohortId,
}: {
  cohorts: CohortOut[];
  initialCohortId?: string;
}) {
  return (
    <RecordedLectureForm
      submitLabel="Create lecture"
      cohorts={cohorts}
      initialCohortId={initialCohortId}
      onSubmit={async (payload) => {
        await createRecordedLecture(payload);
      }}
    />
  );
}
