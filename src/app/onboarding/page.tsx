import { redirect } from "next/navigation";
import { StudentDetailsForm } from "@/app/account/StudentDetailsForm";
import { getMe } from "@/lib/api";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const { next } = await searchParams;
  if (!session) redirect(`/login?next=${encodeURIComponent("/onboarding")}`);

  const profile = await getMe();
  const nextPath = next && next.startsWith("/") && !next.startsWith("//") ? next : "/schedule";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Complete your student details</h1>
        <p className="text-sm text-ink/60">
          Add the details we need for classes, purchases, and consent records.
        </p>
      </header>
      <StudentDetailsForm profile={profile} submitLabel="Finish and continue" redirectTo={nextPath} />
    </div>
  );
}
