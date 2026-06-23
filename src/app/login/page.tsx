import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="text-sm text-ink/70">Sign in with your email or mobile number.</p>
      <Suspense fallback={<p className="text-sm text-ink/50">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
