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
  const [devCode, setDevCode] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [exam, setExam] = useState<Exam | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [alreadyConsented, setAlreadyConsented] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [readConsent, setReadConsent] = useState(false);

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
      const res = await requestContactOtp(
        contactKind === "email" ? { email: email.trim() } : { phone },
      );
      setDevCode(res.dev_code);
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
      setDevCode(null);
      setContactStage("enter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  function startFinish(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !exam || !grade) return;
    if (!alreadyConsented) {
      setError(null);
      setAgreed(false);
      setReadConsent(false);
      setShowConsentModal(true);
      return;
    }
    void finish();
  }

  async function finish() {
    if (!name.trim() || !exam || !grade) return;
    if (!alreadyConsented && (!agreed || !readConsent)) return;
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
      window.location.assign(next);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Save timed out. Check that the backend is running, then try again.");
      } else {
        setError(err instanceof Error ? err.message : "Could not save your details.");
      }
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
            {devCode && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
                Dev mode - your code is <span className="font-mono font-semibold">{devCode}</span>
              </p>
            )}
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
        <form onSubmit={startFinish} className="space-y-5">
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

          <button
            disabled={busy || !name.trim() || !exam || !grade}
            className="btn-primary w-full px-4 py-2"
          >
            {busy ? "Saving..." : alreadyConsented ? "Finish & enter" : "Continue"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}

      {showConsentModal && (
        <ConsentModal
          agreed={agreed}
          busy={busy}
          readConsent={readConsent}
          error={error}
          onAgreedChange={setAgreed}
          onReadConsent={() => setReadConsent(true)}
          onSubmit={finish}
        />
      )}
    </div>
  );
}

function ConsentModal({
  agreed,
  busy,
  readConsent,
  error,
  onAgreedChange,
  onReadConsent,
  onSubmit,
}: {
  agreed: boolean;
  busy: boolean;
  readConsent: boolean;
  error: string | null;
  onAgreedChange: (value: boolean) => void;
  onReadConsent: () => void;
  onSubmit: () => void;
}) {
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
      onReadConsent();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-xl font-semibold tracking-tight">Privacy Policy & Terms</h2>
          <p className="mt-1 text-sm text-ink/60">
            Read the policy, then accept to finish setting up your account.
          </p>
        </div>

        <div
          onScroll={handleScroll}
          className="max-h-[58vh] space-y-4 overflow-y-auto px-5 py-4 text-sm leading-6 text-ink/75"
        >
          <p>
            Invisible Mechanics collects the account details needed to run the learning platform:
            name, email address, mobile number, target exam, class, purchases, entitlements, and
            learning activity such as class joins and recording access.
          </p>
          <p>
            We use this data to authenticate you, verify your contact details, provide access to
            purchased content, process payments, send OTPs and service messages, prevent abuse, and
            improve the learning experience.
          </p>
          <p>
            Payment data is processed through Razorpay. We store order and payment identifiers, but
            we do not see or store card, UPI, or bank credentials.
          </p>
          <p>
            We may use service providers such as Supabase, Render/Vercel, Cloudflare, Razorpay,
            Resend, and MSG91 to operate the platform. They process data only to provide their
            services to us.
          </p>
          <p>
            If you are under 18, your parent or guardian must consent to your use of the platform.
            We do not use personal data of minors for targeted advertising.
          </p>
          <p>
            You may request correction, withdrawal of consent, or deletion where legally allowed.
            Some records may be retained for payments, security, tax, or legal compliance.
          </p>
          <p>
            By accepting, you agree to the Terms of Service and Privacy Policy, and consent to the
            processing of your personal data for the purposes described above.
          </p>
          <p>
            Support and grievance requests can be sent to support@invisiblemechanics.com.
          </p>
        </div>

        <div className="space-y-4 border-t border-line px-5 py-4">
          {!readConsent && (
            <p className="text-xs font-medium text-ink/50">
              Scroll to the bottom of the policy to continue.
            </p>
          )}
          {readConsent && (
            <label className="flex items-start gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => onAgreedChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>I accept the Terms of Service and Privacy Policy.</span>
            </label>
          )}
          {readConsent && agreed && (
            <button disabled={busy} onClick={onSubmit} className="btn-primary w-full px-4 py-2">
              {busy ? "Saving..." : "Save and continue"}
            </button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
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
