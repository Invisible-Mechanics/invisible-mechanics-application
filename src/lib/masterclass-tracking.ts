"use client";

import { readSessionToken } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";
const VISITOR_KEY = "im_masterclass_visitor_id";

function visitorId(): string {
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(VISITOR_KEY, id);
  return id;
}

type MasterclassEventType =
  | "enroll_now_clicked"
  | "registration_completed"
  | "enrollment_confirmed";

async function postEvent(
  path: string,
  eventType: MasterclassEventType,
  source: string,
): Promise<boolean> {
  const token = readSessionToken();
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    keepalive: true,
    body: JSON.stringify({
      visitor_id: visitorId(),
      event_type: eventType,
      source,
      path: window.location.pathname,
    }),
  });
  return response.ok;
}

export function trackMasterclassEnrollClick(source = "ad_modal"): void {
  postEvent("/masterclass/events", "enroll_now_clicked", source).catch(() => {});
}

export function trackMasterclassRegistrationCompleted(source = "onboarding"): void {
  postEvent(
    "/masterclass/events/registration-completed",
    "registration_completed",
    source,
  ).catch(() => {});
}

export function trackMasterclassEnrollmentConfirmed(
  source = "masterclass_page",
): Promise<boolean> {
  return postEvent(
    "/masterclass/events/enrollment-confirmed",
    "enrollment_confirmed",
    source,
  ).catch(() => false);
}
