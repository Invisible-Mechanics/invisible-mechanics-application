"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-10">
      <h1 className="text-2xl font-semibold">Couldn&apos;t load the schedule</h1>
      <p className="text-sm text-ink/70">Something went wrong on our end.</p>
      <button onClick={reset} className="btn-secondary px-3 py-1.5 text-sm">
        Try again
      </button>
    </div>
  );
}
