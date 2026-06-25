import { Suspense } from "react";
import { OnboardingWizard } from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Finish setting up</h1>
        <p className="text-sm text-ink/70">A few quick details to personalise your prep.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-ink/50">Loading...</p>}>
        <OnboardingWizard />
      </Suspense>
    </div>
  );
}
