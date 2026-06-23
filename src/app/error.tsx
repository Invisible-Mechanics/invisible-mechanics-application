"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-ink/60">Try reloading, or head home.</p>
      <div className="flex justify-center gap-3 pt-2">
        <button onClick={reset} className="btn-secondary px-4 py-2 text-sm">
          Try again
        </button>
        <Link href="/" className="btn-secondary px-4 py-2 text-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
