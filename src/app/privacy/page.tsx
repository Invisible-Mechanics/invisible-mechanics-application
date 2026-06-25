export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl space-y-5 text-sm leading-6 text-ink/75">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <p className="text-ink/55">Last updated: 25 June 2026</p>
      <p>
        Invisible Mechanics collects the information needed to operate the learning platform:
        your name, email, mobile number, target exam, class, purchases, entitlements, and
        learning activity such as video access or class participation.
      </p>
      <h2 className="text-xl font-medium text-ink">How We Use Data</h2>
      <p>
        We use this data to authenticate you, provide access to purchased content, run classes,
        send OTPs and important service messages, prevent abuse, and improve the learning
        experience.
      </p>
      <h2 className="text-xl font-medium text-ink">Consent</h2>
      <p>
        During onboarding, you explicitly accept the Terms and this Privacy Policy. We store
        the acceptance time and policy version so the platform can evidence consent.
      </p>
      <h2 className="text-xl font-medium text-ink">Students Under 18</h2>
      <p>
        Many students may be under 18. A parent or guardian should consent to platform use for
        minors and can contact us for account or data requests.
      </p>
      <h2 className="text-xl font-medium text-ink">Your Choices</h2>
      <p>
        You can request correction, withdrawal of consent, or deletion where legally allowed.
        Some records may be retained where required for payments, security, or legal compliance.
      </p>
    </article>
  );
}
