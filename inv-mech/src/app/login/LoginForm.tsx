"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestLogin, verifyCode } from "@/lib/auth-client";

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") ?? "/schedule";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestLogin(email, next);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyCode(email, code);
      const dest = res.next ?? next;
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={onVerify} className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="font-medium text-emerald-900">Check your inbox</p>
          <p className="text-emerald-800">
            We sent a sign-in link and a 6-digit code to{" "}
            <span className="font-medium">{email}</span>. Click the link in the email, or
            paste the code below.
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
          {loading ? "Verifying…" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
          className="block text-xs text-ink/60 underline"
        >
          Use a different email
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={onRequest} className="space-y-4">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        className="field-input"
        required
      />
      <button disabled={loading} className="btn-primary w-full px-4 py-2">
        {loading ? "Sending…" : "Email me a sign-in link"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
