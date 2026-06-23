export default function Loading() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="h-9 w-40 animate-pulse rounded bg-black/5" />
        <div className="h-4 w-96 animate-pulse rounded bg-black/5" />
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="h-44 animate-pulse rounded-xl border border-line bg-black/5" />
        ))}
      </ul>
    </div>
  );
}
