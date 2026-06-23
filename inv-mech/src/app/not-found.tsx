import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Not found</h1>
      <p className="text-ink/60">
        We couldn&apos;t find what you were looking for. It may have moved or never existed.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Link href="/" className="btn-secondary px-4 py-2 text-sm">
          Home
        </Link>
        <Link href="/schedule" className="btn-secondary px-4 py-2 text-sm">
          Lecture schedule
        </Link>
      </div>
    </div>
  );
}
