import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export type ApiErrorKind =
  | "backend_unreachable"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "server_error";

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message?: string,
  ) {
    super(message ?? kind);
    this.name = "ApiError";
  }
}

export type ClassOut = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  topic: string | null;
  scheduled_start: string;
  duration_min: number;
  access_type: "free" | "paid";
  cohort_id: string;
  price_single: string | null;
  stream_video_uid: string | null;
  status: "scheduled" | "live" | "ended";
  thumbnail_url: string | null;
  target_exam: "jee" | "neet" | null;
  target_year: number | null;
};

export type CohortOut = {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  early_bird_price: string | null;
  early_bird_deadline: string | null;
  seat_limit: number | null;
  seats_taken: number;
  start_date: string | null;
  end_date: string | null;
  status: "open" | "closed" | "completed";
  thumbnail_url: string | null;
  target_exam: "jee" | "neet" | null;
  target_year: number | null;
};

export type RecordedLectureOut = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  topic: string | null;
  recorded_on: string;
  duration_min: number;
  access_type: "free" | "paid";
  cohort_id: string;
  price_single: string | null;
  stream_video_uid: string;
  thumbnail_url: string | null;
  target_exam: "jee" | "neet" | null;
  target_year: number | null;
};

export type ChapterOut = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  thumbnail_url: string | null;
  target_exam: "jee" | "neet" | null;
  target_year: number | null;
  order_index: number;
  price: string | null;
  status: "open" | "closed";
};

export type EntitlementOut = {
  id: string;
  scope_type: "class" | "cohort" | "recorded_lecture" | "all_access";
  scope_id: string | null;
  source: string;
  valid_until: string | null;
  status: "active" | "revoked";
};

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  target_exam: "jee" | "neet" | null;
  grade: "11" | "12" | "dropper" | null;
  terms_accepted_at: string | null;
  consent_version: string | null;
};

export type JoinResponse = {
  hls_url: string;
  dash_url: string;
  iframe_url: string;
  expires_at: string;
};

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await getSession();
  const headers = new Headers(init.headers);
  if (session?.raw) {
    headers.set("Authorization", `Bearer ${session.raw}`);
  }
  headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    // fetch() throws TypeError on network failure (ECONNREFUSED, DNS, etc.)
    throw new ApiError("backend_unreachable", `Could not reach API at ${API_URL}`);
  }

  if (response.status === 401) throw new ApiError("unauthenticated");
  if (response.status === 403) throw new ApiError("forbidden");
  if (response.status === 404) throw new ApiError("not_found");
  if (response.status >= 500) throw new ApiError("server_error", `API ${response.status}`);

  return response;
}

export async function listClasses(opts: { upcomingOnly?: boolean } = {}): Promise<ClassOut[]> {
  const qs = opts.upcomingOnly ? "?upcoming_only=true" : "";
  const r = await authedFetch(`/classes${qs}`);
  return r.json();
}

export async function getClass(id: string): Promise<ClassOut> {
  const r = await authedFetch(`/classes/${id}`);
  return r.json();
}

export async function listCohorts(): Promise<CohortOut[]> {
  const r = await authedFetch(`/cohorts`);
  return r.json();
}

export async function getCohort(id: string): Promise<CohortOut> {
  const r = await authedFetch(`/cohorts/${id}`);
  return r.json();
}

export async function listCohortClasses(id: string): Promise<ClassOut[]> {
  const r = await authedFetch(`/cohorts/${id}/classes`);
  return r.json();
}

export async function listMyEntitlements(): Promise<EntitlementOut[]> {
  const r = await authedFetch(`/me/entitlements`);
  return r.json();
}

export async function getMe(): Promise<UserProfile> {
  const r = await authedFetch(`/me`);
  return r.json();
}

export async function listRecordedLectures(
  opts: { cohortId?: string; targetExam?: "jee" | "neet"; targetYear?: number; limit?: number } = {},
): Promise<RecordedLectureOut[]> {
  const params = new URLSearchParams();
  if (opts.cohortId) params.set("cohort_id", opts.cohortId);
  if (opts.targetExam) params.set("target_exam", opts.targetExam);
  if (opts.targetYear) params.set("target_year", String(opts.targetYear));
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.size ? `?${params.toString()}` : "";
  const r = await authedFetch(`/lectures${qs}`);
  return r.json();
}

export async function getRecordedLecture(id: string): Promise<RecordedLectureOut> {
  const r = await authedFetch(`/lectures/${id}`);
  return r.json();
}

export async function listChapters(): Promise<ChapterOut[]> {
  const r = await authedFetch(`/chapters`);
  return r.json();
}
