import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site, addressInline, grievanceAddressLines } from "@/lib/site";

export const metadata: Metadata = { title: `Privacy Policy - ${site.brand.name}` };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated={site.policy.legalLastUpdated}>
      <p>
        This policy explains how <strong>{site.business.legalName}</strong> (&quot;we&quot;)
        collects and uses personal data when you use {site.brand.name}. We are the data fiduciary
        under the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;).
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, phone number, target exam, grade, and
          an optional profile picture.
        </li>
        <li>
          <strong>Payment data:</strong> order amounts and payment identifiers from Razorpay, our
          payment processor. We never see or store your card/UPI credentials.
        </li>
        <li>
          <strong>Usage data:</strong> classes joined, watch time and resume positions, mock-test
          attempts and scores, chat/community posts, and device information (IP address, browser)
          for each login session.
        </li>
      </ul>

      <h2>2. Why we collect it (lawful purposes)</h2>
      <ul>
        <li>Providing the service you purchased: login, playback, live classes, results.</li>
        <li>Payment processing, receipts, and fraud prevention.</li>
        <li>
          Security: enforcing one-active-session, detecting account sharing and abuse - this is why
          we record login device/IP details.
        </li>
        <li>Service messages: OTP codes, class reminders, purchase confirmations.</li>
      </ul>
      <p>We do not sell personal data and do not use it for third-party advertising.</p>

      <h2>3. Who we share it with (data processors)</h2>
      <ul>
        <li>Supabase (database and file storage) and Render/Vercel (hosting).</li>
        <li>Cloudflare (video streaming and delivery).</li>
        <li>Razorpay (payments), Resend (email), MSG91 (SMS OTP).</li>
      </ul>
      <p>
        Each processes data only to provide their service to us. Some are located outside India;
        transfers comply with the DPDP Act.
      </p>

      <h2>4. Children and students under 18</h2>
      <p>
        Most of our students prepare for JEE/NEET and may be under 18. If you are under 18, your
        parent or guardian must consent to your use of the Platform at signup. We do not use
        personal data of minors for tracking, behavioural monitoring, or targeted advertising.
      </p>

      <h2>5. Retention</h2>
      <p>
        We keep account data while your account exists, and payment records as required by tax law
        (typically {site.policy.dataRetentionYears} years). Login-session records are retained for up
        to {site.policy.sessionLogRetentionMonths} months for security. You may request deletion
        (below); we will delete data not required by law.
      </p>

      <h2>6. Your rights (DPDP Act)</h2>
      <ul>
        <li>Access a summary of your personal data and how it is processed.</li>
        <li>Correct or complete your data (most fields are editable in your profile).</li>
        <li>Withdraw consent or request erasure, subject to legal retention duties.</li>
        <li>Nominate a person to exercise these rights for you.</li>
        <li>Raise a grievance (Section 8) and escalate to the Data Protection Board of India.</li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        We use one essential cookie (<code>im_session</code>) to keep you signed in. It is used for
        account access and security, not advertising. We currently use no analytics or advertising
        cookies; if that changes, this policy and a consent notice will be updated first.
      </p>

      <h2>8. Grievance officer</h2>
      <p>
        <strong>{site.grievance.officerName}</strong> -{" "}
        <a href={`mailto:${site.grievance.email}`}>
          <strong>{site.grievance.email}</strong>
        </a>
        , {addressInline(grievanceAddressLines)}. We acknowledge complaints within{" "}
        {site.policy.grievanceAckHours} hours and aim to resolve them within{" "}
        {site.policy.grievanceResolutionDays} days.
      </p>

      <h2>9. Changes</h2>
      <p>Material changes will be announced on the Platform or by email before they take effect.</p>
    </LegalPage>
  );
}
