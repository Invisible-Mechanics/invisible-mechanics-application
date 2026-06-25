"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { persistSession } from "@/lib/auth-client";
import {
  getMe,
  requestContactOtp,
  updateProfile,
  verifyContactOtp,
} from "@/lib/api-client";
import type { UserProfile } from "@/lib/api";
import { OtpField } from "@/components/OtpField";
import { PhoneField } from "@/components/PhoneField";
import { site } from "@/lib/site";

type Step = "contact" | "profile";
type ContactKind = "email" | "phone";
type Exam = "jee" | "neet";
type Grade = "11" | "12" | "dropper";

const PHONE_EMAIL_DOMAIN = "@phone.invisiblemechanics.com";

function needsEmail(profile: UserProfile): boolean {
  return profile.email.endsWith(PHONE_EMAIL_DOMAIN);
}

function needsPhone(profile: UserProfile): boolean {
  return !profile.phone;
}

export function OnboardingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>("profile");
  const [contactKind, setContactKind] = useState<ContactKind>("phone");
  const [contactStage, setContactStage] = useState<"enter" | "code">("enter");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [exam, setExam] = useState<Exam | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [alreadyConsented, setAlreadyConsented] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getMe()
      .then((me) => {
        if (!active) return;
        if (me.name) setName(me.name);
        if (me.target_exam) setExam(me.target_exam);
        if (me.grade) setGrade(me.grade);
        if (me.terms_accepted_at) setAlreadyConsented(true);

        if (needsEmail(me)) {
          setContactKind("email");
          setStep("contact");
        } else if (needsPhone(me)) {
          setContactKind("phone");
          setStep("contact");
        } else {
          setStep("profile");
        }
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      active = false;
    };
  }, []);

  async function sendContactCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestContactOtp(
        contactKind === "email" ? { email: email.trim() } : { phone },
      );
      setContactStage("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmContact(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await verifyContactOtp(
        contactKind === "email" ? { email: email.trim(), code } : { phone, code },
      );
      await persistSession(res.access_token, res.expires_at);
      setStep("profile");
      setCode("");
      setContactStage("enter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !exam || !grade) return;
    if (!alreadyConsented && !agreed) return;
    setError(null);
    setBusy(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        target_exam: exam,
        grade,
        ...(alreadyConsented
          ? {}
          : { accept_terms: true, consent_version: site.policy.legalLastUpdated }),
      });
      await persistSession(res.access_token, res.expires_at);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your details.");
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-ink/50">Loading...</p>;

  const stepNo = step === "contact" ? 1 : 2;

  return (
    <div className="card space-y-5 p-5">
      <StepHeader current={stepNo} />

      {step === "contact" ? (
        contactStage === "enter" ? (
          <form onSubmit={sendContactCode} className="space-y-4">
            {contactKind === "email" ? (
              <>
                <label className="block text-sm font-medium">Your email address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="field-input"
                  autoFocus
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium">Your mobile number</label>
                <PhoneField value={phone} onChange={setPhone} autoFocus />
              </>
            )}
            <button disabled={busy || !canSend(contactKind, email, phone)} className="btn-primary w-full px-4 py-2">
              {busy ? "Sending..." : "Send code"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        ) : (
          <form onSubmit={confirmContact} className="space-y-4">
            <p className="text-sm text-ink/70">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">
                {contactKind === "email" ? email.trim() : `+91 ${phone}`}
              </span>
              .
            </p>
            <OtpField value={code} onChange={setCode} disabled={busy} autoFocus />
            <button disabled={busy || code.length !== 6} className="btn-primary w-full px-4 py-2">
              {busy ? "Verifying..." : contactKind === "email" ? "Verify email" : "Verify number"}
            </button>
            <button
              type="button"
              onClick={() => {
                setContactStage("enter");
                setCode("");
                setError(null);
              }}
              className="block text-xs text-ink/60 underline"
            >
              Use a different {contactKind === "email" ? "email" : "number"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )
      ) : (
        <form onSubmit={finish} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aditya Sharma"
              className="field-input"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Target exam</label>
            <Segmented
              options={[
                { value: "jee", label: "JEE" },
                { value: "neet", label: "NEET" },
              ]}
              value={exam}
              onChange={(v) => setExam(v as Exam)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Class</label>
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

          {!alreadyConsented && (
            <label className="flex items-start gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          )}

          <button
            disabled={busy || !name.trim() || !exam || !grade || (!alreadyConsented && !agreed)}
            className="btn-primary w-full px-4 py-2"
          >
            {busy ? "Saving..." : "Finish & enter"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}

function canSend(kind: ContactKind, email: string, phone: string): boolean {
  return kind === "email" ? email.trim().includes("@") : phone.length === 10;
}

function StepHeader({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full ${n <= current ? "bg-brand-500" : "bg-ink/10"}`}
        />
      ))}
      <span className="ml-1 text-xs text-ink/50">Step {current} of 2</span>
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            value === o.value
              ? "border-brand-400 bg-brand-50 text-brand-700"
              : "border-line text-ink/70 hover:bg-ink/5"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
