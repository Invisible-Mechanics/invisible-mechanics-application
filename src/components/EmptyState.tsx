import Link from "next/link";

export function EmptyState({
  heading,
  body,
  cta,
}: {
  heading: string;
  body?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <p className="font-medium">{heading}</p>
      {body && <p className="mt-1 text-sm text-ink/60">{body}</p>}
      {cta && (
        <Link href={cta.href} className="btn-secondary mt-4 px-4 py-1.5 text-sm">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
