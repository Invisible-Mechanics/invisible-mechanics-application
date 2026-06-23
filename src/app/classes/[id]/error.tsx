"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-10">
      <h1 className="text-2xl font-semibold">Couldn&apos;t load this lecture</h1>
      <p className="text-sm text-ink/70">Something went wrong.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-secondary px-3 py-1.5 text-sm">
          Try again
        </button>
        <Link href="/schedule" className="btn-secondary px-3 py-1.5 text-sm">
          Back to schedule
        </Link>
      </div>
    </div>
  );
}
