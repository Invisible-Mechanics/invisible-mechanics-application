"use client";

import { useCallback } from "react";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { getRecordingPlayback } from "@/lib/api-client";

/** Thin client wrapper that feeds the shared player a class-recording fetcher. */
export function ClassRecordingPlayer({ classId }: { classId: string }) {
  const fetchPlayback = useCallback(() => getRecordingPlayback(classId), [classId]);
  return <RecordingPlayer fetchPlayback={fetchPlayback} />;
}
