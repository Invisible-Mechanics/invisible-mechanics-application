"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { persistSession } from "@/lib/auth-client";
import { updateProfile } from "@/lib/api-client";
import type { UserProfile } from "@/lib/api";
import { site } from "@/lib/site";

type Exam = "jee" | "neet";
type Grade = "11" | "12" | "dropper";

const PHONE_EMAIL_DOMAIN = "@phone.invisiblemechanics.com";

export function StudentDetailsForm({
  profile,
  submitLabel = "Save details",
  redirectTo,
}: {
  profile: UserProfile;
  submitLabel?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const hasPlaceholderEmail = profile.email.endsWith(PHONE_EMAIL_DOMAIN);
  const [email, setEmail] = useState(hasPlaceholderEmail ? "" : profile.email);
  const [name, setName] = useState(profile.name ?? "");
  const [exam, setExam] = useState<Exam | null>(profile.target_exam);
  const [grade, setGrade] = useState<Grade | null>(profile.grade);
  const [agreed, setAgreed] = useState(Boolean(profile.terms_accepted_at));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alreadyConsented = Boolean(profile.terms_accepted_at);
  const canSave = Boolean(
    email.trim() && name.trim() && exam && grade && (alreadyConsented || agreed),
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave || !exam || !grade) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await updateProfile({
        ...(hasPlaceholderEmail ? { email: email.trim() } : {}),
        name: name.trim(),
        target_exam: exam,
        grade,
        ...(alreadyConsented
          ? {}
          : { accept_terms: true, consent_version: site.policy.legalLastUpdated }),
      });
      await persistSession(res.access_token, res.expires_at);
      setMessage("Saved.");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl space-y-5 p-5">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium" htmlFor="student-email">
          Email
        </label>
        <input
          id="student-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="field-input"
          disabled={!hasPlaceholderEmail}
        />
        {hasPlaceholderEmail ? (
          <p className="text-xs text-ink/50">Add your real email for account records.</p>
        ) : (
          <p className="text-xs text-ink/50">Email is linked to this account.</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium" htmlFor="student-name">
          Full name
        </label>
        <input
          id="student-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="field-input"
        />
      </div>

      <div className="grid gap-1.5">
        <span className="text-sm font-medium">Target exam</span>
        <Segmented
          options={[
            { value: "jee", label: "JEE" },
            { value: "neet", label: "NEET" },
          ]}
          value={exam}
          onChange={(v) => setExam(v as Exam)}
        />
      </div>

      <div className="grid gap-1.5">
        <span className="text-sm font-medium">Student class</span>
        <Segmented
          options={[
            { value: "11", label: "Class 11" },
            { value: "12", label: "Class 12" },
            { value: "dropper", label: "Dropper" },
          ]}
          value={grade}
          onChange={(v) => setGrade(v as Grade)}
        />
      </div>

      <div className="rounded-md border border-line bg-white p-3 text-sm text-ink/70">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <span className="text-ink/50">Email</span>
          <span>{hasPlaceholderEmail ? "Not added" : profile.email}</span>
          <span className="text-ink/50">Mobile</span>
          <span>{profile.phone ?? "Not added"}</span>
        </div>
      </div>

      {!alreadyConsented ? (
        <label className="flex items-start gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
      ) : (
        <p className="text-sm text-ink/60">
          Consent recorded
          {profile.consent_version ? ` for ${profile.consent_version}` : ""}.
        </p>
      )}

      <button type="submit" disabled={busy || !canSave} className="btn-primary w-full">
        {busy ? "Saving..." : submitLabel}
      </button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            value === option.value
              ? "border-brand-400 bg-brand-50 text-brand-700"
              : "border-line bg-white text-ink/70 hover:bg-ink/5"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
