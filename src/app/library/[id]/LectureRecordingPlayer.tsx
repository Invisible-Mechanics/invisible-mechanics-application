"use client";

import { useCallback } from "react";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { getRecordedLecturePlayback } from "@/lib/api-client";

/** Thin client wrapper that feeds the shared player a recorded-lecture fetcher. */
export function LectureRecordingPlayer({ lectureId }: { lectureId: string }) {
  const fetchPlayback = useCallback(
    () => getRecordedLecturePlayback(lectureId),
    [lectureId],
  );
  return <RecordingPlayer fetchPlayback={fetchPlayback} />;
}
