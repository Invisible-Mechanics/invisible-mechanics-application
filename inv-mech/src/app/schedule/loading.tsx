export default function Loading() {
  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <div className="h-9 w-40 animate-pulse rounded bg-black/5" />
        <div className="h-4 w-72 animate-pulse rounded bg-black/5" />
      </header>
      <section className="space-y-4">
        <div className="h-6 w-24 animate-pulse rounded bg-black/5" />
        <div className="space-y-px overflow-hidden rounded-xl border border-line">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between bg-white px-4 py-4">
              <div className="space-y-2">
                <div className="h-4 w-64 animate-pulse rounded bg-black/5" />
                <div className="h-3 w-40 animate-pulse rounded bg-black/5" />
              </div>
              <div className="h-7 w-20 animate-pulse rounded bg-black/5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
