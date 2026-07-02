"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoaderModal } from "@/components/LoaderModal";
import { hasSession, LoginIdentifier, requestLogin, verifyCode } from "@/lib/auth-client";

type LoginMode = "email" | "phone";
type LoginStep = "identifier" | "code";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/schedule";

  const [step, setStep] = useState<LoginStep>("identifier");
  const [mode, setMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Sending OTP");
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    let active = true;
    hasSession().then((authenticated) => {
      if (active && authenticated) window.location.replace(next);
    });
    return () => {
      active = false;
    };
  }, [next]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = window.setInterval(() => {
      setResendSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendSeconds]);

  function currentIdentifier(): LoginIdentifier {
    return mode === "email"
      ? { kind: "email", email: email.trim() }
      : { kind: "phone", phone: phone.trim() };
  }

  async function requestCode() {
    setError(null);
    setLoadingLabel("Sending OTP");
    setLoading(true);
    try {
      await requestLogin(currentIdentifier(), next);
      setCode("");
      setStep("code");
      setResendSeconds(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  }

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    await requestCode();
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingLabel("Verifying OTP");
    setLoading(true);
    try {
      const res = await verifyCode(currentIdentifier(), code);
      const dest = res.next ?? next;
      const needsOnboarding =
        !res.user.name || !res.user.target_exam || !res.user.grade || !res.user.terms_accepted_at;
      window.location.assign(
        needsOnboarding ? `/onboarding?next=${encodeURIComponent(dest)}` : dest,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
      setLoading(false);
    }
  }

  const destination = mode === "email" ? email : phone;
  const canRequest =
    mode === "email" ? email.trim().length > 3 : phone.replace(/\D/g, "").length >= 10;

  if (step === "code") {
    return (
      <form onSubmit={onVerify} className="space-y-4">
        {loading && <LoaderModal label={loadingLabel} />}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="font-medium text-emerald-900">
            {mode === "email" ? "Check your inbox" : "Check your phone"}
          </p>
          <p className="text-emerald-800">
            We sent a 6-digit code to <span className="font-medium">{destination}</span>.
            {mode === "email" ? " You can also click the link in the email." : ""}
          </p>
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          className="field-input text-center tracking-[0.4em] text-lg"
          required
        />
        <button disabled={loading || code.length !== 6} className="btn-primary w-full px-4 py-2">
          {loading ? "Verifying..." : "Sign in"}
        </button>
        <button
          type="button"
          disabled={loading || resendSeconds > 0}
          onClick={requestCode}
          className="block text-xs font-medium text-brand-600 underline disabled:text-ink/40 disabled:no-underline"
        >
          {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("identifier");
            setCode("");
            setError(null);
          }}
          className="block text-xs text-ink/60 underline"
        >
          Use a different {mode === "email" ? "email" : "mobile number"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={onRequest} className="space-y-4">
      {loading && <LoaderModal label={loadingLabel} />}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("email");
            setError(null);
          }}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            mode === "email" ? "bg-white text-ink shadow-sm" : "text-ink/60"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("phone");
            setError(null);
          }}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            mode === "phone" ? "bg-white text-ink shadow-sm" : "text-ink/60"
          }`}
        >
          Mobile
        </button>
      </div>
      {mode === "email" ? (
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="field-input"
          required
        />
      ) : (
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 20))}
          type="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          className="field-input"
          required
        />
      )}
      <button disabled={loading || !canRequest} className="btn-primary w-full px-4 py-2">
        {loading
          ? "Sending..."
          : mode === "email"
            ? "Send OTP"
            : "Send OTP"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
