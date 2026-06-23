import Link from "next/link";
import type { ApiErrorKind } from "@/lib/api";

const MESSAGES: Record<ApiErrorKind, { heading: string; body: string }> = {
  backend_unreachable: {
    heading: "Backend is offline",
    body: "The API server isn't responding. If you're in dev, start it on port 8000.",
  },
  unauthenticated: {
    heading: "Please log in",
    body: "Your session expired or you're not signed in.",
  },
  forbidden: {
    heading: "Access required",
    body: "You don't have access to this yet. Enrollment and subscriptions land soon.",
  },
  not_found: {
    heading: "Not found",
    body: "That resource doesn't exist.",
  },
  server_error: {
    heading: "Something broke",
    body: "Our API returned an error. Try again in a moment.",
  },
};

export function ErrorState({ kind }: { kind: ApiErrorKind }) {
  const { heading, body } = MESSAGES[kind];
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-sm">
      <p className="font-medium text-red-900">{heading}</p>
      <p className="mt-1 text-red-800">{body}</p>
      {kind === "unauthenticated" && (
        <Link href="/login" className="mt-3 inline-block text-red-900 underline">
          Go to login
        </Link>
      )}
    </div>
  );
}
