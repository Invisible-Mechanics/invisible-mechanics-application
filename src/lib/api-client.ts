"use client";

import { readSessionToken } from "@/lib/auth-client";
import type { ClassOut, JoinResponse, UserProfile } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = readSessionToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

export async function joinClass(id: string): Promise<JoinResponse> {
  const r = await authedFetch(`/classes/${id}/join`, { method: "POST" });
  if (r.status === 403) throw new Error("not entitled");
  if (!r.ok) throw new Error(`joinClass failed: ${r.status}`);
  return r.json();
}

export async function createClass(payload: Record<string, unknown>): Promise<unknown> {
  const r = await authedFetch(`/admin/classes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`createClass failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function updateClass(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  const r = await authedFetch(`/admin/classes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`updateClass failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function updateClassStatus(
  id: string,
  status: "scheduled" | "live" | "ended",
): Promise<ClassOut> {
  const r = await authedFetch(`/admin/classes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error(`updateClassStatus failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function deleteClass(id: string): Promise<void> {
  const r = await authedFetch(`/admin/classes/${id}`, { method: "DELETE" });
  if (!r.ok && r.status !== 204) {
    throw new Error(`deleteClass failed: ${r.status} ${await r.text()}`);
  }
}

export async function createCohort(payload: Record<string, unknown>): Promise<unknown> {
  const r = await authedFetch(`/admin/cohorts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`createCohort failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function updateCohort(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  const r = await authedFetch(`/admin/cohorts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`updateCohort failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function deleteCohort(id: string): Promise<void> {
  const r = await authedFetch(`/admin/cohorts/${id}`, { method: "DELETE" });
  if (!r.ok && r.status !== 204) {
    throw new Error(`deleteCohort failed: ${r.status} ${await r.text()}`);
  }
}

// --- Cohort enrollment (Razorpay) ---

export type CreateOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  title: string;
  prefill_name: string | null;
  prefill_email: string | null;
  prefill_contact: string | null;
};

export async function createCohortOrder(cohortId: string): Promise<CreateOrderResponse> {
  const r = await authedFetch(`/enrollments/cohorts/${cohortId}/order`, { method: "POST" });
  if (r.status === 401) throw new Error("unauthenticated");
  if (r.status === 409) throw new Error((await r.json()).detail ?? "cannot enroll");
  if (!r.ok) throw new Error(`createCohortOrder failed: ${r.status}`);
  return r.json();
}

export async function createClassOrder(classId: string): Promise<CreateOrderResponse> {
  const r = await authedFetch(`/enrollments/classes/${classId}/order`, { method: "POST" });
  if (r.status === 401) throw new Error("unauthenticated");
  if (r.status === 409) throw new Error((await r.json()).detail ?? "cannot purchase");
  if (!r.ok) throw new Error(`createClassOrder failed: ${r.status}`);
  return r.json();
}

export async function getMe(): Promise<UserProfile> {
  const r = await authedFetch(`/me`, { method: "GET" });
  if (r.status === 401) throw new Error("unauthenticated");
  if (!r.ok) throw new Error(`getMe failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export type ProfileUpdateResponse = {
  user: UserProfile;
  access_token: string;
  expires_at: string;
};

export async function updateProfile(payload: {
  name?: string;
  target_exam?: "jee" | "neet";
  grade?: "11" | "12" | "dropper";
  accept_terms?: boolean;
  consent_version?: string;
}): Promise<ProfileUpdateResponse> {
  const r = await authedFetch(`/me`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (r.status === 401) throw new Error("unauthenticated");
  if (!r.ok) throw new Error(`updateProfile failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function createRecordedLectureOrder(
  lectureId: string,
): Promise<CreateOrderResponse> {
  const r = await authedFetch(`/enrollments/lectures/${lectureId}/order`, {
    method: "POST",
  });
  if (r.status === 401) throw new Error("unauthenticated");
  if (r.status === 409) throw new Error((await r.json()).detail ?? "cannot purchase");
  if (!r.ok) throw new Error(`createRecordedLectureOrder failed: ${r.status}`);
  return r.json();
}

export async function verifyPayment(body: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<void> {
  const r = await authedFetch(`/enrollments/verify`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`verifyPayment failed: ${r.status} ${await r.text()}`);
}

// --- Recording attach + playback (Cloudflare Stream) ---

export type StreamPlayback = {
  hls_url: string;
  dash_url: string;
  iframe_url: string;
  expires_at: string;
};

/** Attach (or replace) a Cloudflare Stream video UID on the class. */
export async function attachRecording(
  classId: string,
  streamVideoUid: string,
): Promise<ClassOut> {
  const r = await authedFetch(`/admin/classes/${classId}/recording`, {
    method: "PUT",
    body: JSON.stringify({ stream_video_uid: streamVideoUid }),
  });
  if (!r.ok) throw new Error(`attachRecording failed: ${r.status} ${await r.text()}`);
  return r.json();
}

/** Ask the backend to auto-attach the latest Stream recording for this live input. */
export async function attachRecordingFromLiveInput(classId: string): Promise<ClassOut> {
  const r = await authedFetch(
    `/admin/classes/${classId}/recording/attach-from-live-input`,
    { method: "POST" },
  );
  if (!r.ok)
    throw new Error(`attachRecordingFromLiveInput failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function deleteRecording(classId: string): Promise<void> {
  const r = await authedFetch(`/admin/classes/${classId}/recording`, { method: "DELETE" });
  if (!r.ok && r.status !== 204) {
    throw new Error(`deleteRecording failed: ${r.status} ${await r.text()}`);
  }
}

/** Returns short-lived signed Stream playback URLs, or null if no recording yet. */
export async function getRecordingPlayback(classId: string): Promise<StreamPlayback | null> {
  const r = await authedFetch(`/classes/${classId}/recording`, { method: "GET" });
  if (r.status === 401) throw new Error("unauthenticated");
  if (r.status === 404) return null;
  if (r.status === 403) throw new Error("not entitled");
  if (!r.ok) throw new Error(`getRecordingPlayback failed: ${r.status}`);
  return r.json();
}

// --- Recorded lectures (Library) ---

export async function createRecordedLecture(
  payload: Record<string, unknown>,
): Promise<unknown> {
  const r = await authedFetch(`/admin/recorded-lectures`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!r.ok)
    throw new Error(`createRecordedLecture failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function updateRecordedLecture(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  const r = await authedFetch(`/admin/recorded-lectures/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!r.ok)
    throw new Error(`updateRecordedLecture failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function deleteRecordedLecture(id: string): Promise<void> {
  const r = await authedFetch(`/admin/recorded-lectures/${id}`, { method: "DELETE" });
  if (!r.ok && r.status !== 204) {
    throw new Error(`deleteRecordedLecture failed: ${r.status} ${await r.text()}`);
  }
}

/** Returns short-lived signed Stream playback URLs for a recorded lecture. */
export async function getRecordedLecturePlayback(
  lectureId: string,
): Promise<StreamPlayback | null> {
  const r = await authedFetch(`/lectures/${lectureId}/playback`, { method: "GET" });
  if (r.status === 401) throw new Error("unauthenticated");
  if (r.status === 404) return null;
  if (r.status === 403) throw new Error("not entitled");
  if (!r.ok) throw new Error(`getRecordedLecturePlayback failed: ${r.status}`);
  return r.json();
}

// --- Admin: live input RTMPS keys ---

export type StreamKeys = {
  rtmps_url: string;
  rtmps_stream_key: string;
  live_input_uid: string;
};

export async function getStreamKeys(classId: string): Promise<StreamKeys> {
  const r = await authedFetch(`/admin/classes/${classId}/stream-keys`, { method: "GET" });
  if (!r.ok) throw new Error(`getStreamKeys failed: ${r.status} ${await r.text()}`);
  return r.json();
}
