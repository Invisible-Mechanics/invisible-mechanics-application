import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="text-sm text-ink/70">
        Enter your email and we&apos;ll send you a one-click login link.
      </p>
      <Suspense fallback={<p className="text-sm text-ink/50">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
