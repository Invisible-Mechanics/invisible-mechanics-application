import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/schedule";
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  const params = await searchParams;
  const next = safeNext(params?.next);
  if (session) redirect(next);

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
