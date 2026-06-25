export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <article className="max-w-3xl space-y-5 text-sm leading-6 text-ink/75">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Terms of Service</h1>
      <p className="text-ink/55">Last updated: 25 June 2026</p>
      <p>
        Invisible Mechanics provides live classes, recorded lectures, cohorts, and related
        learning material for exam preparation. By using the platform, you agree to use the
        service only for personal learning and not to share paid content, access links, or
        recordings outside your own account.
      </p>
      <h2 className="text-xl font-medium text-ink">Student Accounts</h2>
      <p>
        You are responsible for the accuracy of your student details, including name, target
        exam, class, email, and mobile number. If you are under 18, your parent or guardian
        should review these terms and consent to your use of the platform.
      </p>
      <h2 className="text-xl font-medium text-ink">Payments and Access</h2>
      <p>
        Paid cohorts, courses, and videos become available after successful payment
        confirmation. Access is account-specific and may not be transferred or resold.
      </p>
      <h2 className="text-xl font-medium text-ink">Conduct</h2>
      <p>
        Do not misuse live classes, chat, recordings, or platform systems. We may restrict
        access where abuse, sharing, or fraud is detected.
      </p>
    </article>
  );
}
